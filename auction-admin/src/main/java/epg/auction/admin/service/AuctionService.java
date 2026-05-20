package epg.auction.admin.service;

import epg.auction.admin.entity.*;
import epg.auction.admin.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
public class AuctionService {

    @Autowired private AuctionRepository auctionRepository;
    @Autowired private AuctionBidRepository bidRepository;
    @Autowired private AuctionInvitationRepository invitationRepository;
    @Autowired private AuctionParticipantRepository participantRepository;
    @Autowired private AuctionCommentRepository commentRepository;
    @Autowired private DictionaryItemRepository dictionaryItemRepository;
    @Autowired private SysAuditRepository sysAuditRepository;
    @Autowired private epg.auction.admin.repository.AuctionRevisionRepository auctionRevisionRepository;
    @Autowired private SmsService smsService;
    @Autowired private CompanyRepository companyRepository;
    @Autowired private EmailService emailService;

    private DictionaryItem getStatusByKey(String key) {
        return dictionaryItemRepository.findByKey(key)
                .orElseThrow(() -> new RuntimeException("Status not found: " + key));
    }

    private void audit(String action, String objectName, Integer objectId, String userId) {
        try {
            SysAudit log = new SysAudit();
            log.setAction(action);
            log.setObjectName(objectName);
            log.setObjectId(objectId);
            log.setUserId(userId);
            log.setAuditDate(new Date());
            sysAuditRepository.save(log);
        } catch (Exception e) {
            // never let audit failure break the main action
        }
    }

    // =================== AUCTION CRUD ===================

    public List<Auction> getAll() { return auctionRepository.findAll(); }

    public Optional<Auction> getById(Integer id) { return auctionRepository.findById(id); }

    @Transactional
    public Auction save(Auction auction) { return auctionRepository.save(auction); }

    @Transactional
    public void answerComment(Integer commentId, String text, String userId) {
        AuctionComment original = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        original.setStatus(getStatusByKey("key.coment.answered"));
        original.setModifyUserId(userId);
        commentRepository.save(original);

        AuctionComment reply = new AuctionComment();
        reply.setRecordKey(UUID.randomUUID().toString());
        reply.setAuction(original.getAuction());
        reply.setCommText(text);
        reply.setStatus(getStatusByKey("key.coment.answered"));
        reply.setCommCreated(new Date());
        reply.setAdmin(true);
        reply.setAnswerToKey(original.getRecordKey());
        reply.setCreateUserId(userId);
        commentRepository.save(reply);

        audit("ANSWER", "COMMENT", commentId, userId);
    }

    @Transactional
    public Auction createAuction(Auction auction, String userId) {
        auction.setRecordKey(UUID.randomUUID().toString());
        auction.setStatus(getStatusByKey("key.auctionStatus.draft"));
        auction.setCreateDate(new Date());
        auction.setCreateUserId(userId);

        if (auction.getAuctionType() != null && auction.getAuctionType().getKey() != null) {
            dictionaryItemRepository.findByKey(auction.getAuctionType().getKey())
                    .ifPresent(auction::setAuctionType);
        }
        if (auction.getValueType() != null && auction.getValueType().getKey() != null) {
            dictionaryItemRepository.findByKey(auction.getValueType().getKey())
                    .ifPresent(auction::setValueType);
        }
        if (auction.getUom() != null && auction.getUom().getKey() != null) {
            dictionaryItemRepository.findByKey(auction.getUom().getKey())
                    .ifPresent(auction::setUom);
        }
        if (auction.getCurrency() != null && auction.getCurrency().getKey() != null) {
            dictionaryItemRepository.findByKey(auction.getCurrency().getKey())
                    .ifPresent(auction::setCurrency);
        }
        if (auction.getProject() != null && auction.getProject().getId() != null) {
            AuctionProject project = new AuctionProject();
            project.setId(auction.getProject().getId());
            auction.setProject(project);
        }

        Auction saved = auctionRepository.save(auction);

        AuctionRevision revision = new AuctionRevision();
        revision.setRecordKey(UUID.randomUUID().toString());
        revision.setAuction(saved);
        revision.setRevisionNum(1);
        revision.setRevisionDate(new Date());
        revision.setCurrent(true);
        revision.setCreateUserId(userId);
        revision.setCreateDate(new Date());
        revision.setCreateUser(userId);
        auctionRevisionRepository.save(revision);

        audit("CREATE", "AUCTION", saved.getId(), userId);
        return saved;
    }

