package epg.auction.admin.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "text_template")
public class TextTemplate extends MainEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "name")
    private String name;

    @Column(name = "tkey")
    private String tkey;

    @Column(name = "disabled")
    private Boolean disabled;

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getTkey() { return tkey; }
    public void setTkey(String tkey) { this.tkey = tkey; }
    public Boolean getDisabled() { return disabled; }
    public void setDisabled(Boolean disabled) { this.disabled = disabled; }
}