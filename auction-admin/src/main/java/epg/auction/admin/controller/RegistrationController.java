package epg.auction.admin.controller;

import epg.auction.admin.entity.*;
import epg.auction.admin.repository.*;
import epg.auction.admin.service.CompanyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/registrations")
public class RegistrationController {

    @Autowired
    private RegisterRequestRepository registerRequestRepository;

    @Autowired
    private CompanyRepository companyRepository;

    @Autowired
    private DictionaryItemRepository dictionaryItemRepository;

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

    @PostMapping("/{id}/createCompany")
    public ResponseEntity<?> approve(@PathVariable Integer id) {
        return registerRequestRepository.findById(id).map(req -> {
            try {
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
                company.setCreateUserId("admin");

                dictionaryItemRepository.findByKey("key.companyStatus.active")
                        .ifPresent(company::setStatus);

                Company saved = companyRepository.save(company);

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

    @PostMapping("/{id}/reject")
    public ResponseEntity<?> reject(@PathVariable Integer id) {
        return registerRequestRepository.findById(id).map(req -> {
            dictionaryItemRepository.findByKey("key.registration.cancelled")
                    .ifPresent(status -> {
                        req.setStatus(status);
                        registerRequestRepository.save(req);
                    });
            return ResponseEntity.ok(Map.of("success", true));
        }).orElse(ResponseEntity.notFound().build());
    }
}