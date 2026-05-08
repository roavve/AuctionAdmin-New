package epg.auction.admin.repository;

import epg.auction.admin.entity.DictionaryItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DictionaryItemRepository extends JpaRepository<DictionaryItem, Integer> {

    @Query("SELECT d FROM DictionaryItem d WHERE d.key = :key")
    Optional<DictionaryItem> findByKey(@Param("key") String key);
}