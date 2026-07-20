package com.phosphate.reporting.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Entité JPA représentant un mouvement de stock (ou saisie de production) quotidien.
 * Contient les saisies brutes de l'opérateur et la référence vers la Qualité Source validée.
 */
@Entity
@Table(name = "mouvement_stock")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MouvementStock {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "date_saisie", nullable = false)
    private LocalDate dateSaisie;

    @Column(nullable = false, precision = 15, scale = 3)
    private BigDecimal tonnage;

    @Column(name = "taux_p2o5", nullable = false, precision = 5, scale = 2)
    private BigDecimal tauxP2O5;

    @Column(name = "rendement_citrique", nullable = false, precision = 5, scale = 2)
    private BigDecimal rendementCitrique;

    @Column(name = "rendement_formique", nullable = false, precision = 5, scale = 2)
    private BigDecimal rendementFormique;

    @Column(name = "taux_mgo", nullable = false, precision = 5, scale = 2)
    private BigDecimal tauxMgO;

    @Column(name = "niveau_code", nullable = false, length = 10)
    private String niveauCode;

    @Column(name = "zone_code", nullable = false, length = 10)
    private String zoneCode;

    @Column(name = "carreau_code", nullable = false)
    private Integer carreauCode;

    @Column(name = "traitement_1_code", nullable = false)
    private Integer traitement1Code;

    @Column(name = "traitement_2_code", nullable = false)
    private Integer traitement2Code;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "qualite_source_id", nullable = false)
    private QualiteSource qualiteSource;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.dateSaisie == null) {
            this.dateSaisie = LocalDate.now();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
