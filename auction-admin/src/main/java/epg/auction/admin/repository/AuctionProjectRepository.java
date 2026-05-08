package epg.auction.admin.repository;

import epg.auction.admin.entity.AuctionProject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuctionProjectRepository extends JpaRepository<AuctionProject, Integer> {

    @Query("SELECT a FROM Auction a WHERE a.project.id = :projectId ORDER BY a.createDate DESC")
    List<Object> findAuctionsByProject(@Param("projectId") Integer projectId);
}