package epg.auction.admin.job;

import epg.auction.admin.entity.Auction;
import epg.auction.admin.entity.DictionaryItem;
import epg.auction.admin.repository.AuctionRepository;
import epg.auction.admin.repository.DictionaryItemRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;

@Component
public class AuctionScheduler {

    private final AuctionRepository auctionRepository;
    private final DictionaryItemRepository dictionaryItemRepository;

    public AuctionScheduler(AuctionRepository auctionRepository,
                            DictionaryItemRepository dictionaryItemRepository) {
        this.auctionRepository = auctionRepository;
        this.dictionaryItemRepository = dictionaryItemRepository;
    }

    @Scheduled(fixedDelay = 60000)
    @Transactional
    public void closeActiveAuctions() {
        try {
            List<Auction> activeAuctions = auctionRepository.findAllActiveAuctions();
            if (activeAuctions == null || activeAuctions.isEmpty()) return;

            DictionaryItem completedStatus = dictionaryItemRepository
                    .findByKey("key.auctionStatus.completed").orElse(null);
            if (completedStatus == null) return;

            SimpleDateFormat fmt = new SimpleDateFormat("yyyy-MM-dd HH:mm");
            Date now = new Date();

            for (Auction auction : activeAuctions) {
                try {
                    if (auction.getBidEndDate() == null || auction.getBidEndTime() == null) continue;
                    String endDateStr = new SimpleDateFormat("yyyy-MM-dd").format(auction.getBidEndDate());
                    Date endTime = fmt.parse(endDateStr + " " + auction.getBidEndTime());
                    if (now.after(endTime)) {
                        auction.setStatus(completedStatus);
                        auction.setCloseDate(now);
                        auction.setModifyUserId("system");
                        auctionRepository.save(auction);
                        System.out.println("Auto-closed auction: " + auction.getId() + " - " + auction.getName());
                    }
                } catch (ParseException e) {
                    System.err.println("Error parsing date for auction " + auction.getId() + ": " + e.getMessage());
                }
            }
        } catch (Exception e) {
            System.err.println("AuctionScheduler error: " + e.getMessage());
        }
    }

    @Scheduled(fixedDelay = 60000)
    @Transactional
    public void updateAuctionSteps() {
        try {
            List<Auction> activeAuctions = auctionRepository.findAllActiveAuctions();
            if (activeAuctions == null || activeAuctions.isEmpty()) return;

            SimpleDateFormat fmt = new SimpleDateFormat("yyyy-MM-dd HH:mm");
            Date now = new Date();

            DictionaryItem discussStep = dictionaryItemRepository.findByKey("key.auctionStep.discuss").orElse(null);
            DictionaryItem offerStep = dictionaryItemRepository.findByKey("key.auctionStep.offer").orElse(null);
            DictionaryItem bidStep = dictionaryItemRepository.findByKey("key.auctionStep.bid").orElse(null);
            DictionaryItem noOneStep = dictionaryItemRepository.findByKey("key.auctionStep.no_one").orElse(null);

            for (Auction auction : activeAuctions) {
                try {
                    if (auction.getBidStartDate() == null || auction.getBidEndDate() == null) continue;

                    String bidStartStr = new SimpleDateFormat("yyyy-MM-dd").format(auction.getBidStartDate())
                            + " " + (auction.getBidStartTime() != null ? auction.getBidStartTime() : "00:00");
                    String bidEndStr = new SimpleDateFormat("yyyy-MM-dd").format(auction.getBidEndDate())
                            + " " + (auction.getBidEndTime() != null ? auction.getBidEndTime() : "23:59");

                    Date bidStart = fmt.parse(bidStartStr);
                    Date bidEnd = fmt.parse(bidEndStr);

                    DictionaryItem newStep = null;
                    if (now.after(bidStart) && now.before(bidEnd)) {
                        newStep = bidStep;
                    } else if (auction.getAuctionStartDate() != null && auction.getAuctionEndDate() != null) {
                        String offerStartStr = new SimpleDateFormat("yyyy-MM-dd").format(auction.getAuctionStartDate())
                                + " " + (auction.getStartTime() != null ? auction.getStartTime() : "00:00");
                        String offerEndStr = new SimpleDateFormat("yyyy-MM-dd").format(auction.getAuctionEndDate())
                                + " " + (auction.getEndTime() != null ? auction.getEndTime() : "23:59");
                        Date offerStart = fmt.parse(offerStartStr);
                        Date offerEnd = fmt.parse(offerEndStr);

                        if (now.after(offerStart) && now.before(offerEnd)) {
                            newStep = offerStep;
                        } else if (auction.getDiscussStartDate() != null
                                && now.after(auction.getDiscussStartDate())
                                && now.before(offerStart)) {
                            newStep = discussStep;
                        } else {
                            newStep = noOneStep;
                        }
                    }

                    if (newStep != null) {
                        auction.setAuctionStep(newStep);
                        auctionRepository.save(auction);
                    }
                } catch (Exception e) {
                    System.err.println("Error updating step for auction " + auction.getId());
                }
            }
        } catch (Exception e) {
            System.err.println("AuctionStepScheduler error: " + e.getMessage());
        }
    }
}