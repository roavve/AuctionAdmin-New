package epg.auction.admin.repository;

import epg.auction.admin.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Integer> {

    @Query("SELECT c FROM Category c WHERE c.parent IS NULL ORDER BY c.name")
    List<Category> findParentCategories();

    @Query("SELECT c FROM Category c WHERE c.parent.id = :parentId ORDER BY c.name")
    List<Category> findByParentId(@Param("parentId") Integer parentId);

    @Query("SELECT c FROM Category c WHERE (:name IS NULL OR c.name LIKE %:name%) AND (:parentId IS NULL OR c.parent.id = :parentId) ORDER BY c.name")
    List<Category> searchCategories(@Param("name") String name, @Param("parentId") Integer parentId);
}