    @Transactional
    public Auction updateAuction(Integer id, Auction auction, String userId) {
        Auction original = auctionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Auction not found: " + id));

        if (auction.getAuctionStartDate() != null && auction.getDiscussEndDate() != null) {
            if (!auction.getAuctionStartDate().after(auction.getDiscussEndDate())) {
                throw new RuntimeException("Auction Start Date must be after Discuss End Date");
            }
        }

        original.setName(auction.getName());
        original.setDesc(auction.getDesc());
        original.setInviteText(auction.getInviteText());
        original.setAuctionStartDate(auction.getAuctionStartDate());
        original.setAuctionEndDate(auction.getAuctionEndDate());
        original.setStartTime(auction.getStartTime());
        original.setEndTime(auction.getEndTime());
        original.setDiscussStartDate(auction.getDiscussStartDate());
        original.setDiscussEndDate(auction.getDiscussEndDate());
        original.setStartBidValue(auction.getStartBidValue());
        original.setMaxBidValue(auction.getMaxBidValue());
        original.setBidStep(auction.getBidStep());
        original.setBidStartDate(auction.getBidStartDate());
        original.setBidStartTime(auction.getBidStartTime());
        original.setBidEndDate(auction.getBidEndDate());
        original.setBidEndTime(auction.getBidEndTime());
        original.setQuantity(auction.getQuantity());
        original.setShowLastBid(auction.getShowLastBid());
        original.setAdditionalMinute(auction.getAdditionalMinute());
        original.setModifyDate(new Date());
        original.setModifyUserId(userId);

        if (auction.getAuctionType() != null && auction.getAuctionType().getKey() != null) {
            dictionaryItemRepository.findByKey(auction.getAuctionType().getKey())
                    .ifPresent(original::setAuctionType);
        }
        if (auction.getValueType() != null && auction.getValueType().getKey() != null) {
            dictionaryItemRepository.findByKey(auction.getValueType().getKey())
                    .ifPresent(original::setValueType);
        }
        if (auction.getUom() != null && auction.getUom().getKey() != null) {
            dictionaryItemRepository.findByKey(auction.getUom().getKey())
                    .ifPresent(original::setUom);
        }
        if (auction.getCurrency() != null && auction.getCurrency().getKey() != null) {
            dictionaryItemRepository.findByKey(auction.getCurrency().getKey())
                    .ifPresent(original::setCurrency);
        }
        if (auction.getProject() != null && auction.getProject().getId() != null) {
            AuctionProject project = new AuctionProject();
            project.setId(auction.getProject().getId());
            original.setProject(project);
        }

        Auction saved = auctionRepository.save(original);
        audit("UPDATE", "AUCTION", saved.getId(), userId);
        return saved;
    }

    @Transactional
    public void activateAuction(Integer id, String userId) {
        Auction auction = auctionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Auction not found"));
        if (!auction.getStatus().getKey().equals("key.auctionStatus.draft")) {
            throw new RuntimeException("Auction must be in draft status");
        }
        auction.setStatus(getStatusByKey("key.auctionStatus.active"));
        auction.setActivateDate(new Date());
        auction.setModifyUserId(userId);
        auctionRepository.save(auction);
        audit("ACTIVATE", "AUCTION", id, userId);
    }

    @Transactional
    public void cancelAuction(Integer id, String userId) {
        Auction auction = auctionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Auction not found"));
        if (!auction.getStatus().getKey().equals("key.auctionStatus.active")) {
            throw new RuntimeException("Auction must be active to cancel");
        }
        auction.setStatus(getStatusByKey("key.auctionStatus.cancelled"));
        auction.setCancelDate(new Date());
        auction.setModifyUserId(userId);
        auctionRepository.save(auction);
        audit("CANCEL", "AUCTION", id, userId);
    }

