package epg.auction.admin.entity;

import jakarta.persistence.*;
import java.io.Serializable;

@Entity
@Table(name = "company_category")
public class CompanyCategory extends MainEntity implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "COMPANY_ID")
    private Company company;

    @ManyToOne
    @JoinColumn(name = "CATEGORY_ID")
    private Category category;

    @ManyToOne
    @JoinColumn(name = "SUB_CATEGORY_ID")
    private Category subCategory;

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public Company getCompany() { return company; }
    public void setCompany(Company company) { this.company = company; }
    public Category getCategory() { return category; }
    public void setCategory(Category category) { this.category = category; }
    public Category getSubCategory() { return subCategory; }
    public void setSubCategory(Category subCategory) { this.subCategory = subCategory; }
}