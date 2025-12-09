package com.example.demo.books;

import com.example.demo.appuser.AppUser;
import com.example.demo.appuser.AppUserRepository;
import com.example.demo.buybook.BuyAndChangeRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class BookServiceTest {

    private BookRepository bookRepository;
    private AppUserRepository appUserRepository;
    private BuyAndChangeRepository buyAndChangeRepository;
    private BookService bookService;

    @BeforeEach
    void setUp() {
        bookRepository = mock(BookRepository.class);
        appUserRepository = mock(AppUserRepository.class);
        bookService = new BookService(bookRepository, appUserRepository, buyAndChangeRepository);
    }

    // ---------------------------------------------------------------
    // getMyAllBooks()
    // ---------------------------------------------------------------
    @Test
    void getMyAllBooks_returnsBooksFromRepository() {
        List<Book> mockBooks = List.of(new Book(), new Book());

        when(bookRepository.findByUserId(123L)).thenReturn(mockBooks);

        List<Book> result = bookService.getMyAllBooks(123L);

        assertEquals(2, result.size());
        verify(bookRepository).findByUserId(123L);
    }

    // ---------------------------------------------------------------
    // getAllBooksWithoutOwnBooks()
    // ---------------------------------------------------------------
    @Test
    void getAllBooksWithoutOwnBooks_returnsBooksFromRepository() {
        List<Book> mockBooks = List.of(new Book());

        when(bookRepository.findAllByUserIdNot(999L)).thenReturn(mockBooks);

        List<Book> result = bookService.getAllBooksWithoutOwnBooks(999L);

        assertEquals(1, result.size());
        verify(bookRepository).findAllByUserIdNot(999L);
    }


    // ---------------------------------------------------------------
    // addNewBook()
    // ---------------------------------------------------------------
    @Test
    void addNewBook_savesCorrectBook() {
        bookService.addNewBook("Author", "Title", "2024", new byte[]{1}, new byte[]{2}, 5L, 100L);

        ArgumentCaptor<Book> captor = ArgumentCaptor.forClass(Book.class);
        verify(bookRepository).save(captor.capture());

        Book saved = captor.getValue();
        assertEquals("Author", saved.getAuthor());
        assertEquals("Title", saved.getTitle());
        assertEquals("2024", saved.getReleaseDate());
        assertEquals(5L, saved.getUserId());
        assertEquals(100L, saved.getPrice());
    }

    // ---------------------------------------------------------------
    // myPrivateBooks()
    // ---------------------------------------------------------------
    @Test
    void myPrivateBooks_returnsList() {
        when(bookRepository.findByUserIdAndIsPrivateTrue(5L))
                .thenReturn(List.of(new Book()));

        List<Book> result = bookService.myPrivateBooks(5L);
        assertEquals(1, result.size());
    }

    // ---------------------------------------------------------------
    // myPublicBooks()
    // ---------------------------------------------------------------
    @Test
    void myPublicBooks_returnsPublicList() {
        when(bookRepository.findByUserIdAndIsPrivateFalse(5L))
                .thenReturn(List.of(new Book()));

        List<Book> result = bookService.myPublicBooks(5L);
        assertEquals(1, result.size());
    }

    // ---------------------------------------------------------------
    // changeMyPrivateBookToPublicBook()
    // ---------------------------------------------------------------
    @Test
    void changePrivateToPublic_success() {
        Book book = new Book();
        book.setPrivate(true);

        when(bookRepository.findById(10L)).thenReturn(Optional.of(book));

        bookService.changeMyPrivateBookToPublicBook(10L);

        assertFalse(book.isPrivate());
        verify(bookRepository).save(book);
    }

    @Test
    void changePrivateToPublic_notFoundThrows() {
        when(bookRepository.findById(10L)).thenReturn(Optional.empty());

        assertThrows(BookNotFoundException.class,
                () -> bookService.changeMyPrivateBookToPublicBook(10L));
    }

    // ---------------------------------------------------------------
    // changeMyPublicBookToPrivateBook()
    // ---------------------------------------------------------------
    @Test
    void changePublicToPrivate_success() {
        Book book = new Book();
        book.setPrivate(false);

        when(bookRepository.findById(10L)).thenReturn(Optional.of(book));

        bookService.changeMyPublicBookToPrivateBook(10L);

        assertTrue(book.isPrivate());
        verify(bookRepository).save(book);
    }

    // ---------------------------------------------------------------
    // buyBook()
    // ---------------------------------------------------------------
    @Test
    void buyBook_success() {
        Book book = new Book();
        book.setUserId(2L);

        AppUser buyer = new AppUser();
        buyer.setMoney(200.0);

        AppUser seller = new AppUser();
        seller.setMoney(50.0);

        when(bookRepository.findById(99L)).thenReturn(Optional.of(book));
        when(appUserRepository.findById(1L)).thenReturn(Optional.of(buyer));
        when(appUserRepository.findById(2L)).thenReturn(Optional.of(seller));

        bookService.buyBook(1L, 99L, 100L);

        assertEquals(100.0, buyer.getMoney());
        assertEquals(150.0, seller.getMoney());
        assertEquals(1L, book.getUserId());

        verify(appUserRepository, times(2)).save(any());
        verify(bookRepository).save(book);
    }

    @Test
    void buyBook_notEnoughMoney_throws() {
        Book book = new Book();
        book.setUserId(2L);

        AppUser buyer = new AppUser();
        buyer.setMoney(10.0);

        when(bookRepository.findById(99L)).thenReturn(Optional.of(book));
        when(appUserRepository.findById(1L)).thenReturn(Optional.of(buyer));

        assertThrows(ResponseStatusException.class,
                () -> bookService.buyBook(1L, 99L, 100L));
    }

    @Test
    void buyBook_buyerNotFound_throws() {
        Book book = new Book();
        when(bookRepository.findById(5L)).thenReturn(Optional.of(book));
        when(appUserRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(UsernameNotFoundException.class,
                () -> bookService.buyBook(1L, 5L, 50L));
    }

    @Test
    void buyBook_bookNotFound_throws() {
        when(bookRepository.findById(5L)).thenReturn(Optional.empty());
        assertThrows(BookNotFoundException.class,
                () -> bookService.buyBook(1L, 5L, 50L));
    }

    // ---------------------------------------------------------------
    // getMoney()
    // ---------------------------------------------------------------
    @Test
    void getMoney_success() {
        AppUser user = new AppUser();
        user.setMoney(500.0);

        when(appUserRepository.findById(1L)).thenReturn(Optional.of(user));

        double result = bookService.getMoney(1L);
        assertEquals(500.0, result);
    }

    @Test
    void getMoney_userNotFound_throws() {
        when(appUserRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(UsernameNotFoundException.class,
                () -> bookService.getMoney(1L));
    }
}
