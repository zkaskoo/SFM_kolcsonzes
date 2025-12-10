package com.example.demo.books;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Base64;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc(addFilters = false)
class BookControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private BookService bookService;

    @MockBean
    private BookRepository bookRepository;

    private final ObjectMapper mapper = new ObjectMapper();

    @Test
    void addNewBook_success() throws Exception {
        BookRequest req = new BookRequest();
        req.setAuthor("Author");
        req.setTitle("Title");
        req.setReleaseDate("2025-01-01");
        req.setPdfBase64(Base64.getEncoder().encodeToString("pdf".getBytes()));
        req.setPictureBase64(Base64.getEncoder().encodeToString("pic".getBytes()));
        req.setUserId(1L);
        req.setPrice(100L);

        mockMvc.perform(
                        post("/api/v1/books/add")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(mapper.writeValueAsString(req))
                )
                .andExpect(status().isOk())
                .andExpect(content().string("Book successfully added."));
    }

    @Test
    void getBookCover_success() throws Exception {
        Book b = new Book();
        b.setPicture(new byte[]{1, 2, 3});

        when(bookRepository.findById(1L)).thenReturn(Optional.of(b));

        mockMvc.perform(get("/api/v1/books/cover/1"))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Type", "image/jpeg"));
    }

    @Test
    void getBookCover_notFound() throws Exception {
        when(bookRepository.findById(1L)).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/v1/books/cover/1"))
                .andExpect(status().isNotFound());
    }

    @Test
    void privateBooks_success() throws Exception {
        when(bookService.myPrivateBooks(5L)).thenReturn(List.of(new Book()));

        mockMvc.perform(
                        post("/api/v1/books/privatebooks")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("{\"userId\":5}")
                )
                .andExpect(status().isOk());
    }

    @Test
    void privateBooks_empty() throws Exception {
        when(bookService.myPrivateBooks(5L)).thenReturn(List.of());

        mockMvc.perform(
                        post("/api/v1/books/privatebooks")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("{\"userId\":5}")
                )
                .andExpect(status().isNoContent());
    }

    @Test
    void changePrivate_success() throws Exception {
        doNothing().when(bookService).changeMyPublicBookToPrivateBook(10L);

        mockMvc.perform(
                        post("/api/v1/books/changeprivate")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("{\"bookId\":10}")
                )
                .andExpect(status().isNoContent());
    }

    @Test
    void changePrivate_notFound() throws Exception {
        doThrow(new BookNotFoundException("Book not found"))
                .when(bookService).changeMyPublicBookToPrivateBook(99L);

        mockMvc.perform(
                        post("/api/v1/books/changeprivate")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("{\"bookId\":99}")
                )
                .andExpect(status().isNotFound());
    }

    @Test
    void changePublic_success() throws Exception {
        doNothing().when(bookService).changeMyPrivateBookToPublicBook(10L);

        mockMvc.perform(
                        post("/api/v1/books/changepublic")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("{\"bookId\":10}")
                )
                .andExpect(status().isNoContent());
    }

    @Test
    void changePublic_notFound() throws Exception {
        doThrow(new BookNotFoundException("Book not found"))
                .when(bookService).changeMyPrivateBookToPublicBook(99L);

        mockMvc.perform(
                        post("/api/v1/books/changepublic")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("{\"bookId\":99}")
                )
                .andExpect(status().isNotFound());
    }

    @Test
    void getAllBooks_success() throws Exception {
        when(bookService.getMyAllBooks(3L)).thenReturn(List.of(new Book()));

        mockMvc.perform(
                        post("/api/v1/books/allbooks")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("{\"userId\":3}")
                )
                .andExpect(status().isOk());
    }

    @Test
    void getAllBooks_empty() throws Exception {
        when(bookService.getMyAllBooks(3L)).thenReturn(List.of());

        mockMvc.perform(
                        post("/api/v1/books/allbooks")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("{\"userId\":3}")
                )
                .andExpect(status().isNoContent());
    }

    @Test
    void getOthersBooks_success() throws Exception {
        when(bookService.getAllBooksWithoutOwnBooks(9L)).thenReturn(List.of(new Book()));

        mockMvc.perform(
                        post("/api/v1/books/others")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("{\"id\":9}")
                )
                .andExpect(status().isOk());
    }

    @Test
    void buyBook_success() throws Exception {
        doNothing().when(bookService).buyBook(1L, 2L, 100L);

        mockMvc.perform(
                        post("/api/v1/books/buy")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("{\"id\":1,\"bookId\":2,\"price\":100}")
                )
                .andExpect(status().isOk())
                .andExpect(content().string("Sikeres vásárlás!"));
    }

    @Test
    void getBalance_success() throws Exception {
        when(bookService.getMoney(10L)).thenReturn(500.0);

        mockMvc.perform(
                        post("/api/v1/books/balance")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("{\"id\":10}")
                )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.money").value(500.0))
                .andExpect(jsonPath("$.userId").value(10));
    }
}
