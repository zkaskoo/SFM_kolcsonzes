package com.example.demo.books;

import com.example.demo.appuser.AppUserRepository;
import com.example.demo.buybook.BuyAndChange;
import com.example.demo.buybook.BuyAndChangeRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import com.example.demo.appuser.AppUser;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BookService {

    private final BookRepository bookRepository;
    private final AppUserRepository appUserRepository;
    private final BuyAndChangeRepository buyAndChangeRepository;

    @PersistenceContext
    private EntityManager entityManager;

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

        AppUser appUser2 = appUserRepository.findById(userId)
                .orElseThrow(() -> new UsernameNotFoundException("A felahsználó nem található"));

        if (appUser.getMoney() < price){
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Nincs elég pénzed a raktárban!");
        }


        BuyAndChange buyAndChange = new BuyAndChange();
        buyAndChange.setCustomerAccept(0);
        buyAndChange.setSellerAccept(1);
        buyAndChange.setPrice(price);
        buyAndChange.setCustomerUserId(id);
        buyAndChange.setCustomerUsername(appUser.getRealUsername());
        buyAndChange.setSellerUsername(appUser2.getRealUsername());
        buyAndChange.setPay(true);
        buyAndChange.setSellerUserId(userId);

        buyAndChangeRepository.save(buyAndChange);
    }

    public void changeBook(Long id, Long requestBookId, Long responseBookId){
        Book book = bookRepository.findById(requestBookId)
                .orElseThrow(() -> new BookNotFoundException("A könyv nem található, ID: " + responseBookId));

        Long userId = book.getUserId();

        AppUser appUser = appUserRepository.findById(id)
                .orElseThrow(() -> new UsernameNotFoundException("A felahsználó nem található"));
    }

    public Double getMoney(Long id)
    {
        AppUser appUser = appUserRepository.findById(id)
                .orElseThrow(() -> new UsernameNotFoundException("A felahsználó nem található"));

        return appUser.getMoney();
    }

    public List<Book> getFilteredBook(Long id, String title, String author, Long maximumPrice) {
        CriteriaBuilder cb = entityManager.getCriteriaBuilder();
        CriteriaQuery<Book> query = cb.createQuery(Book.class);
        Root<Book> book = query.from(Book.class);

        List<Predicate> predicates = new ArrayList<>();

        // Mindig kizárjuk a saját user könyveit
        if (id != null) {
            predicates.add(cb.notEqual(book.get("userId"), id));
        }

        // Szűrés cím alapján
        if (title != null && !title.isEmpty()) {
            predicates.add(cb.like(cb.lower(book.get("title")), "%" + title.toLowerCase() + "%"));
        }

        // Szűrés szerző alapján
        if (author != null && !author.isEmpty()) {
            predicates.add(cb.like(cb.lower(book.get("author")), "%" + author.toLowerCase() + "%"));
        }

        // Szűrés maximum árra (csak kisebb vagy egyenlő könyvek)
        if (maximumPrice != null) {
            predicates.add(cb.le(book.get("price"), maximumPrice));
        }

        query.select(book).where(predicates.toArray(new Predicate[0]));

        return entityManager.createQuery(query).getResultList();
    }





}
