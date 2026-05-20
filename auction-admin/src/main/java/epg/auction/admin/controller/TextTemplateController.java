package epg.auction.admin.controller;

import epg.auction.admin.entity.TextTemplate;
import epg.auction.admin.repository.TextTemplateRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/templates")
public class TextTemplateController {

    @Autowired
    private TextTemplateRepository textTemplateRepository;

    @GetMapping
    public List<TextTemplate> getAll() {
        return textTemplateRepository.findAll();
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Integer id,
                                    @RequestBody TextTemplate template) {
        return textTemplateRepository.findById(id).map(t -> {
            t.setName(template.getName());
            t.setDisabled(template.getDisabled());
            t.setSubject(template.getSubject());
            t.setEmailBody(template.getEmailBody());
            t.setSmsBody(template.getSmsBody());
            return ResponseEntity.ok(textTemplateRepository.save(t));
        }).orElse(ResponseEntity.notFound().build());
    }
}