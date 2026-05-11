package epg.auction.admin.repository;

import epg.auction.admin.entity.TextTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TextTemplateRepository extends JpaRepository<TextTemplate, Integer> {
}