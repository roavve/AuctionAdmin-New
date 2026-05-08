package epg.auction.admin.controller;

import epg.auction.admin.entity.RegisterRequest;
import epg.auction.admin.repository.RegisterRequestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/registrations")
public class RegistrationController {

    @Autowired
    private RegisterRequestRepository registerRequestRepository;

    @GetMapping("/new")
    public Page<RegisterRequest> getNew(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return registerRequestRepository.findNewRequests(PageRequest.of(page, size));
    }

    @GetMapping("/processed")
    public Page<RegisterRequest> getProcessed(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return registerRequestRepository.findProcessedRequests(PageRequest.of(page, size));
    }

    @GetMapping("/cancelled")
    public Page<RegisterRequest> getCancelled(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return registerRequestRepository.findCancelledRequests(PageRequest.of(page, size));
    }

    @GetMapping("/{id}")
    public ResponseEntity<RegisterRequest> getById(@PathVariable Integer id) {
        return registerRequestRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<?> reject(@PathVariable Integer id) {
        return registerRequestRepository.findById(id)
                .map(r -> {
                    registerRequestRepository.save(r);
                    return ResponseEntity.ok(Map.of("success", true));
                })
                .orElse(ResponseEntity.notFound().build());
    }
}