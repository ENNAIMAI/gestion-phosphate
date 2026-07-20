package com.phosphate.reporting.model;

import jakarta.persistence.*;
import lombok.*;

/**
 * Entité représentant le référentiel des Qualités Sources (Master Data).
 * Contient les codes d'harmonisation de l'extraction au traitement.
 */
@Entity
@Table(name = "qualite_source")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QualiteSource {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 10)
    private String unite;
    
    @Column(name = "unite_code", nullable = false)
    private Integer uniteCode;

    @Column(name = "bpl_class", nullable = false, length = 10)
    private String bplClass;

    @Column(name = "bpl_class_code", nullable = false, length = 2)
    private String bplClassCode;

    @Column(name = "quality_index", nullable = false, length = 10)
    private String qualityIndex;

    @Column(name = "quality_index_code", nullable = false)
    private Integer qualityIndexCode;

    @Column(nullable = false, length = 10)
    private String niveau;

    @Column(name = "niveau_code", nullable = false, length = 2)
    private String niveauCode;

    @Column(nullable = false, length = 10)
    private String zone;

    @Column(name = "zone_code", nullable = false, length = 2)
    private String zoneCode;

    @Column(nullable = false, length = 10)
    private String carreau;

    @Column(name = "carreau_code", nullable = false)
    private Integer carreauCode;

    @Column(name = "traitement_1", nullable = false, length = 10)
    private String traitement1;

    @Column(name = "traitement_1_code", nullable = false)
    private Integer traitement1Code;

    @Column(name = "traitement_2", nullable = false, length = 10)
    private String traitement2;

    @Column(name = "traitement_2_code", nullable = false)
    private Integer traitement2Code;

    @Column(name = "composite_code", unique = true, nullable = false, length = 50)
    private String compositeCode;

    /**
     * Génère la chaîne composite abrégée lisible (ex: UL1-THT-RC-SA2-L31-BO-L-K)
     */
    public String toReadableString() {
        return String.join("-", unite, bplClass, qualityIndex, niveau, zone, carreau, traitement1, traitement2);
    }
}
