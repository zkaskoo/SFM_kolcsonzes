package com.example.demo.books;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Kivétel, amit akkor dobunk, ha egy könyv nem található az adatbázisban.
 * A @ResponseStatus jelzi a Springnek, hogy 404 (NOT_FOUND) HTTP kódot küldjön vissza.
 */
@ResponseStatus(HttpStatus.NOT_FOUND)
public class BookNotFoundException extends RuntimeException {

    public BookNotFoundException(String message) {
        super(message);
    }
}
