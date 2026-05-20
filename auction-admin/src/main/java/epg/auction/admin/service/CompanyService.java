package epg.auction.admin.service;

import epg.auction.admin.entity.*;
import epg.auction.admin.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
public class CompanyService {

    private final UserRepository userRepository;
    private final DictionaryItemRepository dictionaryItemRepository;
    private final EmailService emailService;
    private final SmsService smsService;
    private final CompanyRepository companyRepository;

    public CompanyService(UserRepository userRepository,
                          DictionaryItemRepository dictionaryItemRepository,
                          EmailService emailService,
                          SmsService smsService,
                          CompanyRepository companyRepository) {
        this.userRepository = userRepository;
        this.dictionaryItemRepository = dictionaryItemRepository;
        this.emailService = emailService;
        this.smsService = smsService;
        this.companyRepository = companyRepository;
    }

    private DictionaryItem getStatusByKey(String key) {
        return dictionaryItemRepository.findByKey(key)
                .orElseThrow(() -> new RuntimeException("Status not found: " + key));
    }

    public List<Company> getAll() { return companyRepository.findAll(); }

    public Optional<Company> getById(Integer id) { return companyRepository.findById(id); }

    @Transactional
    public Company save(Company company) { return companyRepository.save(company); }

    @Transactional
    public Company createCompany(Company company, String userId) {
        company.setRecordKey(UUID.randomUUID().toString());
        company.setFlowDateCreated(new Date());
        company.setFlowCreatedBy(userId);
        company.setCreateUserId(userId);
        company.setStatus(getStatusByKey("key.companyStatus.created"));
        return companyRepository.save(company);
    }

    @Transactional
    public void inviteCompany(Integer companyId, String userId) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new RuntimeException("Company not found"));

        User user = new User();
        user.setRecordKey(UUID.randomUUID().toString());
        user.setEmail(company.getContactEmail());
        user.setFirstName(company.getContactName());
        user.setLastName(company.getContactSurname());
        user.setContactPosition(company.getContactPosition());
        user.setContactMobile(company.getContactMobile());
        user.setContactEmail(company.getContactEmail());
        user.setContactPhone(company.getContactPhone());
        user.setCompany(company);
        user.setRole("ROLE_USER");
        user.setActive(true);
        user.setExternal(true);
        user.setInternal(false);
        user.setRegisterDate(new Date());
        user.setCreateUserId(userId);
        user.setStatus(1);
        user.setLocked(false);
        user.setCancelled(false);

        String rawPassword = UUID.randomUUID().toString().substring(0, 8);
        user.setPassword(UserService.hashPassword(rawPassword));
        userRepository.save(user);

        dictionaryItemRepository.findByKey("key.companyStatus.active")
                .ifPresent(company::setStatus);
        company.setFlowDateActivated(new Date());
        companyRepository.save(company);

        Map<String, String> vars = new HashMap<>();
        vars.put("email", company.getContactEmail());
        vars.put("password", rawPassword);
        vars.put("companyName", company.getCompanyName());
        emailService.sendTemplatedEmail(company.getContactEmail(),
                "key.template.registrationApproved", vars);

        if (company.getContactMobile() != null) {
            smsService.sendSms(company.getContactMobile(),
                    "You have been invited. Login: " + company.getContactEmail() +
                            " Pass: " + rawPassword);
        }
    }

    @Transactional
    public Company updateCompany(Integer id, Company company, String userId) {
        Company original = companyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Company not found: " + id));
        original.setCompanyName(company.getCompanyName());
        original.setTaxId(company.getTaxId());
        original.setBusinessDesc(company.getBusinessDesc());
        original.setPhisAddress(company.getPhisAddress());
        original.setLegalAddress(company.getLegalAddress());
        original.setVatPayer(company.getVatPayer());
        original.setBankCode1(company.getBankCode1());
        original.setBankAccount1(company.getBankAccount1());
        original.setNote(company.getNote());
        original.setContactEmail(company.getContactEmail());
        original.setContactPhone(company.getContactPhone());
        original.setContactName(company.getContactName());
        original.setContactSurname(company.getContactSurname());
        original.setContactPosition(company.getContactPosition());
        original.setContactMobile(company.getContactMobile());
        original.setWebSite(company.getWebSite());
        original.setType(company.getType());
        original.setCategory(company.getCategory());
        original.setSubCategory(company.getSubCategory());
        original.setModifyDate(new Date());
        original.setModifyUserId(userId);
        return companyRepository.save(original);
    }

    @Transactional
    public void cancelCompany(Integer id, String userId) {
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Company not found"));
        company.setStatus(getStatusByKey("key.companyStatus.cancelled"));
        company.setFlowDateCancelled(new Date());
        company.setFlowCancelledBy(userId);
        company.setModifyUserId(userId);
        companyRepository.save(company);
    }

    public List<User> getUsersByCompany(Integer companyId) {
        return userRepository.findByCompanyId(companyId);
    }

    @Transactional
    public void delete(Integer id) { companyRepository.deleteById(id); }
}