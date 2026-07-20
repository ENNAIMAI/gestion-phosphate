package com.phosphate.reporting.controller;

import com.phosphate.reporting.dto.MouvementSaisieRequest;
import com.phosphate.reporting.model.MouvementStock;
import com.phosphate.reporting.model.QualiteSource;
import com.phosphate.reporting.repository.MouvementStockRepository;
import com.phosphate.reporting.service.MouvementStockService;
import com.phosphate.reporting.service.QualiteSourceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Contrôleur REST pour la saisie et gestion quotidienne des mouvements de stock.
 */
@RestController
@RequestMapping("/api/stocks")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class StockController {

    private final QualiteSourceService qualiteSourceService;
    private final MouvementStockRepository mouvementStockRepository;
    private final MouvementStockService mouvementStockService;

    /**
     * Récupère la liste complète des mouvements triée par date décroissante.
     */
    @GetMapping
    public ResponseEntity<List<MouvementStock>> getMovements() {
        return ResponseEntity.ok(mouvementStockService.getAllMovements());
    }

    /**
     * Reçoit les saisies brutes de production journalières, valide le %BPL et l'index chimiquement,
     * résout la Qualité Source (Master Data) et enregistre le mouvement.
     *
     * @param request Le DTO contenant les mesures brutes de l'opérateur
     * @return ResponseEntity contenant les informations du mouvement enregistré
     */
    @PostMapping("/saisir")
    public ResponseEntity<?> saisirMouvement(@Valid @RequestBody MouvementSaisieRequest request) {
        
        // 1. Calculs chimiques par le service
        BigDecimal bplTeneur = qualiteSourceService.calculateBplFromP2o5(request.getTauxP2O5());
        String bplClass = qualiteSourceService.determineBplClass(bplTeneur);
        
        // 2. Déduction de l'index de qualité par le service
        String computedIndex = qualiteSourceService.determineQualityIndex(
                request.getRendementCitrique(),
                request.getRendementFormique(),
                request.getTauxMgO()
        );

        // 3. Génération du code composite théorique
        String compositeCode = qualiteSourceService.generateCompositeCode(
                request.getUniteCode(),
                bplClass,
                computedIndex,
                request.getNiveauCode(),
                request.getZoneCode(),
                request.getCarreauCode(),
                request.getTraitement1Code(),
                request.getTraitement2Code()
        );

        // 4. Recherche de la Qualité Source (Master Data Protection)
        // Lève une SourceQualityNotFoundException (HTTP 400) si non trouvée
        QualiteSource qualiteSource = qualiteSourceService.resolveQualiteSource(compositeCode);

        // 5. Instanciation et persistance du Mouvement de stock
        MouvementStock mouvement = MouvementStock.builder()
                .dateSaisie(request.getDateSaisie() != null ? request.getDateSaisie() : LocalDate.now())
                .tonnage(request.getTonnage())
                .tauxP2O5(request.getTauxP2O5())
                .rendementCitrique(request.getRendementCitrique())
                .rendementFormique(request.getRendementFormique())
                .tauxMgO(request.getTauxMgO())
                .niveauCode(request.getNiveauCode())
                .zoneCode(request.getZoneCode())
                .carreauCode(request.getCarreauCode())
                .traitement1Code(request.getTraitement1Code())
                .traitement2Code(request.getTraitement2Code())
                .qualiteSource(qualiteSource)
                .build();

        MouvementStock savedMouvement = mouvementStockRepository.save(mouvement);

        // 6. Construction de la réponse formatée
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Mouvement de stock enregistré avec succès après validation du Master Data.");
        response.put("data", Map.of(
                "id", savedMouvement.getId(),
                "dateSaisie", savedMouvement.getDateSaisie(),
                "tonnage", savedMouvement.getTonnage(),
                "tauxBplCalcule", bplTeneur,
                "classeBplCalculee", bplClass,
                "indexQualiteCalcule", computedIndex,
                "compositeCodeQualite", compositeCode,
                "readableQuality", qualiteSource.toReadableString()
        ));

        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    /**
     * Met à jour un mouvement de stock existant avec re-validation de la qualité source.
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> modifierMouvement(@PathVariable Long id, @Valid @RequestBody MouvementSaisieRequest request) {
        MouvementStock updated = mouvementStockService.updateMovement(id, request);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Mouvement de stock modifié et re-validé avec succès.");
        response.put("data", Map.of(
                "id", updated.getId(),
                "dateSaisie", updated.getDateSaisie(),
                "tonnage", updated.getTonnage(),
                "compositeCodeQualite", updated.getQualiteSource().getCompositeCode(),
                "readableQuality", updated.getQualiteSource().toReadableString()
        ));

        return ResponseEntity.ok(response);
    }

    /**
     * Supprime définitivement un mouvement de stock.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> supprimerMouvement(@PathVariable Long id) {
        mouvementStockService.deleteMovement(id);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Le mouvement de stock a été supprimé avec succès.");

        return ResponseEntity.ok(response);
    }
}
