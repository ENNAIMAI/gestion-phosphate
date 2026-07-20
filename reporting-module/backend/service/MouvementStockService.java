package com.phosphate.reporting.service;

import com.phosphate.reporting.dto.MouvementSaisieRequest;
import com.phosphate.reporting.exception.SourceQualityNotFoundException;
import com.phosphate.reporting.model.MouvementStock;
import com.phosphate.reporting.model.QualiteSource;
import com.phosphate.reporting.repository.MouvementStockRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * Service métier pour la gestion CRUD des mouvements de stock.
 */
@Service
@RequiredArgsConstructor
public class MouvementStockService {

    private final MouvementStockRepository mouvementStockRepository;
    private final QualiteSourceService qualiteSourceService;

    /**
     * Récupère la liste complète des mouvements triée par date décroissante.
     */
    public List<MouvementStock> getAllMovements() {
        return mouvementStockRepository.findAll(Sort.by(Sort.Direction.DESC, "dateSaisie"));
    }

    /**
     * Met à jour un mouvement de stock existant.
     * Recalcule et valide les analyses chimiques côté serveur (double vérification et Master Data Check).
     *
     * @param id L'identifiant du mouvement
     * @param request Le DTO de mise à jour du mouvement
     * @return Le mouvement mis à jour et sauvegardé
     * @throws SourceQualityNotFoundException Si la qualité source résultante est invalide
     */
    @Transactional
    public MouvementStock updateMovement(Long id, MouvementSaisieRequest request) {
        MouvementStock existingMouvement = mouvementStockRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Mouvement de stock introuvable (ID: " + id + ")"));

        // 1. Recalculs chimiques côté serveur (double vérification)
        BigDecimal computedBpl = qualiteSourceService.calculateBplFromP2o5(request.getTauxP2O5());
        String calculatedBplClass = qualiteSourceService.determineBplClass(computedBpl);
        
        // 2. Déduction de l'index de qualité
        String computedIndex = qualiteSourceService.determineQualityIndex(
                request.getRendementCitrique(),
                request.getRendementFormique(),
                request.getTauxMgO()
        );

        // 3. Génération du code composite théorique
        String compositeCode = qualiteSourceService.generateCompositeCode(
                request.getUniteCode(),
                calculatedBplClass,
                computedIndex,
                request.getNiveauCode(),
                request.getZoneCode(),
                request.getCarreauCode(),
                request.getTraitement1Code(),
                request.getTraitement2Code()
        );

        // 4. Protection du Master Data : Résolution de la qualité source
        // Lève SourceQualityNotFoundException (HTTP 400) si la combinaison n'existe pas
        QualiteSource qualiteSource = qualiteSourceService.resolveQualiteSource(compositeCode);

        // 5. Mise à jour des champs
        existingMouvement.setDateSaisie(request.getDateSaisie() != null ? request.getDateSaisie() : LocalDate.now());
        existingMouvement.setTonnage(request.getTonnage());
        existingMouvement.setTauxP2O5(request.getTauxP2O5());
        existingMouvement.setRendementCitrique(request.getRendementCitrique());
        existingMouvement.setRendementFormique(request.getRendementFormique());
        existingMouvement.setTauxMgO(request.getTauxMgO());
        existingMouvement.setNiveauCode(request.getNiveauCode());
        existingMouvement.setZoneCode(request.getZoneCode());
        existingMouvement.setCarreauCode(request.getCarreauCode());
        existingMouvement.setTraitement1Code(request.getTraitement1Code());
        existingMouvement.setTraitement2Code(request.getTraitement2Code());
        existingMouvement.setQualiteSource(qualiteSource);

        return mouvementStockRepository.save(existingMouvement);
    }

    /**
     * Supprime définitivement un mouvement de stock.
     *
     * @param id L'identifiant du mouvement
     */
    @Transactional
    public void deleteMovement(Long id) {
        if (!mouvementStockRepository.existsById(id)) {
            throw new IllegalArgumentException("Impossible de supprimer : Mouvement de stock introuvable (ID: " + id + ")");
        }
        mouvementStockRepository.deleteById(id);
    }
}
