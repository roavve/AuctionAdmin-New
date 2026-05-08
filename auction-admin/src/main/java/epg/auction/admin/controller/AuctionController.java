package epg.auction.admin.controller;

import epg.auction.admin.entity.Auction;
import epg.auction.admin.service.AuctionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/auctions")
public class AuctionController {

    @Autowired
    private AuctionService auctionService;

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

    @PostMapping
    public Auction create(@RequestBody Auction auction) {
        return auctionService.save(auction);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Auction> update(@PathVariable Integer id, @RequestBody Auction auction) {
        if (auctionService.getById(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        auction.setId(id);
        return ResponseEntity.ok(auctionService.save(auction));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        if (auctionService.getById(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        auctionService.delete(id);
        return ResponseEntity.ok().build();
    }
}