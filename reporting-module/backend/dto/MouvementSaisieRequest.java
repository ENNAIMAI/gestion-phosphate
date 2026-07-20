package com.phosphate.reporting.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MouvementSaisieRequest {

    private LocalDate dateSaisie;

    @NotNull(message = "Le tonnage est requis.")
    @DecimalMin(value = "0.001", message = "Le tonnage minimal est de 0.001 T.")
    private BigDecimal tonnage;

    @NotNull(message = "Le taux de P2O5 est requis.")
    @DecimalMin(value = "0.01", message = "Le taux de P2O5 doit être supérieur à 0.")
    private BigDecimal tauxP2O5;

    @NotNull(message = "Le rendement citrique est requis.")
    private BigDecimal rendementCitrique;

    @NotNull(message = "Le rendement formique est requis.")
    private BigDecimal rendementFormique;

    @NotNull(message = "Le taux de MgO est requis.")
    private BigDecimal tauxMgO;

    // Dimensions Qualités Sources - Unité
    @NotNull(message = "L'unité est requise.")
    private String unite;

    @NotNull(message = "Le code de l'unité est requis.")
    @Min(1) @Max(9)
    private Integer uniteCode;

    // Dimensions Qualités Sources - Localisation
    @NotNull(message = "Le code niveau est requis.")
    private String niveauCode;

    @NotNull(message = "Le code zone est requis.")
    private String zoneCode;

    @NotNull(message = "Le carreau est requis.")
    private String carreau;

    @NotNull(message = "Le code carreau est requis.")
    @Min(1) @Max(3)
    private Integer carreauCode;

    // Dimensions Qualités Sources - Traitements
    @NotNull(message = "Le premier traitement est requis.")
    private String traitement1;

    @NotNull(message = "Le code du premier traitement est requis.")
    @Min(1) @Max(8)
    private Integer traitement1Code;

    @NotNull(message = "Le second traitement est requis.")
    private String traitement2;

    @NotNull(message = "Le code du second traitement est requis.")
    @Min(1) @Max(8)
    private Integer traitement2Code;
}
