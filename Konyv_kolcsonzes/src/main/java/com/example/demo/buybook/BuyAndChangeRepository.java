package com.example.demo.buybook;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BuyAndChangeRepository extends JpaRepository<BuyAndChange,Long> {
    List<BuyAndChange> findByCustomerUserIdOrSellerUserId(Long customerUserId, Long sellerUserId);

}
