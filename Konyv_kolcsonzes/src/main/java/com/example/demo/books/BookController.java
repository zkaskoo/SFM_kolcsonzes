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

    @PostMapping("/privatebooks")
    public ResponseEntity<List<Book>> getPrivateBooks(@RequestBody MyBookRequest request) {
        List<Book> books = bookService.myPrivateBooks(request.getUserId());
        if (books.isEmpty()) {
            return ResponseEntity.noContent().build();
        }

        return ResponseEntity.ok(books);
    }

    @PostMapping("/publicbooks")
    public ResponseEntity<List<Book>> getPublicBooks(@RequestBody MyBookRequest request) {
        List<Book> books = bookService.myPublicBooks(request.getUserId());
        if (books.isEmpty()) {
            return ResponseEntity.noContent().build();
        }

        return ResponseEntity.ok(books);
    }

    @PostMapping("/changeprivate")
    public ResponseEntity<Void> makeBookPrivate(@RequestBody ChangeBookRequest request) {

        Long bookId = request.getBookId();

        try {
            // Hívja a Service metódust, ami isPrivate=TRUE-ra állít
            bookService.changeMyPublicBookToPrivateBook(bookId);

            // Sikeres módosítás: 204 No Content
            return ResponseEntity.noContent().build();

        } catch (BookNotFoundException e) {
            // Könyv nem található: 404 Not Found (Ezt az @ResponseStatus kezeli)
            throw e;
        }
    }

    @PostMapping("changepublic")
    public ResponseEntity<Void> makeBookPublic(@RequestBody ChangeBookRequest request) {

        Long bookId = request.getBookId();
        System.out.println(bookId);
        try {
            // Hívja a Service metódust, ami isPrivate=FALSE-ra állít
            bookService.changeMyPrivateBookToPublicBook(bookId);

            // Sikeres módosítás: 204 No Content
            return ResponseEntity.noContent().build();

        } catch (BookNotFoundException e) {
            // Könyv nem található: 404 Not Found
            throw e;
        }
    }

    @PostMapping("/allbooks")
    public ResponseEntity<List<Book>> getAllBooks(@RequestBody MyBookRequest request) {
        List<Book> books = bookService.getMyAllBooks(request.getUserId());
        if (books.isEmpty()) {
            return ResponseEntity.noContent().build();
        }

        return ResponseEntity.ok(books);
    }

    @PostMapping("/others")
    public List<Book> getAllBooksWithoutOwnBooks(@RequestBody AllBookRequest request) {
        return bookService.getAllBooksWithoutOwnBooks(request.getId());
    }

}


