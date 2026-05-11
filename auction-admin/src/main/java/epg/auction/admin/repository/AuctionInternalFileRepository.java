package epg.auction.admin.repository;

import epg.auction.admin.entity.AuctionInternalFile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuctionInternalFileRepository extends JpaRepository<AuctionInternalFile, Integer> {

    @Query("SELECT f FROM AuctionInternalFile f WHERE f.auction.id = :auctionId ORDER BY f.fileDate DESC")
    List<AuctionInternalFile> findByAuctionId(@Param("auctionId") Integer auctionId);
}