package com.example.demo.secondauth;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SecondAuthRepository extends JpaRepository<SecondAuth,Long> {
    boolean existsByAuthToken(String token);
    Optional<SecondAuth> findByUserEmail(String email);
    void deleteAllByUserEmail(String email);
}
