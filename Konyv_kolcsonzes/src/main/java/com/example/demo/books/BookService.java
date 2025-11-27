package com.example.demo.books;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BookService {

    private final BookRepository bookRepository;

    public void addNewBook(String author, String title, String releaseDate, byte[] pdf, byte[] picture, Long userId, Long price){
        Book book = new Book();
        book.setAuthor(author);
        book.setTitle(title);
        book.setReleaseDate(releaseDate);
        book.setPdfFile(pdf);
        book.setPicture(picture);
        book.setUserId(userId);
        book.setPrice(price);

        bookRepository.save(book);
    }

    public List<Book> myPrivateBooks(Long userId){
        return bookRepository.findByUserIdAndIsPrivateTrue(userId);
    }

    public List<Book> myPublicBooks(Long userId){
        return bookRepository.findByUserIdAndIsPrivateFalse(userId);
    }

    @Transactional
    public void changeMyPrivateBookToPublicBook(Long bookId) {

        // 1. Könyv lekérése az ID alapján
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new BookNotFoundException("A könyv nem található, ID: " + bookId));

        book.setPrivate(false);

        bookRepository.save(book);
    }

    @Transactional
    public void changeMyPublicBookToPrivateBook(Long bookId) {

        // 1. Könyv lekérése az ID alapján
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new BookNotFoundException("A könyv nem található, ID: " + bookId));

        book.setPrivate(true);

        bookRepository.save(book);
    }



}
