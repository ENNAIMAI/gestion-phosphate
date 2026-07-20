package com.phosphate.reporting.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Entité représentant l'enregistrement journalier d'un stock de phosphate avec ses tonnages et analyses chimiques.
 */
@Entity
@Table(name = "rapport_stock_journalier")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RapportStockJournalier {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "qualite_source_id", nullable = false)
    private QualiteSource qualiteSource;

    @Column(name = "quantite_tonne", nullable = false, precision = 15, scale = 3)
    private BigDecimal quantiteTonne;

    @Column(name = "teneur_p2o5", nullable = false, precision = 5, scale = 2)
    private BigDecimal teneurP2o5;

    @Column(name = "teneur_bpl", nullable = false, precision = 5, scale = 2)
    private BigDecimal teneurBpl;

    @Column(name = "date_rapport", nullable = false)
    private LocalDate dateRapport;

    @Column(name = "operateur_username", nullable = false)
    private String operateurUsername;

    @Column(columnDefinition = "TEXT")
    private String remarques;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.dateRapport == null) {
            this.dateRapport = LocalDate.now();
        }
    }
}
