package epg.auction.admin.controller;

import epg.auction.admin.entity.RegisterRequest;
import epg.auction.admin.entity.RegisterRequestFile;
import epg.auction.admin.repository.RegisterRequestFileRepository;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/registrations")
public class RegistrationFileController {

    @Autowired
    private RegisterRequestFileRepository fileRepository;

    @GetMapping("/{requestId}/files")
    public List<RegisterRequestFile> getFiles(@PathVariable Integer requestId) {
        List<RegisterRequestFile> files = fileRepository.findByRequestId(requestId);
        files.forEach(f -> f.setFileData(null));
        return files;
    }

    @PostMapping("/{requestId}/files")
    public ResponseEntity<?> uploadFile(
            @PathVariable Integer requestId,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "description", required = false) String description,
            Authentication auth) {
        try {
            RegisterRequest request = new RegisterRequest();
            request.setId(requestId);

            RegisterRequestFile rf = new RegisterRequestFile();
            rf.setRecordKey(UUID.randomUUID().toString());
            rf.setRequest(request);
            rf.setFileName(file.getOriginalFilename());
            rf.setFileFormat(file.getContentType());
            rf.setFileSize((int) file.getSize());
            rf.setFileData(file.getBytes());
            rf.setFileDescription(description);
            rf.setFileDate(new Date());
            rf.setFileUser(auth.getName());
            rf.setCreateUserId(auth.getName());

            fileRepository.save(rf);
            return ResponseEntity.ok(Map.of("success", true, "fileName", file.getOriginalFilename()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/files/{fileId}/download")
    public void downloadFile(@PathVariable Integer fileId, HttpServletResponse response) {
        try {
            RegisterRequestFile file = fileRepository.findById(fileId)
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
        fileRepository.deleteById(fileId);
        return ResponseEntity.ok(Map.of("success", true));
    }
}