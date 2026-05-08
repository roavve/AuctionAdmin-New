package epg.auction.admin.entity;

import jakarta.persistence.*;
import java.io.Serializable;
import java.util.Date;

@Entity
@Table(name = "USER_USER")
public class User extends MainEntity implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "COMPANY_ID")
    private Company company;

    @Column(name = "RECORD_KEY")
    private String recordKey;

    @Column(name = "ROLE")
    private String role;

    @Column(name = "IS_INTERNAL")
    private Boolean internal;

    @Column(name = "FIRST_NAME")
    private String firstName;

    @Column(name = "LAST_NAME")
    private String lastName;

    @Column(name = "USER_NAME")
    private String email;

    @Column(name = "USER_PASS")
    private String password;

    @Column(name = "CONTACT_POSITION")
    private String contactPosition;

    @Column(name = "CONTACT_MAIL")
    private String contactEmail;

    @Column(name = "CONTACT_PHONE")
    private String contactPhone;

    @Column(name = "CONTACT_MOBILE")
    private String contactMobile;

    @Column(name = "REGISTER_DATE")
    private Date registerDate;

    @Column(name = "ACTIVATE_DATE")
    private Date activateDate;

    @Column(name = "IS_ACTIVE")
    private Boolean active;

    @Column(name = "IS_LOCKED")
    private Boolean locked;

    @Column(name = "LOCK_DATE")
    private Date lockDate;

    @Column(name = "CANCELL_DATE")
    private Date cancelledDate;
    @Column(name = "LOGIN_DATE")
    private Date loginDate;

    @Column(name = "IS_CANCELLED")
    private Boolean cancelled;

    @Column(name = "USER_STATUS")
    private int status;

    @Column(name = "IS_EXTERNAL")
    private Boolean external;

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public Company getCompany() { return company; }
    public void setCompany(Company company) { this.company = company; }
    public String getRecordKey() { return recordKey; }
    public void setRecordKey(String recordKey) { this.recordKey = recordKey; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public Boolean getInternal() { return internal; }
    public void setInternal(Boolean internal) { this.internal = internal; }
    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getContactPosition() { return contactPosition; }
    public void setContactPosition(String contactPosition) { this.contactPosition = contactPosition; }
    public String getContactEmail() { return contactEmail; }
    public void setContactEmail(String contactEmail) { this.contactEmail = contactEmail; }
    public String getContactPhone() { return contactPhone; }
    public void setContactPhone(String contactPhone) { this.contactPhone = contactPhone; }
    public String getContactMobile() { return contactMobile; }
    public void setContactMobile(String contactMobile) { this.contactMobile = contactMobile; }
    public Date getRegisterDate() { return registerDate; }
    public void setRegisterDate(Date registerDate) { this.registerDate = registerDate; }
    public Date getActivateDate() { return activateDate; }
    public void setActivateDate(Date activateDate) { this.activateDate = activateDate; }
    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }
    public Boolean getLocked() { return locked; }
    public void setLocked(Boolean locked) { this.locked = locked; }
    public Date getLoginDate() { return loginDate; }
    public void setLoginDate(Date loginDate) { this.loginDate = loginDate; }
    public Boolean getCancelled() { return cancelled; }
    public void setCancelled(Boolean cancelled) { this.cancelled = cancelled; }
    public Date getLockDate() { return lockDate; }
    public void setLockDate(Date lockDate) { this.lockDate = lockDate; }
    public Date getCancelledDate() { return cancelledDate; }
    public void setCancelledDate(Date cancelledDate) { this.cancelledDate = cancelledDate; }
    public int getStatus() { return status; }
    public void setStatus(int status) { this.status = status; }
    public Boolean getExternal() { return external; }
    public void setExternal(Boolean external) { this.external = external; }
}