    @Transactional
    public void closeAuction(Integer id, String userId) {
        Auction auction = auctionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Auction not found"));
        if (!auction.getStatus().getKey().equals("key.auctionStatus.active")) {
            throw new RuntimeException("Auction must be active to close");
        }
        auction.setStatus(getStatusByKey("key.auctionStatus.completed"));
        auction.setCloseDate(new Date());
        auction.setModifyUserId(userId);
        auctionRepository.save(auction);
        audit("CLOSE", "AUCTION", id, userId);
    }

    @Transactional
    public void deleteDraftAuction(Integer auctionId, String userId) {
        Auction auction = auctionRepository.findById(auctionId)
                .orElseThrow(() -> new RuntimeException("Auction not found"));
        if (!"key.auctionStatus.draft".equals(auction.getStatus().getKey())) {
            throw new RuntimeException("Only draft auctions can be deleted");
        }
        auctionRevisionRepository.deleteByAuctionId(auctionId);
        auctionRepository.delete(auction);
        audit("DELETE", "AUCTION", auctionId, userId);
    }

    // =================== MONITOR ===================

    public Page<Auction> findActiveAuctions(int page, int size) {
        return auctionRepository.findActiveAuctions(PageRequest.of(page, size));
    }

    public Page<Auction> findPlannedAuctions(int page, int size) {
        return auctionRepository.findPlannedAuctions(PageRequest.of(page, size));
    }

    public Page<Auction> findClosedAuctions(int page, int size) {
        return auctionRepository.findClosedAuctions(PageRequest.of(page, size));
    }

    public Page<Auction> findCancelledAuctions(int page, int size) {
        return auctionRepository.findCancelledAuctions(PageRequest.of(page, size));
    }

    public Page<Auction> searchAuctions(Integer statusId, Integer projectId,
                                        Integer rangeStart, Integer rangeEnd,
                                        String startDate, int page, int size) {
        java.util.Date date = null;
        if (startDate != null && !startDate.isEmpty()) {
            try {
                date = new java.text.SimpleDateFormat("yyyy-MM-dd").parse(startDate);
            } catch (Exception e) {}
        }
        return auctionRepository.searchAuctions(statusId, projectId, rangeStart, rangeEnd,
                date, PageRequest.of(page, size));
    }

    // =================== BIDS ===================

    public List<AuctionBid> getBidsByAuction(Integer auctionId) {
        return bidRepository.findByAuctionId(auctionId);
    }

    public Optional<AuctionBid> getBidById(Integer id) {
        return bidRepository.findById(id);
    }

    @Transactional
    public AuctionBid createBid(AuctionBid bid, String userId) {
        bid.setStatus(getStatusByKey("key.bid.active"));
        bid.setRecordKey(UUID.randomUUID().toString());
        bid.setBidDate(new Date());
        bid.setCreateUserId(userId);
        return bidRepository.save(bid);
    }

    @Transactional
    public void cancelBid(Integer bidId, String userId) {
        AuctionBid bid = bidRepository.findById(bidId)
                .orElseThrow(() -> new RuntimeException("Bid not found"));
        bid.setStatus(getStatusByKey("key.bid.cancelled"));
        bid.setModifyUserId(userId);
        bidRepository.save(bid);

        Double lastBid = bidRepository.getLastActiveBidValue(bid.getAuction().getId());
        Auction auction = bid.getAuction();
        auction.setLastBidValue(lastBid);
        auctionRepository.save(auction);
    }

    // =================== INVITATIONS ===================

    public List<AuctionInvitation> getInvitationsByAuction(Integer auctionId) {
        return invitationRepository.findByAuctionId(auctionId);
    }

    @Transactional
    public AuctionInvitation createInvitation(AuctionInvitation invitation, String userId) {
        invitation.setRecordKey(UUID.randomUUID().toString());
        invitation.setStatus(getStatusByKey("key.auctionInvitation.invited"));
        invitation.setDateInvited(new Date());
        invitation.setCreateUserId(userId);
        return invitationRepository.save(invitation);
    }

