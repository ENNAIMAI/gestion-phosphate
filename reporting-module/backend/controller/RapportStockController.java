package com.phosphate.reporting.controller;

import com.phosphate.reporting.dto.RapportStockRequest;
import com.phosphate.reporting.model.RapportStockJournalier;
import com.phosphate.reporting.service.ReportingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

/**
 * Contrôleur REST pour la gestion des rapports de stock journaliers.
 */
@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // Autorise les requêtes cross-origin du frontend React
public class RapportStockController {

    private final ReportingService reportingService;

    /**
     * Crée et enregistre un rapport de stock journalier.
     * Valide les données d'entrée grâce aux annotations JSR-380.
     *
     * @param request Le DTO contenant les données du rapport journalier
     * @return ResponseEntity contenant l'objet sauvegardé ou un message de succès
     */
    @PostMapping("/stocks")
    public ResponseEntity<?> createDailyReport(@Valid @RequestBody RapportStockRequest request) {
        
        RapportStockJournalier savedRapport = reportingService.saveDailyReport(
                request.getQuantite(),
                request.getP2o5(),
                request.getOperateur(),
                request.getRemarques(),
                
                request.getUnite(),
                request.getUniteCode(),
                
                request.getIndexCode(),
                request.getQualityIndex(),
                
                request.getNiveau(),
                request.getNiveauCode(),
                
                request.getZone(),
                request.getZoneCode(),
                
                request.getCarreau(),
                request.getCarreauCode(),
                
                request.getTrait1(),
                request.getTrait1Code(),
                
                request.getTrait2(),
                request.getTrait2Code()
        );

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Le rapport de stock journalier a été enregistré avec succès.");
        response.put("data", Map.of(
                "id", savedRapport.getId(),
                "quantiteTonne", savedRapport.getQuantiteTonne(),
                "teneurP2o5", savedRapport.getTeneurP2o5(),
                "teneurBpl", savedRapport.getTeneurBpl(),
                "compositeCode", savedRapport.getQualiteSource().getCompositeCode(),
                "readableQuality", savedRapport.getQualiteSource().toReadableString()
        ));

        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }
}
