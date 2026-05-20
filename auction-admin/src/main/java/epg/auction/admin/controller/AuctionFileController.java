package epg.auction.admin.controller;

import epg.auction.admin.entity.*;
import epg.auction.admin.repository.*;
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
@RequestMapping("/api/auctions")
public class AuctionFileController {

    private final AuctionRevisionFileRepository revisionFileRepo;
    private final AuctionInternalFileRepository internalFileRepo;
    private final AuctionRepository auctionRepository;

    public AuctionFileController(AuctionRevisionFileRepository revisionFileRepo,
                                 AuctionInternalFileRepository internalFileRepo,
                                 AuctionRepository auctionRepository) {
        this.revisionFileRepo = revisionFileRepo;
        this.internalFileRepo = internalFileRepo;
        this.auctionRepository = auctionRepository;
    }

    @GetMapping("/{auctionId}/files")
    public List<AuctionRevisionFile> getRevisionFiles(@PathVariable Integer auctionId) {
        List<AuctionRevisionFile> files = revisionFileRepo.findByAuctionId(auctionId);
        files.forEach(f -> f.setFileData(null));
        return files;
    }

    @PostMapping("/{auctionId}/files")
    public ResponseEntity<?> uploadRevisionFile(@PathVariable Integer auctionId,
                                                @RequestParam("file") MultipartFile file,
                                                @RequestParam(value = "description", required = false) String description,
                                                Authentication auth) {
        try {
            Auction auction = new Auction();
            auction.setId(auctionId);

            AuctionRevisionFile rf = new AuctionRevisionFile();
            rf.setRecordKey(UUID.randomUUID().toString());
            rf.setAuction(auction);
            rf.setFileName(file.getOriginalFilename());
            rf.setFileFormat(file.getContentType());
            rf.setFileSize((int) file.getSize());
            rf.setFileData(file.getBytes());
            rf.setFileDescription(description);
            rf.setFileDate(new Date());
            rf.setFileUser(auth.getName());
            rf.setCreateUserId(auth.getName());

            revisionFileRepo.save(rf);
            return ResponseEntity.ok(Map.of("success", true, "fileName", file.getOriginalFilename()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/files/{fileId}/download")
    public void downloadRevisionFile(@PathVariable Integer fileId, HttpServletResponse response) {
        try {
            AuctionRevisionFile file = revisionFileRepo.findById(fileId)
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
    public ResponseEntity<?> deleteRevisionFile(@PathVariable Integer fileId) {
        revisionFileRepo.deleteById(fileId);
        return ResponseEntity.ok(Map.of("success", true));
    }

    @GetMapping("/{auctionId}/internal-files")
    public List<AuctionInternalFile> getInternalFiles(@PathVariable Integer auctionId) {
        List<AuctionInternalFile> files = internalFileRepo.findByAuctionId(auctionId);
        files.forEach(f -> f.setFileData(null));
        return files;
    }

    @PostMapping("/{auctionId}/internal-files")
    public ResponseEntity<?> uploadInternalFile(@PathVariable Integer auctionId,
                                                @RequestParam("file") MultipartFile file,
                                                @RequestParam(value = "description", required = false) String description,
                                                Authentication auth) {
        try {
            Auction auction = new Auction();
            auction.setId(auctionId);

            AuctionInternalFile f = new AuctionInternalFile();
            f.setRecordKey(UUID.randomUUID().toString());
            f.setAuction(auction);
            f.setFileName(file.getOriginalFilename());
            f.setFileFormat(file.getContentType());
            f.setFileSize((int) file.getSize());
            f.setFileData(file.getBytes());
            f.setFileDescription(description);
            f.setFileDate(new Date());
            f.setFileUser(auth.getName());
            f.setCreateUserId(auth.getName());

            internalFileRepo.save(f);
            return ResponseEntity.ok(Map.of("success", true, "fileName", file.getOriginalFilename()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/internal-files/{fileId}/download")
    public void downloadInternalFile(@PathVariable Integer fileId, HttpServletResponse response) {
        try {
            AuctionInternalFile file = internalFileRepo.findById(fileId)
                    .orElseThrow(() -> new RuntimeException("File not found"));
            response.setContentType(file.getFileFormat() != null ? file.getFileFormat() : "application/octet-stream");
            response.setHeader("Content-Disposition", "attachment; filename=\"" + file.getFileName() + "\"");
            response.getOutputStream().write(file.getFileData());
            response.flushBuffer();
        } catch (Exception e) {
            response.setStatus(404);
        }
    }

    @DeleteMapping("/internal-files/{fileId}")
    public ResponseEntity<?> deleteInternalFile(@PathVariable Integer fileId) {
        internalFileRepo.deleteById(fileId);
        return ResponseEntity.ok(Map.of("success", true));
    }
}