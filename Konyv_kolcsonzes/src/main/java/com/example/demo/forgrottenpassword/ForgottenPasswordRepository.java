package com.example.demo.forgrottenpassword;

import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ForgottenPasswordRepository extends JpaRepository<ForgottenPassword,Long> {
    Optional<ForgottenPassword> findByResetToken(String resetToken);
    @Transactional
    void deleteByEmail(String email);


}
