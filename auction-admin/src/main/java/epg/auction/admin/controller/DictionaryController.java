package epg.auction.admin.controller;

import epg.auction.admin.entity.DictionaryItem;
import epg.auction.admin.repository.DictionaryItemRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dictionary")
public class DictionaryController {

    private final DictionaryItemRepository dictionaryItemRepository;

    public DictionaryController(DictionaryItemRepository dictionaryItemRepository) {
        this.dictionaryItemRepository = dictionaryItemRepository;
    }

    @GetMapping("/items")
    public List<DictionaryItem> getAll() { return dictionaryItemRepository.findAll(); }

    @GetMapping("/items/{id}")
    public ResponseEntity<DictionaryItem> getById(@PathVariable Integer id) {
        return dictionaryItemRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/items/byKey/{key}")
    public ResponseEntity<DictionaryItem> getByKey(@PathVariable String key) {
        return dictionaryItemRepository.findByKey(key)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/items")
    public ResponseEntity<DictionaryItem> create(@RequestBody DictionaryItem item) {
        return ResponseEntity.ok(dictionaryItemRepository.save(item));
    }

    @PutMapping("/items/{id}")
    public ResponseEntity<DictionaryItem> update(@PathVariable Integer id,
                                                 @RequestBody DictionaryItem item) {
        item.setId(id);
        return ResponseEntity.ok(dictionaryItemRepository.save(item));
    }

    @DeleteMapping("/items/{id}")
    public ResponseEntity<?> delete(@PathVariable Integer id) {
        dictionaryItemRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("success", true));
    }
}