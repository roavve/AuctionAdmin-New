package epg.auction.admin.service;

import epg.auction.admin.entity.Auction;
import epg.auction.admin.repository.AuctionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class AuctionService {

    @Autowired
    private AuctionRepository auctionRepository;

    public List<Auction> getAll() {
        return auctionRepository.findAll();
    }

    public Optional<Auction> getById(Integer id) {
        return auctionRepository.findById(id);
    }

    public Auction save(Auction auction) {
        return auctionRepository.save(auction);
    }

    public void delete(Integer id) {
        auctionRepository.deleteById(id);
    }
}