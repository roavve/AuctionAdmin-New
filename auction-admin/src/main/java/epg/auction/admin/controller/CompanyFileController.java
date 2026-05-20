// CompanyFileController.java
package epg.auction.admin.controller;

import epg.auction.admin.entity.Company;
import epg.auction.admin.entity.CompanyFile;
import epg.auction.admin.repository.CompanyFileRepository;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/companies")
public class CompanyFileController {

    private final CompanyFileRepository companyFileRepository;

    public CompanyFileController(CompanyFileRepository companyFileRepository) {
        this.companyFileRepository = companyFileRepository;
    }

    @GetMapping("/{companyId}/files")
    public List<CompanyFile> getFiles(@PathVariable Integer companyId) {
        List<CompanyFile> files = companyFileRepository.findByCompanyId(companyId);
        files.forEach(f -> f.setFileData(null));
        return files;
    }

    @PostMapping("/{companyId}/files")
    public ResponseEntity<?> uploadFile(@PathVariable Integer companyId,
                                        @RequestParam("file") MultipartFile file,
                                        @RequestParam(value = "description", required = false) String description,
                                        Authentication auth) {
        try {
            Company company = new Company();
            company.setId(companyId);
            CompanyFile cf = new CompanyFile();
            cf.setRecordKey(UUID.randomUUID().toString());
            cf.setCompany(company);
            cf.setFileName(file.getOriginalFilename());
            cf.setFileFormat(file.getContentType());
            cf.setFileSize((int) file.getSize());
            cf.setFileData(file.getBytes());
            cf.setFileDescription(description);
            cf.setFileDate(new Date());
            cf.setFileUser(auth.getName());
            cf.setCreateUserId(auth.getName());
            companyFileRepository.save(cf);
            return ResponseEntity.ok(Map.of("success", true, "fileName", file.getOriginalFilename()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/files/{fileId}/download")
    public void downloadFile(@PathVariable Integer fileId, HttpServletResponse response) {
        try {
            CompanyFile file = companyFileRepository.findById(fileId)
                    .orElseThrow(() -> new RuntimeException("File not found"));
            response.setContentType(file.getFileFormat() != null ? file.getFileFormat() : "application/octet-stream");
            response.setHeader("Content-Disposition", "attachment; filename=\"" + file.getFileName() + "\"");
            response.getOutputStream().write(file.getFileData());
            response.flushBuffer();
        } catch (Exception e) {
            response.setStatus(404);
        }
    }

    @DeleteMapping("/files/{fileId}")
    public ResponseEntity<?> deleteFile(@PathVariable Integer fileId) {
        companyFileRepository.deleteById(fileId);
        return ResponseEntity.ok(Map.of("success", true));
    }
}