package epg.auction.admin.entity;

import jakarta.persistence.*;
import java.io.Serializable;
import java.util.Date;

@Entity
@Table(name = "REGISTER_REQUEST")
public class RegisterRequest extends MainEntity implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Integer id;

    @Column(name = "RECORDKEY")
    private String recordKey;

    @Column(name = "NAME")
    private String companyName;

    @ManyToOne
    @JoinColumn(name = "TYPE_KEY")
    private DictionaryItem companyType;

    @ManyToOne
    @JoinColumn(name = "CATEGORY_ID")
    private Category category;

    @Column(name = "TAXID")
    private String taxId;

    @Column(name = "BUSINESS_DESC")
    private String businessDesc;

    @Column(name = "PHIS_ADDRESS")
    private String phisAddress;

    @Column(name = "LEGAL_ADDRESS")
    private String legalAddress;

    @Column(name = "IS_VAT_PAYER")
    private Boolean vatPayer;

    @Column(name = "REQ_DATE")
    private Date requestDate;

    @ManyToOne
    @JoinColumn(name = "STATUS_KEY")
    private DictionaryItem status;

    @Column(name = "BANK_CODE1")
    private String bankCode1;

    @Column(name = "BANK_ACCOUNT1")
    private String bankAccount1;

    @Column(name = "CONTACT_EMAIL")
    private String contactEmail;

    @Column(name = "CONTACT_PHONE")
    private String contactPhone;

    @Column(name = "CONTACT_NAME")
    private String contactName;

    @Column(name = "CONTACT_LASTNAME")
    private String contactSurname;

    @Column(name = "CONTACT_POSITION")
    private String contactPosition;

    @Column(name = "CONTACT_MOBILE")
    private String contactMobile;

    @Column(name = "WEB_SITE")
    private String webSite;

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public String getRecordKey() { return recordKey; }
    public void setRecordKey(String recordKey) { this.recordKey = recordKey; }
    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }
    public DictionaryItem getCompanyType() { return companyType; }
    public void setCompanyType(DictionaryItem companyType) { this.companyType = companyType; }
    public Category getCategory() { return category; }
    public void setCategory(Category category) { this.category = category; }
    public String getTaxId() { return taxId; }
    public void setTaxId(String taxId) { this.taxId = taxId; }
    public String getBusinessDesc() { return businessDesc; }
    public void setBusinessDesc(String businessDesc) { this.businessDesc = businessDesc; }
    public String getPhisAddress() { return phisAddress; }
    public void setPhisAddress(String phisAddress) { this.phisAddress = phisAddress; }
    public String getLegalAddress() { return legalAddress; }
    public void setLegalAddress(String legalAddress) { this.legalAddress = legalAddress; }
    public Boolean getVatPayer() { return vatPayer; }
    public void setVatPayer(Boolean vatPayer) { this.vatPayer = vatPayer; }
    public Date getRequestDate() { return requestDate; }
    public void setRequestDate(Date requestDate) { this.requestDate = requestDate; }
    public DictionaryItem getStatus() { return status; }
    public void setStatus(DictionaryItem status) { this.status = status; }
    public String getBankCode1() { return bankCode1; }
    public void setBankCode1(String bankCode1) { this.bankCode1 = bankCode1; }
    public String getBankAccount1() { return bankAccount1; }
    public void setBankAccount1(String bankAccount1) { this.bankAccount1 = bankAccount1; }
    public String getContactEmail() { return contactEmail; }
    public void setContactEmail(String contactEmail) { this.contactEmail = contactEmail; }
    public String getContactPhone() { return contactPhone; }
    public void setContactPhone(String contactPhone) { this.contactPhone = contactPhone; }
    public String getContactName() { return contactName; }
    public void setContactName(String contactName) { this.contactName = contactName; }
    public String getContactSurname() { return contactSurname; }
    public void setContactSurname(String contactSurname) { this.contactSurname = contactSurname; }
    public String getContactPosition() { return contactPosition; }
    public void setContactPosition(String contactPosition) { this.contactPosition = contactPosition; }
    public String getContactMobile() { return contactMobile; }
    public void setContactMobile(String contactMobile) { this.contactMobile = contactMobile; }
    public String getWebSite() { return webSite; }
    public void setWebSite(String webSite) { this.webSite = webSite; }
}