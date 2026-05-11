package epg.auction.admin.entity;

import jakarta.persistence.*;
import java.io.Serializable;

@Entity
@Table(name = "CATEGORY")
public class Category extends MainEntity implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "NAME")
    private String name;

    @Column(name = "DISABLED")
    private Boolean disabled;

    @ManyToOne
    @JoinColumn(name = "PARENT_ID")
    private Category parent;

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public Boolean getDisabled() { return disabled; }
    public void setDisabled(Boolean disabled) { this.disabled = disabled; }
    public Category getParent() { return parent; }
    public void setParent(Category parent) { this.parent = parent; }
}