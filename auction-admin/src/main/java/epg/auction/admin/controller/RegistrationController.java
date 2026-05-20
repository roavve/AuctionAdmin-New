package epg.auction.admin.controller;

import epg.auction.admin.entity.*;
import epg.auction.admin.repository.*;
import epg.auction.admin.service.EmailService;
import epg.auction.admin.service.SmsService;
import epg.auction.admin.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletResponse;

import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/registrations")
public class RegistrationController {

    @Autowired private RegisterRequestRepository registerRequestRepository;
    @Autowired private CompanyRepository companyRepository;
    @Autowired private DictionaryItemRepository dictionaryItemRepository;
    @Autowired private RegisterRequestFileRepository registerRequestFileRepository;
    @Autowired private CompanyFileRepository companyFileRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private EmailService emailService;
    @Autowired private SmsService smsService;

    @GetMapping("/new")
    public Page<RegisterRequest> getNew(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return registerRequestRepository.findNewRequests(PageRequest.of(page, size));
    }

    @GetMapping("/processed")
    public Page<RegisterRequest> getProcessed(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return registerRequestRepository.findProcessedRequests(PageRequest.of(page, size));
    }

    @GetMapping("/cancelled")
    public Page<RegisterRequest> getCancelled(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return registerRequestRepository.findCancelledRequests(PageRequest.of(page, size));
    }

    @GetMapping("/{id}")
    public ResponseEntity<RegisterRequest> getById(@PathVariable Integer id) {
        return registerRequestRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/policy")
    public void downloadPolicy(@PathVariable Integer id, HttpServletResponse response) {
        registerRequestRepository.findById(id).ifPresent(req -> {
            try {
                if (req.getPolicyFile() != null) {
                    response.setContentType("application/octet-stream");
                    response.setHeader("Content-Disposition",
                            "attachment; filename=\"" + req.getPolicyFileName() + "\"");
                    response.getOutputStream().write(req.getPolicyFile());
                    response.flushBuffer();
                }
            } catch (Exception e) {
                response.setStatus(404);
            }
        });
    }

    @PostMapping("/{id}/createCompany")
    public ResponseEntity<?> approve(@PathVariable Integer id, Authentication auth) {
        return registerRequestRepository.findById(id).map(req -> {
            try {
                // Create company
                Company company = new Company();
                company.setRecordKey(UUID.randomUUID().toString());
                company.setCompanyName(req.getCompanyName());
                company.setTaxId(req.getTaxId());
                company.setBusinessDesc(req.getBusinessDesc());
                company.setPhisAddress(req.getPhisAddress());
                company.setLegalAddress(req.getLegalAddress());
                company.setVatPayer(req.getVatPayer());
                company.setBankCode1(req.getBankCode1());
                company.setBankAccount1(req.getBankAccount1());
                company.setContactEmail(req.getContactEmail());
                company.setContactPhone(req.getContactPhone());
                company.setContactName(req.getContactName());
                company.setContactSurname(req.getContactSurname());
                company.setContactPosition(req.getContactPosition());
                company.setContactMobile(req.getContactMobile());
                company.setWebSite(req.getWebSite());
                company.setCategory(req.getCategory());
                company.setType(req.getCompanyType());
                company.setFlowDateCreated(new Date());
                company.setFlowDateActivated(new Date());
                company.setFromReqId(req.getId());
                company.setCreateUserId(auth.getName());

                dictionaryItemRepository.findByKey("key.companyStatus.active")
                        .ifPresent(company::setStatus);

                Company saved = companyRepository.save(company);

                // Copy registration files to company files
                List<RegisterRequestFile> reqFiles =
                        registerRequestFileRepository.findByRequestId(id);
                for (RegisterRequestFile rf : reqFiles) {
                    CompanyFile cf = new CompanyFile();
                    cf.setRecordKey(UUID.randomUUID().toString());
                    cf.setCompany(saved);
                    cf.setFileName(rf.getFileName());
                    cf.setFileFormat(rf.getFileFormat());
                    cf.setFileSize(rf.getFileSize());
                    cf.setFileData(rf.getFileData());
                    cf.setFileDescription(rf.getFileDescription());
                    cf.setFileDate(new Date());
                    cf.setFileUser(auth.getName());
                    cf.setCreateUserId(auth.getName());
                    companyFileRepository.save(cf);
                }

                // Create user account for contact person
                User user = new User();
                user.setRecordKey(UUID.randomUUID().toString());
                user.setEmail(req.getContactEmail());
                user.setFirstName(req.getContactName());
                user.setLastName(req.getContactSurname());
                user.setContactPosition(req.getContactPosition());
                user.setContactMobile(req.getContactMobile());
                user.setContactEmail(req.getContactEmail());
                user.setContactPhone(req.getContactPhone());
                user.setCompany(saved);
                user.setRole("ROLE_USER");
                user.setActive(true);
                user.setExternal(true);
                user.setInternal(false);
                user.setRegisterDate(new Date());
                user.setCreateUserId(auth.getName());
                user.setStatus(1);
                user.setLocked(false);
                user.setCancelled(false);

                String rawPassword = UUID.randomUUID().toString().substring(0, 8);
                user.setPassword(UserService.hashPassword(rawPassword));
                userRepository.save(user);

                // Send email using template
                Map<String, String> vars = new HashMap<>();
                vars.put("email", req.getContactEmail());
                vars.put("password", rawPassword);
                vars.put("companyName", req.getCompanyName());
                emailService.sendTemplatedEmail(req.getContactEmail(),
                        "key.template.registrationApproved", vars);

                // Send SMS
                if (req.getContactMobile() != null) {
                    smsService.sendSms(req.getContactMobile(),
                            "Registration approved. Login: " + req.getContactEmail() +
                                    " Pass: " + rawPassword);
                }

                // Update request status
                dictionaryItemRepository.findByKey("key.registration.processed")
                        .ifPresent(status -> {
                            req.setStatus(status);
                            registerRequestRepository.save(req);
                        });

                return ResponseEntity.ok(Map.of("success", true, "companyId", saved.getId()));
            } catch (Exception e) {
                return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
            }
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/acceptPolicy")
    public ResponseEntity<?> acceptPolicy(@PathVariable Integer id) {
        return registerRequestRepository.findById(id).map(req -> {
            req.setPolicyAccepted(true);
            registerRequestRepository.save(req);
            return ResponseEntity.ok(Map.of("success", true));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<?> reject(@PathVariable Integer id, Authentication auth) {
        return registerRequestRepository.findById(id).map(req -> {
            dictionaryItemRepository.findByKey("key.registration.cancelled")
                    .ifPresent(status -> {
                        req.setStatus(status);
                        registerRequestRepository.save(req);
                    });

            // Send rejection email using template
            Map<String, String> vars = new HashMap<>();
            vars.put("companyName", req.getCompanyName());
            emailService.sendTemplatedEmail(req.getContactEmail(),
                    "key.template.registrationRejected", vars);

            return ResponseEntity.ok(Map.of("success", true));
        }).orElse(ResponseEntity.notFound().build());
    }
}