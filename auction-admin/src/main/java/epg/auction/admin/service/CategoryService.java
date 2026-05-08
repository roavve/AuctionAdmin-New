package epg.auction.admin.service;

import epg.auction.admin.entity.Category;
import epg.auction.admin.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class CategoryService {

    @Autowired private CategoryRepository categoryRepository;

    public List<Category> getAll() { return categoryRepository.findAll(); }

    public List<Category> getParents() { return categoryRepository.findParentCategories(); }

    public List<Category> search(String name, Integer parentId) {
        return categoryRepository.searchCategories(name, parentId);
    }

    public Optional<Category> getById(Integer id) { return categoryRepository.findById(id); }

    @Transactional
    public Category save(Category category) { return categoryRepository.save(category); }

    @Transactional
    public void delete(Integer id) { categoryRepository.deleteById(id); }
}