package epg.auction.admin.repository;

import epg.auction.admin.entity.TextTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TextTemplateRepository extends JpaRepository<TextTemplate, Integer> {

    @Query("SELECT t FROM TextTemplate t WHERE t.tkey = :tkey")
    Optional<TextTemplate> findByTkey(@Param("tkey") String tkey);
}