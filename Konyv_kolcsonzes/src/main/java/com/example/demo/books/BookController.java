package com.example.demo.books;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.List;

@RestController
@RequestMapping("/api/v1/books")
public class BookController {

    private final BookService bookService;
    private final BookRepository bookRepository;

    public BookController(BookService bookService, BookRepository bookRepository) {
        this.bookService = bookService;
        this.bookRepository = bookRepository;
    }

    @PostMapping("/add")
    public ResponseEntity<String> addNewBook(@RequestBody BookRequest request) {
        try {
            // dátum konvertálása
            LocalDate date = LocalDate.parse(request.getReleaseDate());

            // PDF Base64 → byte[]
            byte[] pdfBytes = Base64.getDecoder().decode(request.getPdfBase64());

            // kép Base64 → byte[]
            byte[] pictureBytes = Base64.getDecoder().decode(request.getPictureBase64());

            bookService.addNewBook(
                    request.getAuthor(),
                    request.getTitle(),
                    date,
                    pdfBytes,
                    pictureBytes,
                    request.getUserId(),
                    request.getPrice()
            );

            return ResponseEntity.ok("Book successfully added.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Error: " + e.getMessage());
        }
    }

    @PostMapping("/my-books")
    public ResponseEntity<List<Book>> getMyBooks(@RequestBody MyBookRequest request) {
        List<Book> books = bookService.myBooks(request.getUserId());
        return ResponseEntity.ok(books);
    }
}


