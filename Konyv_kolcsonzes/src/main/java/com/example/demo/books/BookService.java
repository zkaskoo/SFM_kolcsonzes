package com.example.demo.books;

import com.example.demo.appuser.AppUserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import com.example.demo.appuser.AppUser;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BookService {

    private final BookRepository bookRepository;
    private final AppUserRepository appUserRepository;
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

    public List<Book> getMyAllBooks(Long userId){
        return bookRepository.findByUserId(userId);
    }

    public List<Book> getAllBooksWithoutOwnBooks(Long userId){
        return bookRepository.findAllByUserIdNot(userId);
    }

    public void buyBook(Long id, Long bookId, Long price){
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new BookNotFoundException("A könyv nem található, ID: " + bookId));

        Long userId = book.getUserId();



        AppUser appUser = appUserRepository.findById(id)
                .orElseThrow(() -> new UsernameNotFoundException("A felahsználó nem található"));

        if (appUser.getMoney() < price){
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Nincs elég pénzed a raktárban!");
        }



        AppUser appUser2 = appUserRepository.findById(userId)
                .orElseThrow(() -> new UsernameNotFoundException("A felhasználó nem található!"));

        appUser.setMoney(appUser.getMoney() - price);

        appUserRepository.save(appUser);

        book.setUserId(id);

        bookRepository.save(book);

        appUser2.setMoney(appUser2.getMoney() + price);

        appUserRepository.save(appUser2);
    }

    public Double getMoney(Long id)
    {
        AppUser appUser = appUserRepository.findById(id)
                .orElseThrow(() -> new UsernameNotFoundException("A felahsználó nem található"));

        return appUser.getMoney();
    }




}
