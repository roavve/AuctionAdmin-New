package epg.auction.admin.controller;

import epg.auction.admin.entity.AuctionProject;
import epg.auction.admin.service.ProjectService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {

    private final ProjectService projectService;

    public ProjectController(ProjectService projectService) {
        this.projectService = projectService;
    }

    @GetMapping
    public List<AuctionProject> getAll() { return projectService.getAll(); }

    @GetMapping("/{id}")
    public ResponseEntity<AuctionProject> getById(@PathVariable Integer id) {
        return projectService.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<AuctionProject> create(@RequestBody AuctionProject project) {
        return ResponseEntity.ok(projectService.save(project));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AuctionProject> update(@PathVariable Integer id,
                                                 @RequestBody AuctionProject project) {
        project.setId(id);
        return ResponseEntity.ok(projectService.save(project));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Integer id) {
        projectService.delete(id);
        return ResponseEntity.ok(Map.of("success", true));
    }
}