package epg.auction.admin.entity;

import jakarta.persistence.*;
import java.util.Date;

@MappedSuperclass
public abstract class MainEntity {

    @Column(name = "CREATE_DATE")
    private Date createDate;

    @Column(name = "CREATE_USERID")
    private String createUserId;

    @Column(name = "MODIFY_DATE")
    private Date modifyDate;

    @Column(name = "MODIFY_USERID")
    private String modifyUserId;

    @Column(name = "REMOVE_DATE")
    private Date removeDate;

    @Column(name = "REMOVE_USERID")
    private String removeUserId;

    public Date getCreateDate() { return createDate; }
    public void setCreateDate(Date createDate) { this.createDate = createDate; }
    public String getCreateUserId() { return createUserId; }
    public void setCreateUserId(String createUserId) { this.createUserId = createUserId; }
    public Date getModifyDate() { return modifyDate; }
    public void setModifyDate(Date modifyDate) { this.modifyDate = modifyDate; }
    public String getModifyUserId() { return modifyUserId; }
    public void setModifyUserId(String modifyUserId) { this.modifyUserId = modifyUserId; }
    public Date getRemoveDate() { return removeDate; }
    public void setRemoveDate(Date removeDate) { this.removeDate = removeDate; }
    public String getRemoveUserId() { return removeUserId; }
    public void setRemoveUserId(String removeUserId) { this.removeUserId = removeUserId; }
}