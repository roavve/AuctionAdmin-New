package epg.auction.admin.entity;

import jakarta.persistence.*;
import java.io.Serializable;
import java.util.Date;

@Entity
@Table(name = "COMPANY_FILE")
public class CompanyFile extends MainEntity implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "RECORDKEY")
    private String recordKey;

    @ManyToOne
    @JoinColumn(name = "COMPANY_ID")
    private Company company;

    @Column(name = "FILE_NAME")
    private String fileName;

    @Column(name = "FILE_DESC")
    private String fileDescription;

    @Column(name = "FILE_USER")
    private String fileUser;

    @Column(name = "FILE_DATE")
    private Date fileDate;

    @Column(name = "MIME_TYPE")
    private String fileFormat;

    @Column(name = "ATTACH_SIZE")
    private Integer fileSize;

    @Column(name = "ATTACH_FILE")
    private byte[] fileData;

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public String getRecordKey() { return recordKey; }
    public void setRecordKey(String recordKey) { this.recordKey = recordKey; }
    public Company getCompany() { return company; }
    public void setCompany(Company company) { this.company = company; }
    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }
    public String getFileDescription() { return fileDescription; }
    public void setFileDescription(String fileDescription) { this.fileDescription = fileDescription; }
    public String getFileUser() { return fileUser; }
    public void setFileUser(String fileUser) { this.fileUser = fileUser; }
    public Date getFileDate() { return fileDate; }
    public void setFileDate(Date fileDate) { this.fileDate = fileDate; }
    public String getFileFormat() { return fileFormat; }
    public void setFileFormat(String fileFormat) { this.fileFormat = fileFormat; }
    public Integer getFileSize() { return fileSize; }
    public void setFileSize(Integer fileSize) { this.fileSize = fileSize; }
    public byte[] getFileData() { return fileData; }
    public void setFileData(byte[] fileData) { this.fileData = fileData; }
}