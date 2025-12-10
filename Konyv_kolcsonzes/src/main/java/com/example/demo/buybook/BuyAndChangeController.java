package com.example.demo.buybook;

import com.example.demo.appuser.AppUser;
import com.example.demo.appuser.AppUserRepository;
import com.example.demo.books.BookRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class BuyAndChangeController {

    private final BuyAndChangeService service;
    private final BuyAndChangeRepository repo;
    private final AppUserRepository users;
    private final BookRepository books;


    // ==========================
    // VÁSÁRLÁS
    // ==========================
    @PostMapping("/buy")
    public ResponseEntity<String> buyBook(@RequestBody BuyRequest req) {
        service.buyBook(req.getUserId(), req.getBookId(), req.getPrice());
        return ResponseEntity.ok("Sikeres vásárlás. A tranzakció rögzítve lett.");
    }

    // ==========================
    // CSERE AJÁNLAT LÉTREHOZÁSA
    // ==========================
    @PostMapping("/trade/create")
    public ResponseEntity<?> createTradeOffer(@RequestBody TradeCreateRequest req) {

        Long bookId = req.getBookId();

        boolean blocked = repo.existsByBookIdAndStatusIn(
                bookId,
                List.of("pending", "pending_shipment", "shipped")
        );

        if (blocked) throw new IllegalStateException("Erre a könyvre már folyamatban van tranzakció.");

        Long sellerId = books.findById(bookId)
                .orElseThrow(() -> new RuntimeException("Könyv nem található"))
                .getUserId();

        BuyAndChange offer = new BuyAndChange();
        offer.setCustomerUserId(req.getUserId());
        offer.setSellerUserId(sellerId);
        offer.setBookId(bookId);
        offer.setPay(false);
        offer.setCustomerAccept(false);
        offer.setSellerAccept(false);
        offer.setStatus("pending");

        offer = repo.save(offer);

        return ResponseEntity.ok(new OfferResponse(offer.getId()));
    }


    // ==========================
    // CSERE KÖNYV KIVÁLASZTÁSA
    // ==========================
    @PostMapping("/trade/select")
    public ResponseEntity<String> selectTradeBook(@RequestBody TradeSelectRequest req) {

        BuyAndChange offer = repo.findById(req.getOfferId())
                .orElseThrow(() -> new RuntimeException("Ajánlat nem található"));

        offer.setCustomerTradeBookId(req.getCustomerTradeBookId());
        repo.save(offer);

        return ResponseEntity.ok("Könyv kiválasztva a cseréhez.");
    }


    // ==========================
// BEJÖVŐ AJÁNLATOK (SELLER OLDAL)
// ==========================
    @GetMapping("/trade/incoming")
    public List<TradeOfferDTO> getIncoming(@RequestParam Long userId) {

        List<BuyAndChange> offers = repo.findBySellerUserId(userId);

        return offers.stream().map(o -> {
            TradeOfferDTO dto = new TradeOfferDTO();
            dto.setId(o.getId());
            dto.setFrom(o.getCustomerUsername());
            dto.setBookRequested(o.getBookId().toString());
            dto.setStatus(o.getStatus());
            dto.setBookId(o.getBookId());
            dto.setSellerAccept(o.isSellerAccept());
            dto.setCustomerAccept(o.isCustomerAccept());


            dto.setSellerShipped(o.isSellerShipped());
            dto.setBuyerShipped(o.isBuyerShipped());
            dto.setSellerConfirmed(o.isSellerConfirmed());
            dto.setBuyerConfirmed(o.isBuyerConfirmed());
            dto.setPay(o.isPay());

            return dto;
        }).collect(Collectors.toList());
    }


    // ==========================
// KIMENŐ AJÁNLATOK (BUYER OLDAL)
// ==========================
    @GetMapping("/trade/outgoing")
    public List<TradeOfferDTO> getOutgoing(@RequestParam Long userId) {

        List<BuyAndChange> offers = repo.findByCustomerUserId(userId);

        return offers.stream().map(o -> {
            TradeOfferDTO dto = new TradeOfferDTO();
            dto.setId(o.getId());
            dto.setFrom(o.getSellerUsername());
            dto.setBookRequested(o.getBookId().toString());
            dto.setStatus(o.getStatus());
            dto.setBookId(o.getBookId());
            dto.setSellerAccept(o.isSellerAccept());
            dto.setCustomerAccept(o.isCustomerAccept());


            dto.setSellerShipped(o.isSellerShipped());
            dto.setBuyerShipped(o.isBuyerShipped());
            dto.setSellerConfirmed(o.isSellerConfirmed());
            dto.setBuyerConfirmed(o.isBuyerConfirmed());
            dto.setPay(o.isPay());

            return dto;
        }).collect(Collectors.toList());
    }



    // ==========================
    // ELADÓ FELADTA A CSOMAGOT
    // ==========================
    @PostMapping("/trade/ship/seller/{id}")
    public ResponseEntity<String> sellerShipped(@PathVariable Long id) {

        BuyAndChange offer = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Ajánlat nem található"));

        offer.setSellerShipped(true);
        offer.setStatus("shipped");
        repo.save(offer);

        service.checkIfTradeCanFinalize(offer);

        return ResponseEntity.ok("Eladó feladta.");
    }


    // ==========================
    // VEVŐ FELADTA A CSOMAGOT
    // ==========================
    @PostMapping("/trade/ship/buyer/{id}")
    public ResponseEntity<String> buyerShipped(@PathVariable Long id) {

        BuyAndChange offer = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Ajánlat nem található"));

        offer.setBuyerShipped(true);
        offer.setStatus("shipped");
        repo.save(offer);

        service.checkIfTradeCanFinalize(offer);

        return ResponseEntity.ok("Vevő feladta.");
    }


    // ==========================
    // ELADÓ VISSZAIGAZOLTA
    // ==========================
    @PostMapping("/trade/confirm/seller/{id}")
    public ResponseEntity<String> sellerConfirm(@PathVariable Long id) {

        BuyAndChange offer = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Ajánlat nem található"));

        offer.setSellerConfirmed(true);
        repo.save(offer);

        service.checkIfTradeCanFinalize(offer);

        return ResponseEntity.ok("Eladó visszaigazolta.");
    }


    // ==========================
    // VEVŐ VISSZAIGAZOLTA
    // ==========================
    @PostMapping("/trade/confirm/buyer/{id}")
    public ResponseEntity<String> buyerConfirm(@PathVariable Long id) {

        BuyAndChange offer = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Ajánlat nem található"));

        offer.setBuyerConfirmed(true);
        repo.save(offer);

        service.checkIfTradeCanFinalize(offer);

        return ResponseEntity.ok("Vevő visszaigazolta.");
    }


    // ==========================
    // AJÁNLAT ELUTASÍTÁSA
    // ==========================
    @PostMapping("/trade/decline/{id}")
    public ResponseEntity<String> decline(@PathVariable Long id, @RequestParam Long userId) {

        BuyAndChange offer = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Ajánlat nem található"));

        // 1) Fizetéses vásárlás NEM utasítható el
        if (offer.isPay()) {
            return ResponseEntity.badRequest().body("Fizetéses ajánlatot nem lehet elutasítani.");
        }

        // 2) Csak a SELLER utasíthat el
        if (!offer.getSellerUserId().equals(userId)) {
            return ResponseEntity.badRequest().body("Csak az eladó utasíthatja el az ajánlatot.");
        }

        repo.delete(offer);
        return ResponseEntity.ok("Csereajánlat elutasítva.");
    }

    @PostMapping("/trade/accept/seller/{id}")
    public ResponseEntity<String> sellerAccept(@PathVariable Long id) {

        BuyAndChange offer = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Ajánlat nem található"));

        offer.setSellerAccept(true);
        repo.save(offer);

        return ResponseEntity.ok("Seller elfogadta az ajánlatot.");
    }


}

