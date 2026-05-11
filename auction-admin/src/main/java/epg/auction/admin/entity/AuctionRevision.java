package epg.auction.admin.entity;

import jakarta.persistence.*;
import java.io.Serializable;
import java.util.Date;

@Entity
@Table(name = "auction_revision")
public class AuctionRevision extends MainEntity implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "RECORDKEY")
    private String recordKey;

    @ManyToOne
    @JoinColumn(name = "AUCTION_ID")
    private Auction auction;

    @Column(name = "REVISION_NUM")
    private Integer revisionNum;

    @Column(name = "REVISION_DATE")
    private Date revisionDate;

    @Column(name = "IS_CURRENT")
    private Boolean current;

    @Column(name = "CREATE_USER")
    private String createUser;

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public String getRecordKey() { return recordKey; }
    public void setRecordKey(String recordKey) { this.recordKey = recordKey; }
    public Auction getAuction() { return auction; }
    public void setAuction(Auction auction) { this.auction = auction; }
    public Integer getRevisionNum() { return revisionNum; }
    public void setRevisionNum(Integer revisionNum) { this.revisionNum = revisionNum; }
    public Date getRevisionDate() { return revisionDate; }
    public void setRevisionDate(Date revisionDate) { this.revisionDate = revisionDate; }
    public Boolean getCurrent() { return current; }
    public void setCurrent(Boolean current) { this.current = current; }
    public String getCreateUser() { return createUser; }
    public void setCreateUser(String createUser) { this.createUser = createUser; }
}