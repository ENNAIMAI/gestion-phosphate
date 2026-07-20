package com.phosphate.reporting.service;

import com.lowagie.text.*;
import com.lowagie.text.Font;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.phosphate.reporting.model.MouvementStock;
import com.phosphate.reporting.repository.MouvementStockRepository;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final MouvementStockRepository mouvementStockRepository;

    /**
     * Génère un fichier Excel (.xlsx) contenant tous les mouvements de stock
     * avec une mise en forme professionnelle et un total cumulé.
     */
    public byte[] generateExcelReport() throws IOException {
        List<MouvementStock> mouvements = mouvementStockRepository.findAll(Sort.by(Sort.Direction.DESC, "dateSaisie"));

        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Mouvements de Stocks");

            // Style d'en-tête (Gras, fond vert foncé, écriture blanche)
            CellStyle headerStyle = workbook.createCellStyle();
            org.apache.poi.ss.usermodel.Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerFont.setColor(IndexedColors.WHITE.getIndex());
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.DARK_GREEN.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            headerStyle.setAlignment(HorizontalAlignment.CENTER);

            // Style de données numériques
            CellStyle decimalStyle = workbook.createCellStyle();
            decimalStyle.setDataFormat(workbook.createDataFormat().getFormat("#,##0.00"));

            // En-têtes du rapport
            String[] columns = {
                "Date Saisie", "Unité", "Code Composite", "Classe BPL", 
                "Tonnage (T)", "Taux P2O5 (%)", "Est. BPL (%)", 
                "Niveau", "Zone", "Carreau"
            };

            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < columns.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(columns[i]);
                cell.setCellStyle(headerStyle);
            }

            // Insertion des données
            int rowIdx = 1;
            BigDecimal totalTonnage = BigDecimal.ZERO;

            for (MouvementStock mov : mouvements) {
                Row row = sheet.createRow(rowIdx++);
                
                row.createCell(0).setCellValue(mov.getDateSaisie().toString());
                row.createCell(1).setCellValue(mov.getQualiteSource().getUnite());
                row.createCell(2).setCellValue(mov.getQualiteSource().getCompositeCode());
                row.createCell(3).setCellValue(mov.getQualiteSource().getBplClass());
                
                Cell tonnageCell = row.createCell(4);
                tonnageCell.setCellValue(mov.getTonnage().doubleValue());
                tonnageCell.setCellStyle(decimalStyle);
                totalTonnage = totalTonnage.add(mov.getTonnage());

                row.createCell(5).setCellValue(mov.getTauxP2O5().doubleValue());
                
                // Calcul estimation BPL = P2O5 * 2.1853
                double bplVal = mov.getTauxP2O5().doubleValue() * 2.1853;
                row.createCell(6).setCellValue(Math.round(bplVal * 100.0) / 100.0);

                row.createCell(7).setCellValue(mov.getNiveauCode());
                row.createCell(8).setCellValue(mov.getZoneCode());
                
                // Libellé Carreau
                String carreauLibelle = mov.getQualiteSource().getCarreau();
                row.createCell(9).setCellValue(carreauLibelle);
            }

            // Ligne de Totalisation des tonnages
            Row totalRow = sheet.createRow(rowIdx);
            CellStyle totalStyle = workbook.createCellStyle();
            org.apache.poi.ss.usermodel.Font totalFont = workbook.createFont();
            totalFont.setBold(true);
            totalStyle.setFont(totalFont);

            Cell labelCell = totalRow.createCell(3);
            labelCell.setCellValue("TOTAL CUMULÉ :");
            labelCell.setCellStyle(totalStyle);

            Cell sumCell = totalRow.createCell(4);
            sumCell.setCellValue(totalTonnage.doubleValue());
            sumCell.setCellStyle(totalStyle);
            sumCell.setCellStyle(decimalStyle);

            // Ajustement automatique des colonnes
            for (int i = 0; i < columns.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);
            return out.toByteArray();
        }
    }

    /**
     * Génère un rapport PDF professionnel récapitulant les mouvements de stock.
     */
    public byte[] generatePdfReport() {
        List<MouvementStock> mouvements = mouvementStockRepository.findAll(Sort.by(Sort.Direction.DESC, "dateSaisie"));
        
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4, 36, 36, 54, 36);
            PdfWriter.getInstance(document, out);
            document.open();

            // Titre & Métadonnées du rapport
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18, Font.BOLD, java.awt.Color.DARK_GRAY);
            Paragraph title = new Paragraph("RAPPORT GLOBAL D'ÉTAT DES STOCKS DE PHOSPHATE", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingAfter(20);
            document.add(title);

            // Date de génération du rapport
            Font metaFont = FontFactory.getFont(FontFactory.HELVETICA, 10, Font.ITALIC, java.awt.Color.GRAY);
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss");
            Paragraph meta = new Paragraph("Rapport généré automatiquement le : " + LocalDateTime.now().format(formatter), metaFont);
            meta.setAlignment(Element.ALIGN_RIGHT);
            meta.setSpacingAfter(30);
            document.add(meta);

            // Configuration de la Table PDF (7 colonnes)
            PdfPTable table = new PdfPTable(7);
            table.setWidthPercentage(100);
            table.setWidths(new float[]{1.5f, 1f, 2f, 1.5f, 1.5f, 1f, 1f});

            // Style des en-têtes
            Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, Font.BOLD, java.awt.Color.WHITE);
            java.awt.Color headerBg = new java.awt.Color(34, 139, 34); // Forest Green

            String[] headers = {"Date", "Unité", "Code Qualité", "Classe BPL", "Tonnage (T)", "% P2O5", "% BPL"};
            for (String header : headers) {
                PdfPCell cell = new PdfPCell(new Paragraph(header, headerFont));
                cell.setBackgroundColor(headerBg);
                cell.setHorizontalAlignment(Element.ALIGN_CENTER);
                cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
                cell.setPadding(6);
                table.addCell(cell);
            }

            // Style des cellules
            Font cellFont = FontFactory.getFont(FontFactory.HELVETICA, 9, Font.NORMAL, java.awt.Color.BLACK);
            BigDecimal totalTonnage = BigDecimal.ZERO;

            for (MouvementStock mov : mouvements) {
                table.addCell(new PdfPCell(new Paragraph(mov.getDateSaisie().toString(), cellFont)));
                table.addCell(new PdfPCell(new Paragraph(mov.getQualiteSource().getUnite(), cellFont)));
                table.addCell(new PdfPCell(new Paragraph(mov.getQualiteSource().getCompositeCode(), cellFont)));
                table.addCell(new PdfPCell(new Paragraph(mov.getQualiteSource().getBplClass(), cellFont)));
                
                // Tonnage formaté
                String tonnageText = String.format("%,.3f", mov.getTonnage());
                PdfPCell tonnageCell = new PdfPCell(new Paragraph(tonnageText, cellFont));
                tonnageCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
                table.addCell(tonnageCell);
                totalTonnage = totalTonnage.add(mov.getTonnage());

                // Taux
                table.addCell(new PdfPCell(new Paragraph(mov.getTauxP2O5() + "%", cellFont)));
                
                double bplVal = mov.getTauxP2O5().doubleValue() * 2.1853;
                table.addCell(new PdfPCell(new Paragraph(String.format("%.2f%%", bplVal), cellFont)));
            }

            // Ligne de total
            Font totalFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, Font.BOLD, java.awt.Color.BLACK);
            PdfPCell totalLabel = new PdfPCell(new Paragraph("TOTAL CUMULÉ :", totalFont));
            totalLabel.setColspan(4);
            totalLabel.setHorizontalAlignment(Element.ALIGN_RIGHT);
            totalLabel.setPadding(6);
            table.addCell(totalLabel);

            PdfPCell totalValCell = new PdfPCell(new Paragraph(String.format("%,.3f T", totalTonnage), totalFont));
            totalValCell.setColspan(3);
            totalValCell.setHorizontalAlignment(Element.ALIGN_LEFT);
            totalValCell.setPadding(6);
            table.addCell(totalValCell);

            document.add(table);
            document.close();
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Erreur lors de la génération du rapport PDF", e);
        }
    }
}
