package epg.auction.admin.repository;

import epg.auction.admin.entity.DictionaryItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DictionaryItemRepository extends JpaRepository<DictionaryItem, Integer> {
}