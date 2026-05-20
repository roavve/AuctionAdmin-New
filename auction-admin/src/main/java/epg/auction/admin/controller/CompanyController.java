package epg.auction.admin.controller;

import epg.auction.admin.entity.AuctionParticipant;
import epg.auction.admin.entity.Company;
import epg.auction.admin.entity.User;
import epg.auction.admin.repository.AuctionInvitationRepository;
import epg.auction.admin.repository.AuctionParticipantRepository;
import epg.auction.admin.repository.CategoryRepository;
import epg.auction.admin.repository.CompanyCategoryRepository;
import epg.auction.admin.service.CompanyService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/companies")
public class CompanyController {

    private final CompanyService companyService;
    private final AuctionParticipantRepository participantRepository;
    private final AuctionInvitationRepository invitationRepository;
    private final CompanyCategoryRepository companyCategoryRepository;
    private final CategoryRepository categoryRepository;

    public CompanyController(CompanyService companyService,
                             AuctionParticipantRepository participantRepository,
                             AuctionInvitationRepository invitationRepository,
                             CompanyCategoryRepository companyCategoryRepository,
                             CategoryRepository categoryRepository) {
        this.companyService = companyService;
        this.participantRepository = participantRepository;
        this.invitationRepository = invitationRepository;
        this.companyCategoryRepository = companyCategoryRepository;
        this.categoryRepository = categoryRepository;
    }

    @GetMapping
    public List<Company> getAll() { return companyService.getAll(); }

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

    @PostMapping("/{id}/invite")
    public ResponseEntity<?> inviteCompany(@PathVariable Integer id, Authentication auth) {
        try {
            companyService.inviteCompany(id, auth.getName());
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Integer id) {
        companyService.delete(id);
        return ResponseEntity.ok(Map.of("success", true));
    }

    @GetMapping("/{id}/users")
    public List<User> getUsers(@PathVariable Integer id) {
        return companyService.getUsersByCompany(id);
    }

    @GetMapping("/{id}/bid-history")
    public ResponseEntity<?> getBidHistory(@PathVariable Integer id) {
        try {
            return ResponseEntity.ok(participantRepository.findByCompanyId(id));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{id}/project-stats")
    public ResponseEntity<?> getProjectStats(@PathVariable Integer id) {
        try {
            List<AuctionParticipant> participants = participantRepository.findByCompanyId(id);
            Map<Integer, Map<String, Object>> projectMap = new LinkedHashMap<>();
            for (AuctionParticipant p : participants) {
                if (p.getAuction() == null || p.getAuction().getProject() == null) continue;
                Integer projectId = p.getAuction().getProject().getId();
                projectMap.computeIfAbsent(projectId, k -> {
                    Map<String, Object> stats = new LinkedHashMap<>();
                    stats.put("projectId", projectId);
                    stats.put("projectName", p.getAuction().getProject().getName());
                    stats.put("auctionCount", 0);
                    stats.put("wonCount", 0);
                    stats.put("lostCount", 0);
                    return stats;
                });
                Map<String, Object> stats = projectMap.get(projectId);
                stats.put("auctionCount", (int) stats.get("auctionCount") + 1);
                if (Boolean.TRUE.equals(p.getWinner())) {
                    stats.put("wonCount", (int) stats.get("wonCount") + 1);
                } else {
                    stats.put("lostCount", (int) stats.get("lostCount") + 1);
                }
            }
            return ResponseEntity.ok(new ArrayList<>(projectMap.values()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{id}/invitations")
    public ResponseEntity<?> getCompanyInvitations(@PathVariable Integer id) {
        try {
            return ResponseEntity.ok(invitationRepository.findByCompanyId(id));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{id}/categories")
    public ResponseEntity<?> getCategories(@PathVariable Integer id) {
        return ResponseEntity.ok(companyCategoryRepository.findByCompanyId(id));
    }

    @PostMapping("/{id}/categories")
    public ResponseEntity<?> addCategory(@PathVariable Integer id,
                                         @RequestBody Map<String, Integer> body,
                                         Authentication auth) {
        try {
            epg.auction.admin.entity.CompanyCategory cc = new epg.auction.admin.entity.CompanyCategory();
            Company company = new Company();
            company.setId(id);
            cc.setCompany(company);
            if (body.get("categoryId") != null) {
                categoryRepository.findById(body.get("categoryId")).ifPresent(cc::setCategory);
            }
            if (body.get("subCategoryId") != null) {
                categoryRepository.findById(body.get("subCategoryId")).ifPresent(cc::setSubCategory);
            }
            cc.setCreateUserId(auth.getName());
            return ResponseEntity.ok(companyCategoryRepository.save(cc));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/categories/{categoryId}")
    public ResponseEntity<?> deleteCategory(@PathVariable Integer categoryId) {
        companyCategoryRepository.deleteById(categoryId);
        return ResponseEntity.ok(Map.of("success", true));
    }
}