package epg.auction.admin.entity;

import jakarta.persistence.*;
import java.io.Serializable;
import java.util.Date;

@Entity
@Table(name = "AUCTION_INVITATION")
public class AuctionInvitation extends MainEntity implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "RECORDKEY")
    private String recordKey;

    @ManyToOne
    @JoinColumn(name = "COMPANY_ID")
    private Company company;

    @ManyToOne
    @JoinColumn(name = "COMP_USER_ID")
    private User companyUser;

    @ManyToOne
    @JoinColumn(name = "AUCTION_ID")
    private Auction auction;

    @ManyToOne
    @JoinColumn(name = "STATUS_KEY")
    private DictionaryItem status;

    @Column(name = "DATE_SELECTED")
    private Date dateSelected;

    @Column(name = "DATE_INVITED")
    private Date dateInvited;

    @Column(name = "DATE_RECEIVED")
    private Date dateReceived;

    @Column(name = "DATE_ACCEPTED")
    private Date dateAccepted;

    @Column(name = "DATE_REJECTED")
    private Date dateRejected;

    @Column(name = "CANCEL_DATE")
    private Date cancelDate;

    @Column(name = "CLOSE_DATE")
    private Date closeDate;

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public String getRecordKey() { return recordKey; }
    public void setRecordKey(String recordKey) { this.recordKey = recordKey; }
    public Company getCompany() { return company; }
    public void setCompany(Company company) { this.company = company; }
    public User getCompanyUser() { return companyUser; }
    public void setCompanyUser(User companyUser) { this.companyUser = companyUser; }
    public Auction getAuction() { return auction; }
    public void setAuction(Auction auction) { this.auction = auction; }
    public DictionaryItem getStatus() { return status; }
    public void setStatus(DictionaryItem status) { this.status = status; }
    public Date getDateSelected() { return dateSelected; }
    public void setDateSelected(Date dateSelected) { this.dateSelected = dateSelected; }
    public Date getDateInvited() { return dateInvited; }
    public void setDateInvited(Date dateInvited) { this.dateInvited = dateInvited; }
    public Date getDateReceived() { return dateReceived; }
    public void setDateReceived(Date dateReceived) { this.dateReceived = dateReceived; }
    public Date getDateAccepted() { return dateAccepted; }
    public void setDateAccepted(Date dateAccepted) { this.dateAccepted = dateAccepted; }
    public Date getDateRejected() { return dateRejected; }
    public void setDateRejected(Date dateRejected) { this.dateRejected = dateRejected; }
    public Date getCancelDate() { return cancelDate; }
    public void setCancelDate(Date cancelDate) { this.cancelDate = cancelDate; }
    public Date getCloseDate() { return closeDate; }
    public void setCloseDate(Date closeDate) { this.closeDate = closeDate; }
}