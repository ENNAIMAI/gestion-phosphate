package com.phosphate.reporting.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Exception levée lorsque la clé composite de qualité source n'existe pas en base de données.
 * Annotée pour renvoyer automatiquement un statut HTTP 400 (Bad Request).
 */
@ResponseStatus(HttpStatus.BAD_REQUEST)
public class SourceQualityNotFoundException extends RuntimeException {
    
    public SourceQualityNotFoundException(String message) {
        super(message);
    }
}
