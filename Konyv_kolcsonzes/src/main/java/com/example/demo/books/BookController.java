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


            // PDF Base64 → byte[]
            byte[] pdfBytes = Base64.getDecoder().decode(request.getPdfBase64());

            // kép Base64 → byte[]
            byte[] pictureBytes = Base64.getDecoder().decode(request.getPictureBase64());

            bookService.addNewBook(
                    request.getAuthor(),
                    request.getTitle(),
                    request.getReleaseDate(),
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

    @GetMapping("/cover/{bookId}")
    public ResponseEntity<byte[]> getBookCover(@PathVariable Long bookId) {

        Book book = bookRepository.findById(bookId).orElse(null);

        if (book == null) {
            return ResponseEntity.notFound().build();
        }

        byte[] picture = book.getPicture();

        if (picture == null || picture.length == 0) {
            return ResponseEntity.notFound().build();
        }

        // MIME típus felismerés (PNG vagy JPG)
        String contentType = "image/jpeg";
        if (picture.length >= 4) {
            if ((picture[0] & 0xFF) == 0x89 &&
                    picture[1] == 'P' &&
                    picture[2] == 'N' &&
                    picture[3] == 'G') {
                contentType = "image/png";
            }
        }

        return ResponseEntity.ok()
                .header("Content-Type", contentType)
                .header("Cache-Control", "public, max-age=31536000")
                .body(picture);
    }
}


