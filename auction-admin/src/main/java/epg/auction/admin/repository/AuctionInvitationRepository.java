package epg.auction.admin.repository;

import epg.auction.admin.entity.AuctionInvitation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuctionInvitationRepository extends JpaRepository<AuctionInvitation, Integer> {

    @Query("SELECT i FROM AuctionInvitation i WHERE i.auction.id = :auctionId")
    List<AuctionInvitation> findByAuctionId(@Param("auctionId") Integer auctionId);

    @Query("SELECT COUNT(i) FROM AuctionInvitation i WHERE i.auction.id = :auctionId AND i.company.id = :companyId AND i.status.key != 'key.auctionInvitation.cancelled'")
    Long countActiveInvitation(@Param("auctionId") Integer auctionId, @Param("companyId") Integer companyId);
}