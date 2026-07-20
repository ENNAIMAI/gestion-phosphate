package com.phosphate.reporting.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RapportStockRequest {

    @NotNull(message = "La quantité est requise.")
    @DecimalMin(value = "0.001", message = "La quantité minimale est de 0.001 T.")
    private BigDecimal quantite;

    @NotNull(message = "L'analyse chimique en P2O5 est requise.")
    @DecimalMin(value = "0.01", message = "Le taux de P2O5 doit être supérieur à 0.")
    private BigDecimal p2o5;

    private String operateur;
    private String remarques;

    // Dimensions Qualités Sources - Unité
    @NotNull(message = "Le libellé de l'unité est requis.")
    private String unite;

    @NotNull(message = "Le code de l'unité est requis.")
    @Min(1) @Max(9)
    private Integer uniteCode;

    // Dimensions Qualités Sources - Index
    @NotNull(message = "L'index de qualité est requis.")
    private String qualityIndex;

    @NotNull(message = "Le code de l'index de qualité est requis.")
    @Min(0) @Max(3)
    private Integer indexCode;

    // Dimensions Qualités Sources - Niveau
    @NotNull(message = "Le niveau de couche géologique est requis.")
    private String niveau;

    @NotNull(message = "Le code du niveau de couche géologique est requis.")
    private String niveauCode;

    // Dimensions Qualités Sources - Zone
    @NotNull(message = "La zone de mine est requise.")
    private String zone;

    @NotNull(message = "Le code de la zone de mine est requis.")
    private String zoneCode;

    // Dimensions Qualités Sources - Carreau
    @NotNull(message = "Le carreau d'origine est requis.")
    private String carreau;

    @NotNull(message = "Le code du carreau d'origine est requis.")
    @Min(1) @Max(3)
    private Integer carreauCode;

    // Dimensions Qualités Sources - 1er Traitement
    @NotNull(message = "Le premier traitement est requis.")
    private String trait1;

    @NotNull(message = "Le code du premier traitement est requis.")
    @Min(1) @Max(8)
    private Integer trait1Code;

    // Dimensions Qualités Sources - 2ème Traitement
    @NotNull(message = "Le second traitement est requis.")
    private String trait2;

    @NotNull(message = "Le code du second traitement est requis.")
    @Min(1) @Max(8)
    private Integer trait2Code;
}
