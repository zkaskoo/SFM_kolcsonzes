package com.example.demo.books;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class BookRequest {
    private String author;
    private String title;
    private String releaseDate; // pl: "2025-11-25T10:00"
    private String pdfBase64;
    private String pictureBase64;
    private Long price;
    private Long userId;

    // getterek, setterek
}