    @Transactional
    public void cancelInvitation(Integer id, String userId) {
        AuctionInvitation inv = invitationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Invitation not found"));
        inv.setStatus(getStatusByKey("key.auctionInvitation.cancelled"));
        inv.setCancelDate(new Date());
        inv.setModifyUserId(userId);
        invitationRepository.save(inv);
    }

    @Transactional
    public void closeInvitation(Integer id, String userId) {
        AuctionInvitation inv = invitationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Invitation not found"));
        inv.setStatus(getStatusByKey("key.auctionInvitation.closed"));
        inv.setCloseDate(new Date());
        inv.setModifyUserId(userId);
        invitationRepository.save(inv);
    }

    @Transactional
    public void inviteCompanies(Integer auctionId, List<Integer> companyIds, String userId) {
        Auction auction = auctionRepository.findById(auctionId)
                .orElseThrow(() -> new RuntimeException("Auction not found"));

        DictionaryItem invitedStatus = getStatusByKey("key.auctionInvitation.invited");

        for (Integer companyId : companyIds) {
            Long existing = invitationRepository.countActiveInvitation(auctionId, companyId);
            if (existing > 0) continue;

            AuctionInvitation invitation = new AuctionInvitation();
            invitation.setRecordKey(UUID.randomUUID().toString());
            invitation.setAuction(auction);

            epg.auction.admin.entity.Company company = new epg.auction.admin.entity.Company();
            company.setId(companyId);
            invitation.setCompany(company);

            invitation.setStatus(invitedStatus);
            invitation.setDateInvited(new Date());
            invitation.setDateSelected(new Date());
            invitation.setCreateUserId(userId);
            invitationRepository.save(invitation);

            try {
                epg.auction.admin.entity.Company comp = companyRepository.findById(companyId).orElse(null);
                if (comp != null) {
                    Map<String, String> vars = new HashMap<>();
                    vars.put("auctionName", auction.getName());
                    vars.put("companyName", comp.getCompanyName());

                    if (comp.getContactMobile() != null) {
                        smsService.sendSms(comp.getContactMobile(),
                                "You have been invited to auction: " + auction.getName());
                    }
                    if (comp.getContactEmail() != null) {
                        emailService.sendTemplatedEmail(comp.getContactEmail(),
                                "key.template.auctionInvitation", vars);
                    }
                }
            } catch (Exception e) {
                System.err.println("Failed to send invitation notifications: " + e.getMessage());
            }
        }
        audit("INVITE", "AUCTION", auctionId, userId);
    }

    @Transactional
    public int inviteCompaniesToProject(Integer projectId, List<Integer> companyIds, String userId) {
        List<Auction> activeAuctions = auctionRepository.findActiveAuctionsByProject(projectId);
        DictionaryItem invitedStatus = getStatusByKey("key.auctionInvitation.invited");
        int count = 0;

        for (Auction auction : activeAuctions) {
            for (Integer companyId : companyIds) {
                Long existing = invitationRepository.countActiveInvitation(auction.getId(), companyId);
                if (existing > 0) continue;

                AuctionInvitation invitation = new AuctionInvitation();
                invitation.setRecordKey(UUID.randomUUID().toString());
                invitation.setAuction(auction);

                epg.auction.admin.entity.Company company = new epg.auction.admin.entity.Company();
                company.setId(companyId);
                invitation.setCompany(company);

                invitation.setStatus(invitedStatus);
                invitation.setDateInvited(new Date());
                invitation.setDateSelected(new Date());
                invitation.setCreateUserId(userId);
                invitationRepository.save(invitation);
                count++;

                try {
                    epg.auction.admin.entity.Company comp = companyRepository.findById(companyId).orElse(null);
                    if (comp != null) {
                        Map<String, String> vars = new HashMap<>();
                        vars.put("auctionName", auction.getName());
                        vars.put("companyName", comp.getCompanyName());

                        if (comp.getContactMobile() != null) {
                            smsService.sendSms(comp.getContactMobile(),
                                    "You have been invited to auction: " + auction.getName());
                        }
                        if (comp.getContactEmail() != null) {
                            emailService.sendTemplatedEmail(comp.getContactEmail(),
                                    "key.template.auctionInvitation", vars);
                        }
                    }
                } catch (Exception e) {
                    System.err.println("Failed to send notification: " + e.getMessage());
                }
            }
        }
        audit("INVITE_PROJECT", "PROJECT", projectId, userId);
        return count;
    }

