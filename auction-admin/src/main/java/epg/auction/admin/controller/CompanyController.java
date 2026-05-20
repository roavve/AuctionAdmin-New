package epg.auction.admin.controller;

import epg.auction.admin.entity.Company;
import epg.auction.admin.entity.User;
import epg.auction.admin.service.CompanyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import epg.auction.admin.entity.AuctionParticipant;
import java.util.List;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/companies")
public class CompanyController {

    @Autowired private CompanyService companyService;
    @Autowired private epg.auction.admin.repository.AuctionParticipantRepository participantRepository;
    @Autowired private epg.auction.admin.repository.AuctionInvitationRepository invitationRepository;

    @GetMapping("/{id}/invitations")
    public ResponseEntity<?> getCompanyInvitations(@PathVariable Integer id) {
        try {
            return ResponseEntity.ok(invitationRepository.findByCompanyId(id));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    @GetMapping
    public List<Company> getAll() { return companyService.getAll(); }
    @GetMapping("/{id}/project-stats")
    public ResponseEntity<?> getProjectStats(@PathVariable Integer id) {
        try {
            List<AuctionParticipant> participants = participantRepository.findByCompanyId(id);

            // Group by project
            Map<Integer, Map<String, Object>> projectMap = new java.util.LinkedHashMap<>();
            for (AuctionParticipant p : participants) {
                if (p.getAuction() == null || p.getAuction().getProject() == null) continue;
                Integer projectId = p.getAuction().getProject().getId();
                projectMap.computeIfAbsent(projectId, k -> {
                    Map<String, Object> stats = new java.util.LinkedHashMap<>();
                    stats.put("projectId", projectId);
                    stats.put("projectName", p.getAuction().getProject().getName());
                    stats.put("auctionCount", 0);
                    stats.put("wonCount", 0);
                    stats.put("lostCount", 0);
                    return stats;
                });
                Map<String, Object> stats = projectMap.get(projectId);
                stats.put("auctionCount", (int)stats.get("auctionCount") + 1);
                if (Boolean.TRUE.equals(p.getWinner())) {
                    stats.put("wonCount", (int)stats.get("wonCount") + 1);
                } else {
                    stats.put("lostCount", (int)stats.get("lostCount") + 1);
                }
            }
            return ResponseEntity.ok(new java.util.ArrayList<>(projectMap.values()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    @GetMapping("/{id}")
    public ResponseEntity<Company> getById(@PathVariable Integer id) {
        return companyService.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Company> create(@RequestBody Company company, Authentication auth) {
        return ResponseEntity.ok(companyService.createCompany(company, auth.getName()));
    }
    @PostMapping("/{id}/invite")
    public ResponseEntity<?> inviteCompany(@PathVariable Integer id, Authentication auth) {
        try {
            companyService.inviteCompany(id, auth.getName());
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    @PutMapping("/{id}")
    public ResponseEntity<Company> update(@PathVariable Integer id,
                                          @RequestBody Company company, Authentication auth) {
        return ResponseEntity.ok(companyService.updateCompany(id, company, auth.getName()));
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<?> cancel(@PathVariable Integer id, Authentication auth) {
        companyService.cancelCompany(id, auth.getName());
        return ResponseEntity.ok(Map.of("success", true));
    }

    @GetMapping("/{id}/users")
    public List<User> getUsers(@PathVariable Integer id) {
        return companyService.getUsersByCompany(id);
    }
    @GetMapping("/{id}/bid-history")
    public ResponseEntity<?> getBidHistory(@PathVariable Integer id) {
        try {
            List<AuctionParticipant> participants = participantRepository.findByCompanyId(id);
            return ResponseEntity.ok(participants);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Integer id) {
        companyService.delete(id);
        return ResponseEntity.ok(Map.of("success", true));
    }
}