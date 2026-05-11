package epg.auction.admin.repository;

import epg.auction.admin.entity.SysAudit;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface SysAuditRepository extends JpaRepository<SysAudit, Integer> {

    @Query("SELECT a FROM SysAudit a WHERE " +
            "(:userId IS NULL OR a.userId LIKE %:userId%) AND " +
            "(:action IS NULL OR a.action LIKE %:action%) AND " +
            "(:objectName IS NULL OR a.objectName LIKE %:objectName%) " +
            "ORDER BY a.auditDate DESC")
    Page<SysAudit> search(@Param("userId") String userId,
                          @Param("action") String action,
                          @Param("objectName") String objectName,
                          Pageable pageable);
}