package epg.auction.admin.entity;

import jakarta.persistence.*;
import java.util.Date;

@Entity
@Table(name = "SYS_AUDIT")
public class SysAudit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "ACTION")
    private String action;

    @Column(name = "AUDIT_DATE")
    private Date auditDate;

    @Column(name = "DETAIL")
    private String detail;

    @Column(name = "OBJECT_ID")
    private Integer objectId;

    @Column(name = "OBJECT_NAME")
    private String objectName;

    @Column(name = "PARENT_ID")
    private Integer parentId;

    @Column(name = "USERID")
    private String userId;

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }
    public Date getAuditDate() { return auditDate; }
    public void setAuditDate(Date auditDate) { this.auditDate = auditDate; }
    public String getDetail() { return detail; }
    public void setDetail(String detail) { this.detail = detail; }
    public Integer getObjectId() { return objectId; }
    public void setObjectId(Integer objectId) { this.objectId = objectId; }
    public String getObjectName() { return objectName; }
    public void setObjectName(String objectName) { this.objectName = objectName; }
    public Integer getParentId() { return parentId; }
    public void setParentId(Integer parentId) { this.parentId = parentId; }
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
}