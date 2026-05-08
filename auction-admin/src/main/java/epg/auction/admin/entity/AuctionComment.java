package epg.auction.admin.entity;

import jakarta.persistence.*;
import java.io.Serializable;
import java.util.Date;

@Entity
@Table(name = "AUCTION_COMMENT")
public class AuctionComment extends MainEntity implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Integer id;

    @Column(name = "RECORDKEY")
    private String recordKey;

    @ManyToOne
    @JoinColumn(name = "AUCTION_ID")
    private Auction auction;

    @ManyToOne
    @JoinColumn(name = "USER_ID")
    private User user;

    @ManyToOne
    @JoinColumn(name = "COMPANY_ID")
    private Company company;

    @ManyToOne
    @JoinColumn(name = "STATUS_KEY")
    private DictionaryItem status;

    @Column(name = "COMM_TEXT")
    private String commText;

    @Column(name = "COMM_CREATED")
    private Date commCreated;

    @Column(name = "COMM_ADMIN")
    private Boolean admin;

    @Column(name = "ANSWER_TOKEY")
    private String answerToKey;

    @Column(name = "PARAMS")
    private String parameters;

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public String getRecordKey() { return recordKey; }
    public void setRecordKey(String recordKey) { this.recordKey = recordKey; }
    public Auction getAuction() { return auction; }
    public void setAuction(Auction auction) { this.auction = auction; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public Company getCompany() { return company; }
    public void setCompany(Company company) { this.company = company; }
    public DictionaryItem getStatus() { return status; }
    public void setStatus(DictionaryItem status) { this.status = status; }
    public String getCommText() { return commText; }
    public void setCommText(String commText) { this.commText = commText; }
    public Date getCommCreated() { return commCreated; }
    public void setCommCreated(Date commCreated) { this.commCreated = commCreated; }
    public Boolean getAdmin() { return admin; }
    public void setAdmin(Boolean admin) { this.admin = admin; }
    public String getAnswerToKey() { return answerToKey; }
    public void setAnswerToKey(String answerToKey) { this.answerToKey = answerToKey; }
    public String getParameters() { return parameters; }
    public void setParameters(String parameters) { this.parameters = parameters; }
}