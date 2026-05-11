package epg.auction.admin.repository;

import epg.auction.admin.entity.CompanyFile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CompanyFileRepository extends JpaRepository<CompanyFile, Integer> {

    @Query("SELECT f FROM CompanyFile f WHERE f.company.id = :companyId ORDER BY f.fileDate DESC")
    List<CompanyFile> findByCompanyId(@Param("companyId") Integer companyId);
}