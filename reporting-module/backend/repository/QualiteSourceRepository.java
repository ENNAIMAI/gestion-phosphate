package com.phosphate.reporting.repository;

import com.phosphate.reporting.model.QualiteSource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface QualiteSourceRepository extends JpaRepository<QualiteSource, Long> {
    
    /**
     * Recherche une qualité source par son code composite unique d'harmonisation.
     *
     * @param compositeCode Le code composite 8 caractères (ex: 21112128)
     * @return Un Optional contenant la qualité source si elle existe
     */
    Optional<QualiteSource> findByCompositeCode(String compositeCode);
}
