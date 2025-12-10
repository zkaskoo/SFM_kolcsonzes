package com.example.demo.buybook;

import com.example.demo.appuser.AppUser;
import com.example.demo.appuser.AppUserRepository;
import com.example.demo.books.Book;
import com.example.demo.books.BookNotFoundException;
import com.example.demo.books.BookRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BuyAndChangeService {

    private final AppUserRepository appUserRepository;
    private final BookRepository bookRepository;
    private final BuyAndChangeRepository buyAndChangeRepository;


    // =========================================
    //           VÁSÁRLÁS LÉTREHOZÁSA
    // =========================================
    public void buyBook(Long userId, Long bookId, Long price) {

        AppUser buyer = appUserRepository.findById(userId)
                .orElseThrow(() -> new UsernameNotFoundException("A felhasználó nem található"));

        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new BookNotFoundException("A könyv nem található"));

        Long sellerId = book.getUserId();

        AppUser seller = appUserRepository.findById(sellerId)
                .orElseThrow(() -> new UsernameNotFoundException("Az eladó nem található"));

        boolean existsActiveOffer = buyAndChangeRepository.existsByBookIdAndStatusIn(
                bookId,
                List.of("pending", "pending_shipment", "shipped")
        );

        if (existsActiveOffer) {
            throw new IllegalStateException("A könyv éppen tranzakció alatt áll.");
        }

        // Ajánlat létrehozása
        BuyAndChange offer = new BuyAndChange();
        offer.setCustomerUserId(userId);
        offer.setSellerUserId(sellerId);
        offer.setCustomerUsername(buyer.getUsername());
        offer.setSellerUsername(seller.getUsername());
        offer.setPrice(price);
        offer.setPay(true);
        offer.setCustomerAccept(true);
        offer.setSellerAccept(true);
        offer.setBookId(bookId);
        offer.setStatus("pending_shipment");

        buyAndChangeRepository.save(offer);
    }


    // =========================================
    //          TRanzakció befejezhető?
    // =========================================
    public void checkIfTradeCanFinalize(BuyAndChange offer) {

        // 1) Fizetéses ügylet — csak a BUYER visszaigazolása kell
        if (offer.isPay()) {
            if (offer.isBuyerConfirmed()) {
                finalizeTrade(offer);
            }
            return;
        }

        // 2) Csere ügylet — mindennek meg kell lennie
        if (offer.isSellerShipped()
                && offer.isBuyerShipped()
                && offer.isSellerConfirmed()
                && offer.isBuyerConfirmed()) {

            finalizeTrade(offer);
        }
    }


    // =========================================
    //               VÉGLEGESÍTÉS
    // =========================================
    public void finalizeTrade(BuyAndChange offer) {

        AppUser buyer = appUserRepository.findById(offer.getCustomerUserId())
                .orElseThrow(() -> new RuntimeException("Vevő nem található"));

        AppUser seller = appUserRepository.findById(offer.getSellerUserId())
                .orElseThrow(() -> new RuntimeException("Eladó nem található"));

        Book book = bookRepository.findById(offer.getBookId())
                .orElseThrow(() -> new RuntimeException("Könyv nem található"));

        // ----------------------------
        //    1) FIZETÉSES ÜGYLET
        // ----------------------------
        if (offer.isPay()) {

            Long price = offer.getPrice();

            if (buyer.getMoney() < price) {
                throw new RuntimeException("A vevőnek nincs elég pénze.");
            }

            // Pénz átvezetés
            buyer.setMoney(buyer.getMoney() - price);
            seller.setMoney(seller.getMoney() + price);

            // Könyv átírása a vevőre
            book.setUserId(buyer.getId());

            appUserRepository.save(buyer);
            appUserRepository.save(seller);
            bookRepository.save(book);

            offer.setStatus("completed");
            buyAndChangeRepository.save(offer);
            return;
        }

        // ----------------------------
        //     2) CSERE ÜGYLET
        // ----------------------------
        Long tradeBookId = offer.getCustomerTradeBookId();

        if (tradeBookId == null) {
            throw new RuntimeException("Nincs kiválasztott csere könyv.");
        }

        Book customerBook = bookRepository.findById(tradeBookId)
                .orElseThrow(() -> new RuntimeException("A cserére felajánlott könyv nem található."));

        Long buyerId = buyer.getId();
        Long sellerId = seller.getId();

        // Tulajdonoscserék
        book.setUserId(buyerId);
        customerBook.setUserId(sellerId);

        bookRepository.save(book);
        bookRepository.save(customerBook);

        offer.setStatus("completed");
        buyAndChangeRepository.save(offer);
    }
}
