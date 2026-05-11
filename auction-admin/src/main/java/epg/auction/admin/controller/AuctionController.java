package epg.auction.admin.controller;

import epg.auction.admin.entity.*;
import epg.auction.admin.service.AuctionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/auctions")
public class AuctionController {

    @Autowired
    private AuctionService auctionService;

    // =================== AUCTION CRUD ===================

    @GetMapping
    public List<Auction> getAll() {
        return auctionService.getAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Auction> getById(@PathVariable Integer id) {
        return auctionService.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/search")
    public Page<Auction> search(
            @RequestParam(required = false) Integer statusId,
            @RequestParam(required = false) Integer projectId,
            @RequestParam(required = false) Integer rangeStartAmount,
            @RequestParam(required = false) Integer rangeEndAmount,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return auctionService.searchAuctions(statusId, projectId, rangeStartAmount, rangeEndAmount, page, size);
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

    @PostMapping("/{id}/activate")
    public ResponseEntity<?> activate(@PathVariable Integer id, Authentication auth) {
        auctionService.activateAuction(id, auth.getName());
        return ResponseEntity.ok(Map.of("success", true));
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<?> cancel(@PathVariable Integer id, Authentication auth) {
        auctionService.cancelAuction(id, auth.getName());
        return ResponseEntity.ok(Map.of("success", true));
    }

    @PostMapping("/{id}/close")
    public ResponseEntity<?> close(@PathVariable Integer id, Authentication auth) {
        auctionService.closeAuction(id, auth.getName());
        return ResponseEntity.ok(Map.of("success", true));
    }

    // =================== MONITOR ===================

    @GetMapping("/monitor/active")
    public Page<Auction> monitorActive(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return auctionService.findActiveAuctions(page, size);
    }

    @GetMapping("/monitor/planned")
    public Page<Auction> monitorPlanned(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return auctionService.findPlannedAuctions(page, size);
    }

    @GetMapping("/monitor/closed")
    public Page<Auction> monitorClosed(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return auctionService.findClosedAuctions(page, size);
    }

    @GetMapping("/monitor/cancelled")
    public Page<Auction> monitorCancelled(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return auctionService.findCancelledAuctions(page, size);
    }

    // =================== BIDS ===================

    @GetMapping("/{id}/bids")
    public List<AuctionBid> getBids(@PathVariable Integer id) {
        return auctionService.getBidsByAuction(id);
    }

    @PostMapping("/{id}/bids")
    public ResponseEntity<AuctionBid> createBid(@PathVariable Integer id,
                                                @RequestBody AuctionBid bid, Authentication auth) {
        bid.setAuction(new Auction());
        bid.getAuction().setId(id);
        return ResponseEntity.ok(auctionService.createBid(bid, auth.getName()));
    }

    @PostMapping("/bids/{bidId}/cancel")
    public ResponseEntity<?> cancelBid(@PathVariable Integer bidId, Authentication auth) {
        auctionService.cancelBid(bidId, auth.getName());
        return ResponseEntity.ok(Map.of("success", true));
    }

    // =================== INVITATIONS ===================

    @GetMapping("/{id}/invitations")
    public List<AuctionInvitation> getInvitations(@PathVariable Integer id) {
        return auctionService.getInvitationsByAuction(id);
    }

    @PostMapping("/{id}/invitations")
    public ResponseEntity<AuctionInvitation> createInvitation(@PathVariable Integer id,
                                                              @RequestBody AuctionInvitation invitation, Authentication auth) {
        invitation.setAuction(new Auction());
        invitation.getAuction().setId(id);
        return ResponseEntity.ok(auctionService.createInvitation(invitation, auth.getName()));
    }

    @PostMapping("/invitations/{invId}/cancel")
    public ResponseEntity<?> cancelInvitation(@PathVariable Integer invId, Authentication auth) {
        auctionService.cancelInvitation(invId, auth.getName());
        return ResponseEntity.ok(Map.of("success", true));
    }

    @PostMapping("/invitations/{invId}/close")
    public ResponseEntity<?> closeInvitation(@PathVariable Integer invId, Authentication auth) {
        auctionService.closeInvitation(invId, auth.getName());
        return ResponseEntity.ok(Map.of("success", true));
    }
    @PostMapping("/{id}/invite-companies")
    public ResponseEntity<?> inviteCompanies(@PathVariable Integer id,
                                             @RequestBody Map<String, List<Integer>> body, Authentication auth) {
        try {
            List<Integer> companyIds = body.get("companyIds");
            auctionService.inviteCompanies(id, companyIds, auth.getName());
            return ResponseEntity.ok(Map.of("success", true, "count", companyIds.size()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    // =================== PARTICIPANTS ===================

    @GetMapping("/{id}/participants")
    public List<AuctionParticipant> getParticipants(@PathVariable Integer id) {
        return auctionService.getParticipantsByAuction(id);
    }

    @PostMapping("/{id}/participants")
    public ResponseEntity<AuctionParticipant> createParticipant(@PathVariable Integer id,
                                                                @RequestBody AuctionParticipant participant, Authentication auth) {
        participant.setAuction(new Auction());
        participant.getAuction().setId(id);
        return ResponseEntity.ok(auctionService.createParticipant(participant, auth.getName()));
    }

    @PostMapping("/participants/{participantId}/win")
    public ResponseEntity<?> setWinner(@PathVariable Integer participantId, Authentication auth) {
        auctionService.setWinner(participantId, auth.getName());
        return ResponseEntity.ok(Map.of("success", true));
    }

    @DeleteMapping("/participants/{participantId}")
    public ResponseEntity<?> deleteParticipant(@PathVariable Integer participantId, Authentication auth) {
        auctionService.deleteParticipant(participantId, auth.getName());
        return ResponseEntity.ok(Map.of("success", true));
    }

    // =================== COMMENTS ===================

    @GetMapping("/{id}/comments")
    public List<AuctionComment> getComments(@PathVariable Integer id) {
        return auctionService.getCommentsByAuction(id);
    }

    @GetMapping("/comments/new")
    public Page<AuctionComment> getNewComments(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return auctionService.getNewComments(page, size);
    }

    @GetMapping("/comments/answered")
    public Page<AuctionComment> getAnsweredComments(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return auctionService.getAnsweredComments(page, size);
    }

    @GetMapping("/comments/approved")
    public Page<AuctionComment> getApprovedComments(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return auctionService.getApprovedComments(page, size);
    }

    @PostMapping("/{id}/comments")
    public ResponseEntity<AuctionComment> createComment(@PathVariable Integer id,
                                                        @RequestBody AuctionComment comment, Authentication auth) {
        comment.setAuction(new Auction());
        comment.getAuction().setId(id);
        return ResponseEntity.ok(auctionService.createComment(comment, auth.getName()));
    }

    @PostMapping("/comments/{commentId}/approve")
    public ResponseEntity<?> approveComment(@PathVariable Integer commentId, Authentication auth) {
        auctionService.approveComment(commentId, auth.getName());
        return ResponseEntity.ok(Map.of("success", true));
    }

    @PostMapping("/comments/{commentId}/cancel")
    public ResponseEntity<?> cancelComment(@PathVariable Integer commentId, Authentication auth) {
        auctionService.cancelComment(commentId, auth.getName());
        return ResponseEntity.ok(Map.of("success", true));
    }
}