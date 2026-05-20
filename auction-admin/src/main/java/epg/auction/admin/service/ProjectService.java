package epg.auction.admin.service;

import epg.auction.admin.entity.AuctionProject;
import epg.auction.admin.repository.AuctionProjectRepository;
import epg.auction.admin.repository.DictionaryItemRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class ProjectService {

    private final AuctionProjectRepository projectRepository;
    private final DictionaryItemRepository dictionaryItemRepository;

    public ProjectService(AuctionProjectRepository projectRepository,
                          DictionaryItemRepository dictionaryItemRepository) {
        this.projectRepository = projectRepository;
        this.dictionaryItemRepository = dictionaryItemRepository;
    }

    public List<AuctionProject> getAll() { return projectRepository.findAll(); }

    public Optional<AuctionProject> getById(Integer id) { return projectRepository.findById(id); }

    @Transactional
    public AuctionProject save(AuctionProject project) {
        if (project.getStatus() == null) {
            dictionaryItemRepository.findByKey("key.auctionProject.active")
                    .ifPresent(project::setStatus);
        }
        return projectRepository.save(project);
    }

    @Transactional
    public void delete(Integer id) { projectRepository.deleteById(id); }
}