    // =================== PARTICIPANTS ===================

    public List<AuctionParticipant> getParticipantsByAuction(Integer auctionId) {
        return participantRepository.findByAuctionId(auctionId);
    }

    @Transactional
    public AuctionParticipant createParticipant(AuctionParticipant participant, String userId) {
        participant.setRecordKey(UUID.randomUUID().toString());
        participant.setDateAdded(new Date());
        participant.setCreateUserId(userId);
        return participantRepository.save(participant);
    }

    @Transactional
    public void setWinner(Integer participantId, String userId) {
        AuctionParticipant winner = participantRepository.findById(participantId)
                .orElseThrow(() -> new RuntimeException("Participant not found"));

        List<AuctionParticipant> all = participantRepository.findByAuctionId(winner.getAuction().getId());
        for (AuctionParticipant p : all) {
            p.setWinner(false);
            participantRepository.save(p);
        }

        winner.setWinner(true);
        winner.setModifyUserId(userId);
        participantRepository.save(winner);
        audit("SET_WINNER", "PARTICIPANT", participantId, userId);

        try {
            String auctionName = winner.getAuction().getName();
            String winnerPhone = winner.getCompany().getContactMobile();
            String winnerEmail = winner.getCompany().getContactEmail();

            if (winnerPhone != null && !winnerPhone.isEmpty()) {
                smsService.sendSms(winnerPhone,
                        "Congratulations! Your company has won the auction: " + auctionName);
            }
            if (winnerEmail != null && !winnerEmail.isEmpty()) {
                Map<String, String> vars = new HashMap<>();
                vars.put("auctionName", auctionName);
                vars.put("companyName", winner.getCompany().getCompanyName());
                emailService.sendTemplatedEmail(winnerEmail, "key.template.auctionActivated", vars);
            }
        } catch (Exception e) {
            System.err.println("Failed to send winner notifications: " + e.getMessage());
        }
    }

    @Transactional
    public void deleteParticipant(Integer id, String userId) {
        participantRepository.deleteById(id);
    }

    // =================== COMMENTS ===================

    public List<AuctionComment> getCommentsByAuction(Integer auctionId) {
        return commentRepository.findByAuctionId(auctionId);
    }

    public Page<AuctionComment> getNewComments(int page, int size) {
        return commentRepository.findNewComments(PageRequest.of(page, size));
    }

    public Page<AuctionComment> getAnsweredComments(int page, int size) {
        return commentRepository.findAnsweredComments(PageRequest.of(page, size));
    }

    public Page<AuctionComment> getApprovedComments(int page, int size) {
        return commentRepository.findApprovedComments(PageRequest.of(page, size));
    }

    public Page<AuctionComment> getCancelledComments(int page, int size) {
        return commentRepository.findCancelledComments(PageRequest.of(page, size));
    }

    @Transactional
    public AuctionComment createComment(AuctionComment comment, String userId) {
        comment.setRecordKey(UUID.randomUUID().toString());
        comment.setStatus(getStatusByKey("key.coment.answered"));
        comment.setCommCreated(new Date());
        comment.setAdmin(true);
        comment.setCreateUserId(userId);
        return commentRepository.save(comment);
    }

    @Transactional
    public void approveComment(Integer id, String userId) {
        AuctionComment comment = commentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Comment not found"));
        if (!comment.getStatus().getKey().equals("key.coment.new")) {
            throw new RuntimeException("Comment must be new to approve");
        }
        comment.setStatus(getStatusByKey("key.coment.approved"));
        comment.setModifyUserId(userId);
        commentRepository.save(comment);
        audit("APPROVE", "COMMENT", id, userId);
    }

    @Transactional
    public void cancelComment(Integer id, String userId) {
        AuctionComment comment = commentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Comment not found"));
        comment.setStatus(getStatusByKey("key.coment.cancelled"));
        comment.setModifyUserId(userId);
        commentRepository.save(comment);
        audit("CANCEL", "COMMENT", id, userId);
    }
}