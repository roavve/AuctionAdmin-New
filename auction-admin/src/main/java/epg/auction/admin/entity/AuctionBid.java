package epg.auction.admin.entity;

import jakarta.persistence.*;
import java.io.Serializable;
import java.util.Date;

@Entity
@Table(name = "AUCTION_BID")
public class AuctionBid extends MainEntity implements Serializable {

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

    @Column(name = "BID_VALUE")
    private Double bidValue;

    @Column(name = "DATETIME")
    private Date bidDate;

    @ManyToOne
    @JoinColumn(name = "STATUS_KEY")
    private DictionaryItem status;

    @Column(name = "BID_PERIOD")
    private Integer bidPeriod;

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public String getRecordKey() { return recordKey; }
    public void setRecordKey(String recordKey) { this.recordKey = recordKey; }
    public Auction getAuction() { return auction; }
    public void setAuction(Auction auction) { this.auction = auction; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public Double getBidValue() { return bidValue; }
    public void setBidValue(Double bidValue) { this.bidValue = bidValue; }
    public Date getBidDate() { return bidDate; }
    public void setBidDate(Date bidDate) { this.bidDate = bidDate; }
    public DictionaryItem getStatus() { return status; }
    public void setStatus(DictionaryItem status) { this.status = status; }
    public Integer getBidPeriod() { return bidPeriod; }
    public void setBidPeriod(Integer bidPeriod) { this.bidPeriod = bidPeriod; }
}