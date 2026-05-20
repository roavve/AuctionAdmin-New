package epg.auction.admin.controller;

import epg.auction.admin.entity.*;
import epg.auction.admin.repository.AuctionParticipantRepository;
import epg.auction.admin.repository.AuctionRevisionRepository;
import epg.auction.admin.service.AuctionService;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/auctions")
public class AuctionController {

    private final AuctionService auctionService;
    private final AuctionParticipantRepository participantRepository;
    private final AuctionRevisionRepository auctionRevisionRepository;

    public AuctionController(AuctionService auctionService,
                             AuctionParticipantRepository participantRepository,
                             AuctionRevisionRepository auctionRevisionRepository) {
        this.auctionService = auctionService;
        this.participantRepository = participantRepository;
        this.auctionRevisionRepository = auctionRevisionRepository;
    }

    @GetMapping
    public Page<Auction> search(
            @RequestParam(required = false) Integer statusId,
            @RequestParam(required = false) Integer projectId,
            @RequestParam(required = false) Integer rangeStartAmount,
            @RequestParam(required = false) Integer rangeEndAmount,
            @RequestParam(required = false) String rangeStartDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<Auction> auctions = auctionService.searchAuctions(
                statusId, projectId, rangeStartAmount, rangeEndAmount, rangeStartDate, page, size);
        auctions.getContent().forEach(a -> {
            a.setAllParticipants(participantRepository.countByAuctionId(a.getId()));
            a.setActiveParticipants(participantRepository.countActiveByAuctionId(a.getId()));
        });
        return auctions;
    }

