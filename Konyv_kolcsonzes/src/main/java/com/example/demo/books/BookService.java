package com.example.demo.books;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BookService {

    private final BookRepository bookRepository;

    public void addNewBook(String author, String title, LocalDate releaseDate, byte[] pdf, byte[] picture, Long userId, Long price){
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

    public List<Book> myBooks(Long userId){
        return bookRepository.findByUserId(userId);
    }
}
