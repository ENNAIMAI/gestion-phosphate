package com.phosphate.reporting.repository;

import com.phosphate.reporting.model.RapportStockJournalier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface RapportStockJournalierRepository extends JpaRepository<RapportStockJournalier, Long> {
    
    /**
     * Recherche les rapports pour une date donnée.
     *
     * @param dateRapport La date à rechercher
     * @return Liste de rapports journaliers
     */
    List<RapportStockJournalier> findByDateRapport(LocalDate dateRapport);
}
