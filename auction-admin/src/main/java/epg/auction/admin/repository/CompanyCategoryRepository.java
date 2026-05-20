package epg.auction.admin.repository;

import epg.auction.admin.entity.CompanyCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CompanyCategoryRepository extends JpaRepository<CompanyCategory, Integer> {

    @Query("SELECT cc FROM CompanyCategory cc WHERE cc.company.id = :companyId")
    List<CompanyCategory> findByCompanyId(@Param("companyId") Integer companyId);
}