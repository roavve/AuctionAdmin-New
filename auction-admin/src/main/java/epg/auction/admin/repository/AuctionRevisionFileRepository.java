package epg.auction.admin.repository;

import epg.auction.admin.entity.AuctionRevisionFile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuctionRevisionFileRepository extends JpaRepository<AuctionRevisionFile, Integer> {

    @Query("SELECT f FROM AuctionRevisionFile f WHERE f.auction.id = :auctionId ORDER BY f.fileDate DESC")
    List<AuctionRevisionFile> findByAuctionId(@Param("auctionId") Integer auctionId);
}