package epg.auction.admin.entity;

import jakarta.persistence.*;
import java.io.Serializable;
import java.util.Date;

@Entity
@Table(name = "AUCTION")
public class Auction extends MainEntity implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "RECORDKEY")
    private String recordKey;

    @ManyToOne
    @JoinColumn(name = "AUCTION_TYPE")
    private DictionaryItem auctionType;

    @ManyToOne
    @JoinColumn(name = "ADMIN_ID")
    private User admin;

    @Column(name = "NAME")
    private String name;

    @Column(name = "\"DESC\"")
    private String desc;

    @ManyToOne
    @JoinColumn(name = "STATUS_KEY")
    private DictionaryItem status;

    @ManyToOne
    @JoinColumn(name = "AUCTION_STEP_KEY")
    private DictionaryItem auctionStep;

    @ManyToOne
    @JoinColumn(name = "AUCTION_PROJECT")
    private AuctionProject project;

    @ManyToOne
    @JoinColumn(name = "VALUE_TYPE_KEY")
    private DictionaryItem valueType;

    @Column(name = "QUANTITY")
    private Integer quantity;

    @ManyToOne
    @JoinColumn(name = "UOM_KEY")
    private DictionaryItem uom;

    @Column(name = "BID_STEP")
    private Double bidStep;

    @Column(name = "DISCUSS_START_DATE")
    private Date discussStartDate;

    @Column(name = "DISCUSS_END_DATE")
    private Date discussEndDate;

    @Column(name = "AUC_START_DATE")
    private Date auctionStartDate;

    @Column(name = "AUCT_END_DATE")
    private Date auctionEndDate;

    @Column(name = "INVITE_TEXT")
    private String inviteText;

    @Column(name = "START_BID_VALUE")
    private Double startBidValue;

    @Column(name = "MAX_BID_VALUE")
    private Double maxBidValue;

    @Column(name = "LAST_BID_VALUE")
    private Double lastBidValue;

    @Column(name = "LAST_BID_DATE")
    private Date lastBidDate;

    @Column(name = "LAST_BID_USER_ID")
    private Integer lastBidUser;

    @Column(name = "COUNT_INVIT")
    private Integer countInvitations;

    @Column(name = "COUNT_PART")
    private Integer countParticipants;

    @Column(name = "COUNT_ACTIVE")
    private Integer countActive;

    @Column(name = "COUNT_INACTIVE")
    private Integer countInactive;

    @Column(name = "ACTIVATE_DATE")
    private Date activateDate;

    @Column(name = "CANCEL_DATE")
    private Date cancelDate;

    @Column(name = "CLOSE_DATE")
    private Date closeDate;

    @Column(name = "SHOW_LAST_BID")
    private Boolean showLastBid;

    @Column(name = "START_DATE")
    private Date startDate;

    @Column(name = "END_DATE")
    private Date endDate;

    @Column(name = "START_TIME")
    private String startTime;

    @Column(name = "END_TIME")
    private String endTime;

    @Column(name = "ADDITIONAL_MINUTE")
    private Integer additionalMinute;

    @ManyToOne
    @JoinColumn(name = "CURRENCY_KEY")
    private DictionaryItem currency;

    @Column(name = "BID_START_DATE")
    private Date bidStartDate;

    @Column(name = "BID_END_DATE")
    private Date bidEndDate;

    @Column(name = "BID_START_TIME")
    private String bidStartTime;

    @Column(name = "BID_END_TIME")
    private String bidEndTime;

    @Column(name = "AUCTION_LAST_OFFER")
    private Double lastOffer;
    @Transient
    private Long allParticipants;

    @Transient
    private Long activeParticipants;

    public Long getAllParticipants() { return allParticipants; }
    public void setAllParticipants(Long allParticipants) { this.allParticipants = allParticipants; }
    public Long getActiveParticipants() { return activeParticipants; }
    public void setActiveParticipants(Long activeParticipants) { this.activeParticipants = activeParticipants; }
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public String getRecordKey() { return recordKey; }
    public void setRecordKey(String recordKey) { this.recordKey = recordKey; }
    public DictionaryItem getAuctionType() { return auctionType; }
    public void setAuctionType(DictionaryItem auctionType) { this.auctionType = auctionType; }
    public User getAdmin() { return admin; }
    public void setAdmin(User admin) { this.admin = admin; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDesc() { return desc; }
    public void setDesc(String desc) { this.desc = desc; }
    public DictionaryItem getStatus() { return status; }
    public void setStatus(DictionaryItem status) { this.status = status; }
    public DictionaryItem getAuctionStep() { return auctionStep; }
    public void setAuctionStep(DictionaryItem auctionStep) { this.auctionStep = auctionStep; }
    public AuctionProject getProject() { return project; }
    public void setProject(AuctionProject project) { this.project = project; }
    public DictionaryItem getValueType() { return valueType; }
    public void setValueType(DictionaryItem valueType) { this.valueType = valueType; }
    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
    public DictionaryItem getUom() { return uom; }
    public void setUom(DictionaryItem uom) { this.uom = uom; }
    public Double getBidStep() { return bidStep; }
    public void setBidStep(Double bidStep) { this.bidStep = bidStep; }
    public Date getDiscussStartDate() { return discussStartDate; }
    public void setDiscussStartDate(Date discussStartDate) { this.discussStartDate = discussStartDate; }
    public Date getDiscussEndDate() { return discussEndDate; }
    public void setDiscussEndDate(Date discussEndDate) { this.discussEndDate = discussEndDate; }
    public Date getAuctionStartDate() { return auctionStartDate; }
    public void setAuctionStartDate(Date auctionStartDate) { this.auctionStartDate = auctionStartDate; }
    public Date getAuctionEndDate() { return auctionEndDate; }
    public void setAuctionEndDate(Date auctionEndDate) { this.auctionEndDate = auctionEndDate; }
    public String getInviteText() { return inviteText; }
    public void setInviteText(String inviteText) { this.inviteText = inviteText; }
    public Double getStartBidValue() { return startBidValue; }
    public void setStartBidValue(Double startBidValue) { this.startBidValue = startBidValue; }
    public Double getMaxBidValue() { return maxBidValue; }
    public void setMaxBidValue(Double maxBidValue) { this.maxBidValue = maxBidValue; }
    public Double getLastBidValue() { return lastBidValue; }
    public void setLastBidValue(Double lastBidValue) { this.lastBidValue = lastBidValue; }
    public Date getLastBidDate() { return lastBidDate; }
    public void setLastBidDate(Date lastBidDate) { this.lastBidDate = lastBidDate; }
    public Integer getLastBidUser() { return lastBidUser; }
    public void setLastBidUser(Integer lastBidUser) { this.lastBidUser = lastBidUser; }
    public Integer getCountInvitations() { return countInvitations; }
    public void setCountInvitations(Integer countInvitations) { this.countInvitations = countInvitations; }
    public Integer getCountParticipants() { return countParticipants; }
    public void setCountParticipants(Integer countParticipants) { this.countParticipants = countParticipants; }
    public Integer getCountActive() { return countActive; }
    public void setCountActive(Integer countActive) { this.countActive = countActive; }
    public Integer getCountInactive() { return countInactive; }
    public void setCountInactive(Integer countInactive) { this.countInactive = countInactive; }
    public Date getActivateDate() { return activateDate; }
    public void setActivateDate(Date activateDate) { this.activateDate = activateDate; }
    public Date getCancelDate() { return cancelDate; }
    public void setCancelDate(Date cancelDate) { this.cancelDate = cancelDate; }
    public Date getCloseDate() { return closeDate; }
    public void setCloseDate(Date closeDate) { this.closeDate = closeDate; }
    public Boolean getShowLastBid() { return showLastBid; }
    public void setShowLastBid(Boolean showLastBid) { this.showLastBid = showLastBid; }
    public Date getStartDate() { return startDate; }
    public void setStartDate(Date startDate) { this.startDate = startDate; }
    public Date getEndDate() { return endDate; }
    public void setEndDate(Date endDate) { this.endDate = endDate; }
    public String getStartTime() { return startTime; }
    public void setStartTime(String startTime) { this.startTime = startTime; }
    public String getEndTime() { return endTime; }
    public void setEndTime(String endTime) { this.endTime = endTime; }
    public Integer getAdditionalMinute() { return additionalMinute; }
    public void setAdditionalMinute(Integer additionalMinute) { this.additionalMinute = additionalMinute; }
    public DictionaryItem getCurrency() { return currency; }
    public void setCurrency(DictionaryItem currency) { this.currency = currency; }
    public Date getBidStartDate() { return bidStartDate; }
    public void setBidStartDate(Date bidStartDate) { this.bidStartDate = bidStartDate; }
    public Date getBidEndDate() { return bidEndDate; }
    public void setBidEndDate(Date bidEndDate) { this.bidEndDate = bidEndDate; }
    public String getBidStartTime() { return bidStartTime; }
    public void setBidStartTime(String bidStartTime) { this.bidStartTime = bidStartTime; }
    public String getBidEndTime() { return bidEndTime; }
    public void setBidEndTime(String bidEndTime) { this.bidEndTime = bidEndTime; }
    public Double getLastOffer() { return lastOffer; }
    public void setLastOffer(Double lastOffer) { this.lastOffer = lastOffer; }
}