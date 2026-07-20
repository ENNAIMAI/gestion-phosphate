package com.phosphate.reporting.repository;

import com.phosphate.reporting.model.MouvementStock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface MouvementStockRepository extends JpaRepository<MouvementStock, Long> {
    
    /**
     * Recherche tous les mouvements de stock enregistrés à une date de saisie spécifique.
     *
     * @param dateSaisie La date de saisie
     * @return Liste de mouvements de stock
     */
    List<MouvementStock> findByDateSaisie(LocalDate dateSaisie);
}
