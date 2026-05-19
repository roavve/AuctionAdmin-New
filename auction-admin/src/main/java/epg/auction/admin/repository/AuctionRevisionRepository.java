package epg.auction.admin.repository;

import epg.auction.admin.entity.AuctionRevision;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuctionRevisionRepository extends JpaRepository<AuctionRevision, Integer> {

    @Query("SELECT r FROM AuctionRevision r WHERE r.auction.id = :auctionId ORDER BY r.revisionNum DESC")
    List<AuctionRevision> findByAuctionId(@Param("auctionId") Integer auctionId);

    @Modifying
    @Query("DELETE FROM AuctionRevision r WHERE r.auction.id = :auctionId")
    void deleteByAuctionId(@Param("auctionId") Integer auctionId);
}