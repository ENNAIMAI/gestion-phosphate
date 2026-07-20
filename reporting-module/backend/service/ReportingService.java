package com.phosphate.reporting.service;

import com.phosphate.reporting.exception.SourceQualityNotFoundException;
import com.phosphate.reporting.model.QualiteSource;
import com.phosphate.reporting.model.RapportStockJournalier;
import com.phosphate.reporting.repository.QualiteSourceRepository;
import com.phosphate.reporting.repository.RapportStockJournalierRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Map;

/**
 * Service métier pour la gestion des rapports de stock journaliers.
 * Applique la double vérification du BPL et la protection stricte du Master Data.
 */
@Service
@RequiredArgsConstructor
public class ReportingService {

    private final QualiteSourceRepository qualiteSourceRepository;
    private final RapportStockJournalierRepository rapportRepository;

    // Règle de conversion chimique : %BPL = %P2O5 * 2.1853
    private static final BigDecimal CONVERSION_FACTOR = new BigDecimal("2.1853");

    // Mappage de la nomenclature BPL à son code
    private static final Map<String, String> BPL_CODE_MAP = Map.of(
        "SHT", "1", "THT", "2", "HTN", "3", "HTM", "4", "MT", "5",
        "BTR", "6", "BTN", "7", "BTP", "8", "TBT", "9", "XBT", "A"
    );

    /**
     * Calcule le pourcentage BPL à partir du pourcentage P2O5.
     */
    public BigDecimal calculateBplFromP2o5(BigDecimal p2o5) {
        if (p2o5 == null) return BigDecimal.ZERO;
        return p2o5.multiply(CONVERSION_FACTOR).setScale(2, RoundingMode.HALF_UP);
    }

    /**
     * Détermine la Classe BPL à partir du pourcentage BPL calculé.
     */
    public String determineBplClass(BigDecimal bpl) {
        if (bpl == null) return "XBT";
        double val = bpl.doubleValue();

        if (val > 75.0) return "SHT";
        if (val >= 73.0) return "THT";
        if (val >= 71.5) return "HTN";
        if (val >= 69.5) return "HTM";
        if (val >= 68.0) return "MT";
        if (val >= 65.0) return "BTR";
        if (val >= 63.0) return "BTN";
        if (val >= 61.0) return "BTP";
        if (val >= 56.0) return "TBT";
        return "XBT";
    }

    /**
     * Génère le code composite d'harmonisation de 8 caractères
     * Format : [Unité][BPL][Index][Niveau][Zone][Carreau][1er Trait][2nd Trait] (codes concaténés)
     */
    public String generateCompositeCode(
            Integer uniteCode,
            String bplClass,
            Integer indexCode,
            String niveauCode,
            String zoneCode,
            Integer carreauCode,
            Integer trait1Code,
            Integer trait2Code
    ) {
        String bplCode = BPL_CODE_MAP.getOrDefault(bplClass, "A");
        
        return String.format("%d%s%d%s%s%d%d%d",
                uniteCode,
                bplCode,
                indexCode,
                niveauCode,
                zoneCode,
                carreauCode,
                trait1Code,
                trait2Code
        );
    }

    /**
     * Valide et Enregistre le rapport de stock journalier.
     * Recalcule et valide le %BPL côté serveur pour garantir l'intégrité (Double vérification).
     * Recherche la Qualité Source en base et lève une exception si elle n'existe pas (Protection du Master Data).
     *
     * @throws SourceQualityNotFoundException Si le code composite de qualité source n'est pas répertorié
     */
    @Transactional
    public RapportStockJournalier saveDailyReport(
            BigDecimal quantite,
            BigDecimal p2o5,
            String operateur,
            String remarques,
            // Paramètres de qualité source envoyés par le client
            String unite, Integer uniteCode,
            Integer indexCode, String qualityIndex,
            String niveau, String niveauCode,
            String zone, String zoneCode,
            String carreau, Integer carreauCode,
            String trait1, Integer trait1Code,
            String trait2, Integer trait2Code
    ) {
        // 1. Double vérification côté serveur (recalcul chimique)
        BigDecimal computedBpl = calculateBplFromP2o5(p2o5);
        String calculatedBplClass = determineBplClass(computedBpl);

        // 2. Génération du code composite théorique basé sur le BPL calculé et validé par le serveur
        String compositeCode = generateCompositeCode(
                uniteCode, calculatedBplClass, indexCode, niveauCode, zoneCode, carreauCode, trait1Code, trait2Code
        );

        // 3. Protection du Master Data : Recherche stricte.
        // Si la qualité source n'existe pas, on refuse l'enregistrement et on lève une exception.
        QualiteSource qualiteSource = qualiteSourceRepository.findByCompositeCode(compositeCode)
                .orElseThrow(() -> new SourceQualityNotFoundException(
                        "Code qualité source invalide (" + compositeCode + "). " +
                        "Cette combinaison de caractéristiques n'est pas répertoriée dans le référentiel Master Data. " +
                        "Veuillez vérifier votre saisie (Unité, Teneur BPL, Traitements, etc.)."
                ));

        // 4. Persistance de la transaction de stock
        RapportStockJournalier rapport = RapportStockJournalier.builder()
                .qualiteSource(qualiteSource)
                .quantiteTonne(quantite)
                .teneurP2o5(p2o5)
                .teneurBpl(computedBpl)
                .operateurUsername(operateur != null ? operateur : "system")
                .remarques(remarques)
                .build();

        return rapportRepository.save(rapport);
    }
}
