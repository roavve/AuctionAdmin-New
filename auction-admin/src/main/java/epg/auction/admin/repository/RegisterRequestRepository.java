package epg.auction.admin.repository;

import epg.auction.admin.entity.RegisterRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface RegisterRequestRepository extends JpaRepository<RegisterRequest, Integer> {

    @Query("SELECT r FROM RegisterRequest r WHERE r.status.key = 'key.registration.new' ORDER BY r.requestDate DESC")
    Page<RegisterRequest> findNewRequests(Pageable pageable);

    @Query("SELECT r FROM RegisterRequest r WHERE r.status.key = 'key.registration.processed' ORDER BY r.requestDate DESC")
    Page<RegisterRequest> findProcessedRequests(Pageable pageable);

    @Query("SELECT r FROM RegisterRequest r WHERE r.status.key = 'key.registration.cancelled' ORDER BY r.requestDate DESC")
    Page<RegisterRequest> findCancelledRequests(Pageable pageable);
}