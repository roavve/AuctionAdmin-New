package epg.auction.admin.entity;

import jakarta.persistence.*;
import java.io.Serializable;

@Entity
@Table(name = "AUCTION_PROJECT")
public class AuctionProject extends MainEntity implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "NAME")
    private String name;

    @Column(name = "DISABLED")
    private Boolean disabled;

    @ManyToOne
    @JoinColumn(name = "STATUS_KEY")
    private DictionaryItem status;

    @Column(name = "PROJECT_SUM")
    private Double projectSum;

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public Boolean getDisabled() { return disabled; }
    public void setDisabled(Boolean disabled) { this.disabled = disabled; }
    public DictionaryItem getStatus() { return status; }
    public void setStatus(DictionaryItem status) { this.status = status; }
    public Double getProjectSum() { return projectSum; }
    public void setProjectSum(Double projectSum) { this.projectSum = projectSum; }
}