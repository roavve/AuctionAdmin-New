package epg.auction.admin.repository;

import epg.auction.admin.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {

    Optional<User> findByEmail(String email);

    @Query("SELECT u FROM User u WHERE u.company.id = :companyId")
    List<User> findByCompanyId(@Param("companyId") Integer companyId);

    @Query("SELECT u FROM User u WHERE u.role = 'ROLE_VIEWER' ORDER BY u.id")
    List<User> findMonitoringUsers();

    @Query("SELECT u FROM User u WHERE " +
            "(:email IS NULL OR u.email LIKE %:email%) AND " +
            "(:companyId IS NULL OR u.company.id = :companyId) AND " +
            "(:internal IS NULL OR u.internal = :internal) AND " +
            "(:active IS NULL OR u.active = :active) AND " +
            "(:locked IS NULL OR u.locked = :locked) " +
            "ORDER BY u.id DESC")
    Page<User> searchUsers(
            @Param("email") String email,
            @Param("companyId") Integer companyId,
            @Param("internal") Boolean internal,
            @Param("active") Boolean active,
            @Param("locked") Boolean locked,
            Pageable pageable);
}