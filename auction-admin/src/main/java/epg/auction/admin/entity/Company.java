package epg.auction.admin.entity;

import jakarta.persistence.*;
import java.io.Serializable;
import java.util.Date;

@Entity
@Table(name = "COMPANY")
public class Company extends MainEntity implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "RECORD_KEY")
    private String recordKey;

    @Column(name = "NAME")
    private String companyName;

    @ManyToOne
    @JoinColumn(name = "TYPE_KEY")
    private DictionaryItem type;

    @ManyToOne
    @JoinColumn(name = "STATUS_KEY")
    private DictionaryItem status;

    @ManyToOne
    @JoinColumn(name = "CATEGORY_ID")
    private Category category;

    @ManyToOne
    @JoinColumn(name = "SUB_CATEGORY_ID")
    private Category subCategory;

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

    @Column(name = "BANK_CODE1")
    private String bankCode1;

    @Column(name = "BANK_ACCOUNT1")
    private String bankAccount1;

    @Column(name = "NOTE")
    private String note;

    @Column(name = "FLOW_DATE_CREATED")
    private Date flowDateCreated;

    @Column(name = "FLOW_DATE_ACTIVATED")
    private Date flowDateActivated;

    @Column(name = "FLOW_DATE_CANCELLED")
    private Date flowDateCancelled;

    @Column(name = "FLOW_CREATED_BY")
    private String flowCreatedBy;

    @Column(name = "FLOW_CANCELLED_BY")
    private String flowCancelledBy;

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

    @Column(name = "FROM_REQ_ID")
    private Integer fromReqId;

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public String getRecordKey() { return recordKey; }
    public void setRecordKey(String recordKey) { this.recordKey = recordKey; }
    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }
    public DictionaryItem getType() { return type; }
    public void setType(DictionaryItem type) { this.type = type; }
    public DictionaryItem getStatus() { return status; }
    public void setStatus(DictionaryItem status) { this.status = status; }
    public Category getCategory() { return category; }
    public void setCategory(Category category) { this.category = category; }
    public Category getSubCategory() { return subCategory; }
    public void setSubCategory(Category subCategory) { this.subCategory = subCategory; }
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
    public String getBankCode1() { return bankCode1; }
    public void setBankCode1(String bankCode1) { this.bankCode1 = bankCode1; }
    public String getBankAccount1() { return bankAccount1; }
    public void setBankAccount1(String bankAccount1) { this.bankAccount1 = bankAccount1; }
    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
    public Date getFlowDateCreated() { return flowDateCreated; }
    public void setFlowDateCreated(Date flowDateCreated) { this.flowDateCreated = flowDateCreated; }
    public Date getFlowDateActivated() { return flowDateActivated; }
    public void setFlowDateActivated(Date flowDateActivated) { this.flowDateActivated = flowDateActivated; }
    public Date getFlowDateCancelled() { return flowDateCancelled; }
    public void setFlowDateCancelled(Date flowDateCancelled) { this.flowDateCancelled = flowDateCancelled; }
    public String getFlowCreatedBy() { return flowCreatedBy; }
    public void setFlowCreatedBy(String flowCreatedBy) { this.flowCreatedBy = flowCreatedBy; }
    public String getFlowCancelledBy() { return flowCancelledBy; }
    public void setFlowCancelledBy(String flowCancelledBy) { this.flowCancelledBy = flowCancelledBy; }
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
    public Integer getFromReqId() { return fromReqId; }
    public void setFromReqId(Integer fromReqId) { this.fromReqId = fromReqId; }
}