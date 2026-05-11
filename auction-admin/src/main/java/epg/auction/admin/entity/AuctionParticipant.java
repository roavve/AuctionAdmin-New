package epg.auction.admin.entity;

import jakarta.persistence.*;
import java.io.Serializable;
import java.util.Date;

@Entity
@Table(name = "AUCTION_PARTICIPANT")
public class AuctionParticipant extends MainEntity implements Serializable {

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

    @Column(name = "DATE_ADDED")
    private Date dateAdded;

    @Column(name = "DATE_EXITED")
    private Date dateExited;

    @Column(name = "DATE_CANCELLED")
    private Date dateCancelled;

    @Column(name = "WINNER")
    private Boolean winner;

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
    public Date getDateAdded() { return dateAdded; }
    public void setDateAdded(Date dateAdded) { this.dateAdded = dateAdded; }
    public Date getDateExited() { return dateExited; }
    public void setDateExited(Date dateExited) { this.dateExited = dateExited; }
    public Date getDateCancelled() { return dateCancelled; }
    public void setDateCancelled(Date dateCancelled) { this.dateCancelled = dateCancelled; }
    public Boolean getWinner() { return winner; }
    public void setWinner(Boolean winner) { this.winner = winner; }
}