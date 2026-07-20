package com.phosphate.reporting.service;

import com.phosphate.reporting.exception.SourceQualityNotFoundException;
import com.phosphate.reporting.model.QualiteSource;
import com.phosphate.reporting.repository.QualiteSourceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Map;

/**
 * Service pour la résolution de la Qualité Source (Master Data)
 * et les calculs de conversion chimique (BPL, Index).
 */
@Service
@RequiredArgsConstructor
public class QualiteSourceService {

    private final QualiteSourceRepository qualiteSourceRepository;

    private static final BigDecimal BPL_CONVERSION_FACTOR = new BigDecimal("2.1853");

    private static final Map<String, String> BPL_CODE_MAP = Map.of(
        "SHT", "1", "THT", "2", "HTN", "3", "HTM", "4", "MT", "5",
        "BTR", "6", "BTN", "7", "BTP", "8", "TBT", "9", "XBT", "A"
    );

    private static final Map<String, Integer> INDEX_CODE_MAP = Map.of(
        "NONE", 0, "RC", 1, "RF", 2, "FMgO", 3
    );

    /**
     * Règle de conversion chimique : %BPL = %P2O5 * 2.1853
     */
    public BigDecimal calculateBplFromP2o5(BigDecimal p2o5) {
        if (p2o5 == null) return BigDecimal.ZERO;
        return p2o5.multiply(BPL_CONVERSION_FACTOR).setScale(2, RoundingMode.HALF_UP);
    }

    /**
     * Détermine la Classe BPL à partir du pourcentage BPL.
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
     * Déduit l'index de qualité à partir du rendement citrique, rendement formique et taux de MgO.
     * Règle d'association :
     * 1. Citrique >= 28% -> RC (Code 1)
     * 2. Formique >= 45% -> RF (Code 2)
     * 3. MgO <= 0.55% -> FMgO (Code 3)
     * 4. Sinon -> NONE (Code 0)
     */
    public String determineQualityIndex(BigDecimal citrique, BigDecimal formique, BigDecimal mgo) {
        if (citrique != null && citrique.doubleValue() >= 28.0) {
            return "RC";
        }
        if (formique != null && formique.doubleValue() >= 45.0) {
            return "RF";
        }
        if (mgo != null && mgo.doubleValue() <= 0.55 && mgo.doubleValue() > 0) {
            return "FMgO";
        }
        return "NONE";
    }

    /**
     * Génère le code composite de 8 caractères.
     */
    public String generateCompositeCode(
            Integer uniteCode,
            String bplClass,
            String indexVal,
            String niveauCode,
            String zoneCode,
            Integer carreauCode,
            Integer trait1Code,
            Integer trait2Code
    ) {
        String bplCode = BPL_CODE_MAP.getOrDefault(bplClass, "A");
        Integer indexCode = INDEX_CODE_MAP.getOrDefault(indexVal, 0);
        
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
     * Résout la Qualité Source (Master Data) par son code composite.
     * Lève une exception si elle n'existe pas en base.
     */
    public QualiteSource resolveQualiteSource(String compositeCode) {
        return qualiteSourceRepository.findByCompositeCode(compositeCode)
                .orElseThrow(() -> new SourceQualityNotFoundException(
                        "Code qualité source invalide (" + compositeCode + "). " +
                        "Cette combinaison de caractéristiques n'est pas répertoriée dans le référentiel Master Data. " +
                        "Veuillez vérifier votre saisie d'analyses chimiques et de traçabilité."
                ));
    }
}
