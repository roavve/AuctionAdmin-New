package epg.auction.admin.service;

import epg.auction.admin.entity.AuctionProject;
import epg.auction.admin.repository.AuctionProjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class ProjectService {

    @Autowired private AuctionProjectRepository projectRepository;

    public List<AuctionProject> getAll() { return projectRepository.findAll(); }

    public Optional<AuctionProject> getById(Integer id) { return projectRepository.findById(id); }

    @Transactional
    public AuctionProject save(AuctionProject project) { return projectRepository.save(project); }

    @Transactional
    public void delete(Integer id) { projectRepository.deleteById(id); }
}