    @GetMapping("/{id}")
    public ResponseEntity<Auction> getById(@PathVariable Integer id) {
        return auctionService.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Auction> create(@RequestBody Auction auction, Authentication auth) {
        return ResponseEntity.ok(auctionService.createAuction(auction, auth.getName()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Integer id,
                                    @RequestBody Auction auction, Authentication auth) {
        try {
            return ResponseEntity.ok(auctionService.updateAuction(id, auction, auth.getName()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Integer id, Authentication auth) {
        try {
            auctionService.deleteDraftAuction(id, auth.getName());
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{id}/activate")
    public ResponseEntity<?> activate(@PathVariable Integer id, Authentication auth) {
        try {
            auctionService.activateAuction(id, auth.getName());
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<?> cancel(@PathVariable Integer id, Authentication auth) {
        try {
            auctionService.cancelAuction(id, auth.getName());
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{id}/close")
    public ResponseEntity<?> close(@PathVariable Integer id, Authentication auth) {
        try {
            auctionService.closeAuction(id, auth.getName());
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/monitor/active")
    public Page<Auction> monitorActive(@RequestParam(defaultValue = "0") int page,
                                       @RequestParam(defaultValue = "20") int size) {
        return auctionService.findActiveAuctions(page, size);
    }

    @GetMapping("/monitor/planned")
    public Page<Auction> monitorPlanned(@RequestParam(defaultValue = "0") int page,
                                        @RequestParam(defaultValue = "20") int size) {
        return auctionService.findPlannedAuctions(page, size);
    }

    @GetMapping("/monitor/closed")
    public Page<Auction> monitorClosed(@RequestParam(defaultValue = "0") int page,
                                       @RequestParam(defaultValue = "20") int size) {
        return auctionService.findClosedAuctions(page, size);
    }

    @GetMapping("/monitor/cancelled")
    public Page<Auction> monitorCancelled(@RequestParam(defaultValue = "0") int page,
                                          @RequestParam(defaultValue = "20") int size) {
        return auctionService.findCancelledAuctions(page, size);
    }

    @GetMapping("/{id}/bids")
    public ResponseEntity<List<AuctionBid>> getBids(@PathVariable Integer id) {
        return ResponseEntity.ok(auctionService.getBidsByAuction(id));
    }

    @PostMapping("/bids/{bidId}/cancel")
    public ResponseEntity<?> cancelBid(@PathVariable Integer bidId, Authentication auth) {
        try {
            auctionService.cancelBid(bidId, auth.getName());
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{id}/invitations")
    public ResponseEntity<List<AuctionInvitation>> getInvitations(@PathVariable Integer id) {
        return ResponseEntity.ok(auctionService.getInvitationsByAuction(id));
    }

    @PostMapping("/invitations/{invId}/cancel")
    public ResponseEntity<?> cancelInvitation(@PathVariable Integer invId, Authentication auth) {
        try {
            auctionService.cancelInvitation(invId, auth.getName());
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/invitations/{invId}/close")
    public ResponseEntity<?> closeInvitation(@PathVariable Integer invId, Authentication auth) {
        try {
            auctionService.closeInvitation(invId, auth.getName());
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{id}/invite-companies")
    public ResponseEntity<?> inviteCompanies(@PathVariable Integer id,
                                             @RequestBody Map<String, List<Integer>> body,
                                             Authentication auth) {
        try {
            List<Integer> companyIds = body.get("companyIds");
            auctionService.inviteCompanies(id, companyIds, auth.getName());
            return ResponseEntity.ok(Map.of("success", true, "count", companyIds.size()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/project/{projectId}/invite-companies")
    public ResponseEntity<?> inviteCompaniesToProject(@PathVariable Integer projectId,
                                                      @RequestBody Map<String, List<Integer>> body,
                                                      Authentication auth) {
        try {
            List<Integer> companyIds = body.get("companyIds");
            int count = auctionService.inviteCompaniesToProject(projectId, companyIds, auth.getName());
            return ResponseEntity.ok(Map.of("success", true, "count", count));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{id}/participants")
    public ResponseEntity<List<AuctionParticipant>> getParticipants(@PathVariable Integer id) {
        return ResponseEntity.ok(auctionService.getParticipantsByAuction(id));
    }

    @PostMapping("/participants/{partId}/winner")
    public ResponseEntity<?> setWinner(@PathVariable Integer partId, Authentication auth) {
        try {
            auctionService.setWinner(partId, auth.getName());
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{id}/comments")
    public ResponseEntity<List<AuctionComment>> getComments(@PathVariable Integer id) {
        return ResponseEntity.ok(auctionService.getCommentsByAuction(id));
    }

    @GetMapping("/comments/new")
    public Page<AuctionComment> getNewComments(@RequestParam(defaultValue = "0") int page,
                                               @RequestParam(defaultValue = "20") int size) {
        return auctionService.getNewComments(page, size);
    }

    @GetMapping("/comments/answered")
    public Page<AuctionComment> getAnsweredComments(@RequestParam(defaultValue = "0") int page,
                                                    @RequestParam(defaultValue = "20") int size) {
        return auctionService.getAnsweredComments(page, size);
    }

    @GetMapping("/comments/approved")
    public Page<AuctionComment> getApprovedComments(@RequestParam(defaultValue = "0") int page,
                                                    @RequestParam(defaultValue = "20") int size) {
        return auctionService.getApprovedComments(page, size);
    }

    @GetMapping("/comments/cancelled")
    public Page<AuctionComment> getCancelledComments(@RequestParam(defaultValue = "0") int page,
                                                     @RequestParam(defaultValue = "20") int size) {
        return auctionService.getCancelledComments(page, size);
    }

    @PostMapping("/comments/{commentId}/approve")
    public ResponseEntity<?> approveComment(@PathVariable Integer commentId, Authentication auth) {
        try {
            auctionService.approveComment(commentId, auth.getName());
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/comments/{commentId}/answer")
    public ResponseEntity<?> answerComment(@PathVariable Integer commentId,
                                           @RequestBody Map<String, String> body,
                                           Authentication auth) {
        try {
            auctionService.answerComment(commentId, body.get("text"), auth.getName());
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/comments/{commentId}/cancel")
    public ResponseEntity<?> cancelComment(@PathVariable Integer commentId, Authentication auth) {
        try {
            auctionService.cancelComment(commentId, auth.getName());
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{id}/revisions")
    public ResponseEntity<List<AuctionRevision>> getRevisions(@PathVariable Integer id) {
        return ResponseEntity.ok(auctionRevisionRepository.findByAuctionId(id));
    }
}