package epg.auction.admin.entity;

import jakarta.persistence.*;
import java.io.Serializable;
import java.util.Date;

@Entity
@Table(name = "AUCTION_LOG")
public class AuctionLog extends MainEntity implements Serializable {

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

    @Column(name = "LOGKEY")
    private String logKey;

    @Column(name = "LOGDATE")
    private Date logDate;

    @Column(name = "\"VALUES\"")
    private String values;

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public String getRecordKey() { return recordKey; }
    public void setRecordKey(String recordKey) { this.recordKey = recordKey; }
    public Auction getAuction() { return auction; }
    public void setAuction(Auction auction) { this.auction = auction; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public String getLogKey() { return logKey; }
    public void setLogKey(String logKey) { this.logKey = logKey; }
    public Date getLogDate() { return logDate; }
    public void setLogDate(Date logDate) { this.logDate = logDate; }
    public String getValues() { return values; }
    public void setValues(String values) { this.values = values; }
}