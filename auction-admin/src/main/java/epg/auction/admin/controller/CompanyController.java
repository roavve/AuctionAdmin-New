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