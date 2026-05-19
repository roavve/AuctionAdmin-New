package epg.auction.admin.repository;

import epg.auction.admin.entity.Auction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuctionRepository extends JpaRepository<Auction, Integer> {

    @Query("SELECT a FROM Auction a WHERE a.status.key = 'key.auctionStatus.active' ORDER BY a.createDate DESC")
    Page<Auction> findActiveAuctions(Pageable pageable);

    @Query("SELECT a FROM Auction a WHERE a.status.key = 'key.auctionStatus.planned' ORDER BY a.createDate DESC")
    Page<Auction> findPlannedAuctions(Pageable pageable);

    @Query("SELECT a FROM Auction a WHERE a.status.key = 'key.auctionStatus.completed' ORDER BY a.createDate DESC")
    Page<Auction> findClosedAuctions(Pageable pageable);
    @Query("SELECT a FROM Auction a WHERE a.project.id = :projectId AND a.status.key = 'key.auctionStatus.active'")
    List<Auction> findActiveAuctionsByProject(@Param("projectId") Integer projectId);
    @Query("SELECT a FROM Auction a WHERE a.status.key = 'key.auctionStatus.cancelled' ORDER BY a.createDate DESC")
    Page<Auction> findCancelledAuctions(Pageable pageable);

    @Query("SELECT a FROM Auction a WHERE a.status.key = 'key.auctionStatus.draft' ORDER BY a.createDate DESC")
    Page<Auction> findDraftAuctions(Pageable pageable);

    @Query("SELECT a FROM Auction a WHERE a.status.key = 'key.auctionStatus.active' ORDER BY a.createDate DESC")
    List<Auction> findAllActiveAuctions();

    @Query("SELECT a FROM Auction a WHERE " +
            "(:statusId IS NULL OR a.status.id = :statusId) AND " +
            "(:projectId IS NULL OR a.project.id = :projectId) AND " +
            "(:rangeStart IS NULL OR a.startBidValue >= :rangeStart) AND " +
            "(:rangeEnd IS NULL OR a.startBidValue <= :rangeEnd) AND " +
            "(:startDate IS NULL OR a.auctionStartDate >= :startDate) " +
            "ORDER BY a.id DESC")
    Page<Auction> searchAuctions(
            @Param("statusId") Integer statusId,
            @Param("projectId") Integer projectId,
            @Param("rangeStart") Integer rangeStart,
            @Param("rangeEnd") Integer rangeEnd,
            @Param("startDate") java.util.Date startDate,
            Pageable pageable);
}