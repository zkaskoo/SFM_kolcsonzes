package com.example.demo.books;

public class ChangeBookRequest {
    private Long bookId;

    public Long getBookId() {
        return bookId;
    }

    public void setBookId(Long bookId) {
        this.bookId = bookId;
    }
    // Szükséges lehet egy default konstruktor is: public BookIdRequest() {}
}
