package epg.auction.admin.entity;

import jakarta.persistence.*;
import java.io.Serializable;

@Entity
@Table(name = "DI_ITEM")
public class DictionaryItem implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Integer id;

    @Column(name = "FIXED")
    private boolean fixed;

    @Column(name = "\"KEY\"")
    private String key;

    @Column(name = "NAME")
    private String name;

    @Column(name = "NAME_GE")
    private String nameGE;

    @Column(name = "SORT_ORDER")
    private int sortOrder;

    @Column(name = "DISABLED")
    private boolean disabled;

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public boolean isFixed() { return fixed; }
    public void setFixed(boolean fixed) { this.fixed = fixed; }
    public String getKey() { return key; }
    public void setKey(String key) { this.key = key; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getNameGE() { return nameGE; }
    public void setNameGE(String nameGE) { this.nameGE = nameGE; }
    public int getSortOrder() { return sortOrder; }
    public void setSortOrder(int sortOrder) { this.sortOrder = sortOrder; }
    public boolean isDisabled() { return disabled; }
    public void setDisabled(boolean disabled) { this.disabled = disabled; }
}