package epg.auction.admin.service;

import epg.auction.admin.entity.*;
import epg.auction.admin.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class CompanyService {
    @Autowired private epg.auction.admin.repository.UserRepository userRepository;
    @Autowired private epg.auction.admin.repository.DictionaryItemRepository dictionaryItemRepository;
    @Autowired private epg.auction.admin.service.EmailService emailService;
    @Autowired private epg.auction.admin.service.SmsService smsService;
    @Autowired private CompanyRepository companyRepository;


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

        // Create user account for company contact
        User user = new User();
        user.setRecordKey(java.util.UUID.randomUUID().toString());
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
        user.setRegisterDate(new java.util.Date());
        user.setCreateUserId(userId);
        user.setStatus(1);
        user.setLocked(false);
        user.setCancelled(false);

        String rawPassword = java.util.UUID.randomUUID().toString().substring(0, 8);
        user.setPassword(epg.auction.admin.service.UserService.hashPassword(rawPassword));
        userRepository.save(user);

        // Update company status to active
        dictionaryItemRepository.findByKey("key.companyStatus.active")
                .ifPresent(company::setStatus);
        company.setFlowDateActivated(new java.util.Date());
        companyRepository.save(company);

        // Send email with credentials
        emailService.sendEmail(
                company.getContactEmail(),
                "მოწვევა / Company Invitation",
                "<p>თქვენი კომპანია მოწვეულია სისტემაში.</p>" +
                        "<p>Your company has been invited to the system.</p>" +
                        "<p>Email: " + company.getContactEmail() + "</p>" +
                        "<p>Password: " + rawPassword + "</p>"
        );

        // Send SMS
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