package epg.auction.admin.repository;

import epg.auction.admin.entity.RegisterRequestFile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RegisterRequestFileRepository extends JpaRepository<RegisterRequestFile, Integer> {

    @Query("SELECT f FROM RegisterRequestFile f WHERE f.request.id = :requestId ORDER BY f.fileDate DESC")
    List<RegisterRequestFile> findByRequestId(@Param("requestId") Integer requestId);
}