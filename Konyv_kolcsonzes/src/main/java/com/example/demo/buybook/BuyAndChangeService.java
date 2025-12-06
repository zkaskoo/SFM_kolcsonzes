/*package com.example.demo.buybook;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BuyAndChangeService {
    private final BuyAndChangeRepository buyAndChangeRepository;

    public List<BuyAndChange> getRequestList(Long id){
        List<BuyAndChange> userDetails = buyAndChangeRepository.findByCustomerUserIdOrSellerUserId(id,id);

    }

}
*/