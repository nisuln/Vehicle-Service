package com.example.backend.controller;

import com.example.backend.dto.BookingDTO;
import com.example.backend.dto.BookingRequestDTO;
import com.example.backend.dto.LoyaltyDTO;
import com.example.backend.repository.ServiceOrderRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.LinkedHashMap;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;
    private final ServiceOrderRepository serviceOrderRepository;
    private final UserRepository userRepository;

    // ADMIN → all bookings, USER → only their own
    @GetMapping
    public ResponseEntity<List<BookingDTO>> getAll(Authentication auth) {
        boolean isAdmin = auth.getAuthorities().contains(new SimpleGrantedAuthority("ADMIN"));
        if (isAdmin) return ResponseEntity.ok(bookingService.getAll());
        return ResponseEntity.ok(bookingService.getByUsername(auth.getName()));
    }

    @GetMapping("/my")
    public ResponseEntity<List<BookingDTO>> getMy(Authentication auth) {
        return ResponseEntity.ok(bookingService.getByUsername(auth.getName()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<BookingDTO> getById(@PathVariable Long id, Authentication auth) {
        BookingDTO b = bookingService.getById(id);
        boolean isAdmin = auth.getAuthorities().contains(new SimpleGrantedAuthority("ADMIN"));
        if (!isAdmin && !b.getOwnerUsername().equals(auth.getName())) {
            return ResponseEntity.status(403).build();
        }
        return ResponseEntity.ok(b);
    }

    @GetMapping("/upcoming")
    public ResponseEntity<List<BookingDTO>> getUpcoming(Authentication auth) {
        boolean isAdmin = auth.getAuthorities().contains(new SimpleGrantedAuthority("ADMIN"));
        if (isAdmin) return ResponseEntity.ok(bookingService.getUpcoming());
        return ResponseEntity.ok(bookingService.getUpcomingForUser(auth.getName()));
    }

    @GetMapping("/date/{date}")
    public ResponseEntity<List<BookingDTO>> getByDate(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            Authentication auth) {
        boolean isAdmin = auth.getAuthorities().contains(new SimpleGrantedAuthority("ADMIN"));
        if (isAdmin) return ResponseEntity.ok(bookingService.getByDate(date));
        return ResponseEntity.ok(bookingService.getByDateForUser(date, auth.getName()));
    }

    /**
     * Returns all booked time slots for a given date — no personal info exposed.
     */
    @GetMapping("/slots/{date}")
    public ResponseEntity<List<Map<String, String>>> getSlots(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        List<Map<String, String>> slots = bookingService.getByDate(date).stream()
                .filter(b -> b.getStatus() != null &&
                        !b.getStatus().toString().equalsIgnoreCase("CANCELLED"))
                .map(b -> {
                    Map<String, String> m = new LinkedHashMap<>();
                    m.put("time", b.getBookingTime() != null ? b.getBookingTime().toString().substring(0, 5) : "");
                    m.put("status", "BOOKED");
                    return m;
                })
                .collect(Collectors.toList());
        return ResponseEntity.ok(slots);
    }

    /**
     * Loyalty status for the currently authenticated user.
     * Returns progress toward the free 6th service reward.
     */
    @GetMapping("/loyalty-status")
    public ResponseEntity<LoyaltyDTO> getLoyaltyStatus(Authentication auth) {
        String username = auth.getName();
        String email = userRepository.findByUsername(username)
                .map(u -> u.getEmail())
                .orElse(null);
        if (email == null) return ResponseEntity.ok(LoyaltyDTO.calculate(0));

        long completed = serviceOrderRepository.countCompletedByCustomerEmail(email);
        return ResponseEntity.ok(LoyaltyDTO.calculate((int) completed));
    }

    @PostMapping
    public ResponseEntity<BookingDTO> create(@RequestBody BookingRequestDTO req, Authentication auth) {
        return ResponseEntity.ok(bookingService.create(req, auth.getName()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<BookingDTO> update(@PathVariable Long id,
                                             @RequestBody BookingRequestDTO req,
                                             Authentication auth) {
        BookingDTO b = bookingService.getById(id);
        boolean isAdmin = auth.getAuthorities().contains(new SimpleGrantedAuthority("ADMIN"));
        if (!isAdmin && !b.getOwnerUsername().equals(auth.getName())) {
            return ResponseEntity.status(403).build();
        }
        return ResponseEntity.ok(bookingService.update(id, req));
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<BookingDTO> cancel(@PathVariable Long id, Authentication auth) {
        BookingDTO b = bookingService.getById(id);
        boolean isAdmin = auth.getAuthorities().contains(new SimpleGrantedAuthority("ADMIN"));
        if (!isAdmin && !b.getOwnerUsername().equals(auth.getName())) {
            return ResponseEntity.status(403).build();
        }
        return ResponseEntity.ok(bookingService.cancel(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id, Authentication auth) {
        boolean isAdmin = auth.getAuthorities().contains(new SimpleGrantedAuthority("ADMIN"));
        if (!isAdmin) return ResponseEntity.status(403).build();
        bookingService.delete(id);
        return ResponseEntity.noContent().build();
    }
}