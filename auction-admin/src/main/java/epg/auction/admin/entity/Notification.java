package epg.auction.admin.entity;

import jakarta.persistence.*;
import java.io.Serializable;
import java.util.Date;

@Entity
@Table(name = "NOTIFICATION")
public class Notification extends MainEntity implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "RECORDKEY")
    private String recordKey;

    @ManyToOne
    @JoinColumn(name = "COMPANY_ID")
    private Company company;

    @ManyToOne
    @JoinColumn(name = "AUCTION_ID")
    private Auction auction;

    @Column(name = "IS_SMS")
    private Boolean sms;

    @Column(name = "IS_EMAIL")
    private Boolean email;

    @Column(name = "SEND_SUBJECT")
    private String sendSubject;

    @Column(name = "SEND_TEXT")
    private String sendText;

    @Column(name = "SMS_STATUS")
    private int smsStatus;

    @Column(name = "EMAIL_STATUS")
    private int emailStatus;

    @Column(name = "SMS_SEND_DATE")
    private Date smsSendDate;

    @Column(name = "EMAIL_SEND_DATE")
    private Date emailSendDate;

    @Column(name = "SMSID")
    private String smsId;

    @Column(name = "SMS_RET_CODE")
    private String smsReturnedCode;

    @Column(name = "SMS_DELIV_CODE")
    private String smsDeliveryCode;

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public String getRecordKey() { return recordKey; }
    public void setRecordKey(String recordKey) { this.recordKey = recordKey; }
    public Company getCompany() { return company; }
    public void setCompany(Company company) { this.company = company; }
    public Auction getAuction() { return auction; }
    public void setAuction(Auction auction) { this.auction = auction; }
    public Boolean getSms() { return sms; }
    public void setSms(Boolean sms) { this.sms = sms; }
    public Boolean getEmail() { return email; }
    public void setEmail(Boolean email) { this.email = email; }
    public String getSendSubject() { return sendSubject; }
    public void setSendSubject(String sendSubject) { this.sendSubject = sendSubject; }
    public String getSendText() { return sendText; }
    public void setSendText(String sendText) { this.sendText = sendText; }
    public int getSmsStatus() { return smsStatus; }
    public void setSmsStatus(int smsStatus) { this.smsStatus = smsStatus; }
    public int getEmailStatus() { return emailStatus; }
    public void setEmailStatus(int emailStatus) { this.emailStatus = emailStatus; }
    public Date getSmsSendDate() { return smsSendDate; }
    public void setSmsSendDate(Date smsSendDate) { this.smsSendDate = smsSendDate; }
    public Date getEmailSendDate() { return emailSendDate; }
    public void setEmailSendDate(Date emailSendDate) { this.emailSendDate = emailSendDate; }
    public String getSmsId() { return smsId; }
    public void setSmsId(String smsId) { this.smsId = smsId; }
    public String getSmsReturnedCode() { return smsReturnedCode; }
    public void setSmsReturnedCode(String smsReturnedCode) { this.smsReturnedCode = smsReturnedCode; }
    public String getSmsDeliveryCode() { return smsDeliveryCode; }
    public void setSmsDeliveryCode(String smsDeliveryCode) { this.smsDeliveryCode = smsDeliveryCode; }
}