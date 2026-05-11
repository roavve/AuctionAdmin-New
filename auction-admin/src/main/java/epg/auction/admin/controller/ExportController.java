package epg.auction.admin.controller;

import epg.auction.admin.entity.*;
import epg.auction.admin.repository.*;
import jakarta.servlet.http.HttpServletResponse;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/export")
public class ExportController {

    @Autowired private AuctionRepository auctionRepository;
    @Autowired private AuctionInvitationRepository invitationRepository;
    @Autowired private AuctionParticipantRepository participantRepository;
    @Autowired private AuctionBidRepository bidRepository;

    private CellStyle headerStyle(Workbook wb) {
        CellStyle style = wb.createCellStyle();
        Font font = wb.createFont();
        font.setBold(true);
        style.setFont(font);
        style.setFillForegroundColor(IndexedColors.LIGHT_BLUE.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setBorderBottom(BorderStyle.THIN);
        return style;
    }

    private void setHeader(Row row, CellStyle style, String... headers) {
        for (int i = 0; i < headers.length; i++) {
            Cell cell = row.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(style);
        }
    }

    // Export #4 — Invited companies list
    @GetMapping("/auction/{auctionId}/invitations")
    public void exportInvitations(@PathVariable Integer auctionId,
                                  HttpServletResponse response) throws Exception {
        Auction auction = auctionRepository.findById(auctionId)
                .orElseThrow(() -> new RuntimeException("Auction not found"));
        List<AuctionInvitation> invitations = invitationRepository.findByAuctionId(auctionId);

        Workbook wb = new XSSFWorkbook();
        Sheet sheet = wb.createSheet("Invited Companies");
        CellStyle hs = headerStyle(wb);

        Row titleRow = sheet.createRow(0);
        titleRow.createCell(0).setCellValue("Auction: " + auction.getName());

        Row header = sheet.createRow(1);
        setHeader(header, hs, "ID", "Company Name", "Tax ID", "Contact Email",
                "Contact Phone", "Status", "Date Invited");

        int rowNum = 2;
        for (AuctionInvitation inv : invitations) {
            Row row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue(inv.getId() != null ? inv.getId() : 0);
            row.createCell(1).setCellValue(inv.getCompany() != null ? inv.getCompany().getCompanyName() : "");
            row.createCell(2).setCellValue(inv.getCompany() != null ? inv.getCompany().getTaxId() : "");
            row.createCell(3).setCellValue(inv.getCompany() != null ? inv.getCompany().getContactEmail() : "");
            row.createCell(4).setCellValue(inv.getCompany() != null ? inv.getCompany().getContactPhone() : "");
            row.createCell(5).setCellValue(inv.getStatus() != null ? inv.getStatus().getName() : "");
            row.createCell(6).setCellValue(inv.getDateInvited() != null ?
                    new java.text.SimpleDateFormat("dd/MM/yyyy").format(inv.getDateInvited()) : "");
        }

        for (int i = 0; i < 7; i++) sheet.autoSizeColumn(i);

        response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        response.setHeader("Content-Disposition",
                "attachment; filename=\"invitations_auction_" + auctionId + ".xlsx\"");
        wb.write(response.getOutputStream());
        wb.close();
    }

    // Export #3 — Participants with first and last bids + auction conditions
    @GetMapping("/auction/{auctionId}/participants")
    public void exportParticipants(@PathVariable Integer auctionId,
                                   HttpServletResponse response) throws Exception {
        Auction auction = auctionRepository.findById(auctionId)
                .orElseThrow(() -> new RuntimeException("Auction not found"));
        List<AuctionParticipant> participants = participantRepository.findByAuctionId(auctionId);
        List<AuctionBid> allBids = bidRepository.findByAuctionId(auctionId);

        Workbook wb = new XSSFWorkbook();

        // Sheet 1 - Auction conditions
        Sheet condSheet = wb.createSheet("Auction Info");
        CellStyle hs = headerStyle(wb);
        int r = 0;
        condSheet.createRow(r++).createCell(0).setCellValue("AUCTION INFORMATION");
        addInfoRow(condSheet, r++, "Name", auction.getName());
        addInfoRow(condSheet, r++, "Status", auction.getStatus() != null ? auction.getStatus().getName() : "");
        addInfoRow(condSheet, r++, "Type", auction.getAuctionType() != null ? auction.getAuctionType().getName() : "");
        addInfoRow(condSheet, r++, "Project", auction.getProject() != null ? auction.getProject().getName() : "");
        addInfoRow(condSheet, r++, "Start Bid Value", auction.getStartBidValue() != null ? auction.getStartBidValue().toString() : "");
        addInfoRow(condSheet, r++, "Max Bid Value", auction.getMaxBidValue() != null ? auction.getMaxBidValue().toString() : "");
        addInfoRow(condSheet, r++, "Last Bid Value", auction.getLastBidValue() != null ? auction.getLastBidValue().toString() : "");
        addInfoRow(condSheet, r++, "Currency", auction.getCurrency() != null ? auction.getCurrency().getName() : "");
        addInfoRow(condSheet, r++, "Discuss Start", auction.getDiscussStartDate() != null ?
                new java.text.SimpleDateFormat("dd/MM/yyyy").format(auction.getDiscussStartDate()) : "");
        addInfoRow(condSheet, r++, "Discuss End", auction.getDiscussEndDate() != null ?
                new java.text.SimpleDateFormat("dd/MM/yyyy").format(auction.getDiscussEndDate()) : "");
        addInfoRow(condSheet, r++, "Auction Start", auction.getAuctionStartDate() != null ?
                new java.text.SimpleDateFormat("dd/MM/yyyy").format(auction.getAuctionStartDate()) : "");
        addInfoRow(condSheet, r++, "Auction End", auction.getAuctionEndDate() != null ?
                new java.text.SimpleDateFormat("dd/MM/yyyy").format(auction.getAuctionEndDate()) : "");
        addInfoRow(condSheet, r++, "Bid Start", auction.getBidStartDate() != null ?
                new java.text.SimpleDateFormat("dd/MM/yyyy").format(auction.getBidStartDate()) + " " + auction.getBidStartTime() : "");
        addInfoRow(condSheet, r++, "Bid End", auction.getBidEndDate() != null ?
                new java.text.SimpleDateFormat("dd/MM/yyyy").format(auction.getBidEndDate()) + " " + auction.getBidEndTime() : "");
        condSheet.autoSizeColumn(0);
        condSheet.autoSizeColumn(1);

        // Sheet 2 - Participants with bids
        Sheet partSheet = wb.createSheet("Participants & Bids");
        Row header = partSheet.createRow(0);
        setHeader(header, hs, "Company Name", "Tax ID", "Contact Email",
                "Contact Phone", "Winner", "First Bid", "Last Bid", "Total Bids");

        int rowNum = 1;
        for (AuctionParticipant p : participants) {
            if (p.getCompany() == null) continue;
            Integer companyId = p.getCompany().getId();

            // find first and last bids for this company
            Double firstBid = null;
            Double lastBid = null;
            int bidCount = 0;
            for (AuctionBid bid : allBids) {
                if (bid.getUser() != null && bid.getUser().getCompany() != null
                        && bid.getUser().getCompany().getId().equals(companyId)
                        && "key.bid.active".equals(bid.getStatus() != null ? bid.getStatus().getKey() : "")) {
                    bidCount++;
                    if (firstBid == null) firstBid = bid.getBidValue();
                    lastBid = bid.getBidValue();
                }
            }

            Row row = partSheet.createRow(rowNum++);
            row.createCell(0).setCellValue(p.getCompany().getCompanyName() != null ? p.getCompany().getCompanyName() : "");
            row.createCell(1).setCellValue(p.getCompany().getTaxId() != null ? p.getCompany().getTaxId() : "");
            row.createCell(2).setCellValue(p.getCompany().getContactEmail() != null ? p.getCompany().getContactEmail() : "");
            row.createCell(3).setCellValue(p.getCompany().getContactPhone() != null ? p.getCompany().getContactPhone() : "");
            row.createCell(4).setCellValue(p.getWinner() != null && p.getWinner() ? "YES" : "NO");
            row.createCell(5).setCellValue(firstBid != null ? firstBid : 0);
            row.createCell(6).setCellValue(lastBid != null ? lastBid : 0);
            row.createCell(7).setCellValue(bidCount);
        }

        for (int i = 0; i < 8; i++) partSheet.autoSizeColumn(i);

        response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        response.setHeader("Content-Disposition",
                "attachment; filename=\"participants_auction_" + auctionId + ".xlsx\"");
        wb.write(response.getOutputStream());
        wb.close();
    }

    private void addInfoRow(Sheet sheet, int rowNum, String label, String value) {
        Row row = sheet.createRow(rowNum);
        row.createCell(0).setCellValue(label);
        row.createCell(1).setCellValue(value);
    }
}