package epg.auction.admin.repository;

import epg.auction.admin.entity.AuctionParticipant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuctionParticipantRepository extends JpaRepository<AuctionParticipant, Integer> {

    @Query("SELECT p FROM AuctionParticipant p WHERE p.auction.id = :auctionId")
    List<AuctionParticipant> findByAuctionId(@Param("auctionId") Integer auctionId);

    @Query("SELECT COUNT(p) FROM AuctionParticipant p WHERE p.auction.id = :auctionId")
    Long countByAuctionId(@Param("auctionId") Integer auctionId);
    @Query("SELECT p FROM AuctionParticipant p WHERE p.company.id = :companyId ORDER BY p.id DESC")
    List<AuctionParticipant> findByCompanyId(@Param("companyId") Integer companyId);
    @Query("SELECT COUNT(p) FROM AuctionParticipant p WHERE p.auction.id = :auctionId AND (p.winner = false OR p.winner IS NULL)")
    Long countActiveByAuctionId(@Param("auctionId") Integer auctionId);
}