package epg.auction.admin.entity;

import jakarta.persistence.*;
import java.util.Date;

@MappedSuperclass
public abstract class MainEntity {

    @Column(name = "CREATE_DATE")
    private Date createDate;

    @Column(name = "CREATE_USER")
    private String createUser;

    @Column(name = "MODIFY_DATE")
    private Date modifyDate;

    @Column(name = "MODIFY_USER")
    private String modifyUser;

    @Column(name = "REMOVE_DATE")
    private Date removeDate;

    @Column(name = "REMOVE_USER")
    private String removeUser;

    public Date getCreateDate() { return createDate; }
    public void setCreateDate(Date createDate) { this.createDate = createDate; }

    public String getCreateUser() { return createUser; }
    public void setCreateUser(String createUser) { this.createUser = createUser; }

    public Date getModifyDate() { return modifyDate; }
    public void setModifyDate(Date modifyDate) { this.modifyDate = modifyDate; }

    public String getModifyUser() { return modifyUser; }
    public void setModifyUser(String modifyUser) { this.modifyUser = modifyUser; }

    public Date getRemoveDate() { return removeDate; }
    public void setRemoveDate(Date removeDate) { this.removeDate = removeDate; }

    public String getRemoveUser() { return removeUser; }
    public void setRemoveUser(String removeUser) { this.removeUser = removeUser; }
}