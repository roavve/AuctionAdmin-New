// AuditController.java
package epg.auction.admin.controller;

import epg.auction.admin.entity.SysAudit;
import epg.auction.admin.repository.SysAuditRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/audit")
public class AuditController {

    private final SysAuditRepository sysAuditRepository;

    public AuditController(SysAuditRepository sysAuditRepository) {
        this.sysAuditRepository = sysAuditRepository;
    }

    @GetMapping
    public Page<SysAudit> search(
            @RequestParam(required = false) String userId,
            @RequestParam(required = false) String action,
            @RequestParam(required = false) String objectName,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return sysAuditRepository.search(userId, action, objectName, PageRequest.of(page, size));
    }
}