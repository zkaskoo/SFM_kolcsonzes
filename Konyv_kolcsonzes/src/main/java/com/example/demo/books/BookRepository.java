package com.example.demo.books;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BookRepository extends JpaRepository<Book,Long> {
    List<Book> findByUserIdAndIsPrivateTrue(Long userId);
    List<Book> findByUserIdAndIsPrivateFalse(Long userId);
    Optional<Book> findById(Long id);
    List<Book> findByUserId(Long userId);

}
