package epg.auction.admin.repository;

import epg.auction.admin.entity.AuctionComment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuctionCommentRepository extends JpaRepository<AuctionComment, Integer> {

    @Query("SELECT c FROM AuctionComment c WHERE c.auction.id = :auctionId ORDER BY c.commCreated DESC")
    List<AuctionComment> findByAuctionId(@Param("auctionId") Integer auctionId);

    @Query("SELECT c FROM AuctionComment c WHERE c.status.key = 'key.coment.new' ORDER BY c.commCreated DESC")
    Page<AuctionComment> findNewComments(Pageable pageable);

    @Query("SELECT c FROM AuctionComment c WHERE c.status.key = 'key.coment.answered' ORDER BY c.commCreated DESC")
    Page<AuctionComment> findAnsweredComments(Pageable pageable);

    @Query("SELECT c FROM AuctionComment c WHERE c.status.key = 'key.coment.approved' ORDER BY c.commCreated DESC")
    Page<AuctionComment> findApprovedComments(Pageable pageable);

    @Query("SELECT c FROM AuctionComment c WHERE c.status.key = 'key.coment.cancelled' ORDER BY c.commCreated DESC")
    Page<AuctionComment> findCancelledComments(Pageable pageable);
}