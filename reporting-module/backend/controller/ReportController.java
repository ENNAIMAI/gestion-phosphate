package com.phosphate.reporting.controller;

import com.phosphate.reporting.service.AdvancedReportService;
import com.phosphate.reporting.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;

/**
 * Contrôleur REST pour l'exportation automatique de rapports d'activité (Rapport GF).
 */
@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ReportController {

    private final ReportService reportService;
    private final AdvancedReportService advancedReportService;

    /**
     * Génère et télécharge le rapport d'état des stocks au format Excel (.xlsx).
     */
    @GetMapping("/excel")
    public ResponseEntity<byte[]> downloadExcelReport() {
        try {
            byte[] excelContent = reportService.generateExcelReport();

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
            headers.setContentDispositionFormData("attachment", "rapport-flux-phosphate.xlsx");
            headers.setCacheControl("must-revalidate, post-check=0, pre-check=0");

            return new ResponseEntity<>(excelContent, headers, HttpStatus.OK);
        } catch (IOException e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Génère et télécharge le rapport d'état des stocks au format PDF.
     */
    @GetMapping("/pdf")
    public ResponseEntity<byte[]> downloadPdfReport() {
        byte[] pdfContent = reportService.generatePdfReport();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "rapport-flux-phosphate.pdf");
        headers.setCacheControl("must-revalidate, post-check=0, pre-check=0");

        return new ResponseEntity<>(pdfContent, headers, HttpStatus.OK);
    }

    /**
     * Génère et télécharge le rapport intelligent basé sur le gabarit Excel (Rapport GF IA).
     */
    @PostMapping("/generate-gf")
    public ResponseEntity<byte[]> downloadAdvancedGFReport() {
        try {
            byte[] excelContent = advancedReportService.generateGFReport();

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
            headers.setContentDispositionFormData("attachment", "modele_rapport_gf.xlsx");
            headers.setCacheControl("must-revalidate, post-check=0, pre-check=0");

            return new ResponseEntity<>(excelContent, headers, HttpStatus.OK);
        } catch (IOException e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
