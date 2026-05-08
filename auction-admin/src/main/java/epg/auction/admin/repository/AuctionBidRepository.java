package epg.auction.admin.repository;

import epg.auction.admin.entity.AuctionBid;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuctionBidRepository extends JpaRepository<AuctionBid, Integer> {

    @Query("SELECT b FROM AuctionBid b WHERE b.auction.id = :auctionId ORDER BY b.bidDate DESC")
    List<AuctionBid> findByAuctionId(@Param("auctionId") Integer auctionId);

    @Query("SELECT MAX(b.bidValue) FROM AuctionBid b WHERE b.auction.id = :auctionId AND b.status.key = 'key.bid.active'")
    Double getLastActiveBidValue(@Param("auctionId") Integer auctionId);
}