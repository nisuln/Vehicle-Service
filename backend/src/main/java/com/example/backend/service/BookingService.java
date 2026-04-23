package com.example.backend.service;


import com.example.backend.dto.BookingDTO;
import com.example.backend.dto.BookingRequestDTO;
import com.example.backend.entity.Booking;
import com.example.backend.entity.Booking.BookingStatus;
import com.example.backend.entity.User;
import com.example.backend.entity.Vehicle;
import com.example.backend.entity.Customer;
import com.example.backend.repository.BookingRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final VehicleRepository vehicleRepository;
    private final UserRepository userRepository;

    public List<BookingDTO> getAll() {
        return bookingRepository.findAll().stream()
                .map(this::toDTO).collect(Collectors.toList());
    }

    public BookingDTO getById(Long id) {
        return bookingRepository.findById(id)
                .map(this::toDTO)
                .orElseThrow(() -> new RuntimeException("Booking not found: " + id));
    }

    public List<BookingDTO> getByVehicle(Long vehicleId) {
        return bookingRepository.findByVehicleId(vehicleId).stream()
                .map(this::toDTO).collect(Collectors.toList());
    }

    public List<BookingDTO> getByDate(LocalDate date) {
        return bookingRepository.findByBookingDate(date).stream()
                .map(this::toDTO).collect(Collectors.toList());
    }

    public List<BookingDTO> getByDateRange(LocalDate start, LocalDate end) {
        return bookingRepository.findByBookingDateBetween(start, end).stream()
                .map(this::toDTO).collect(Collectors.toList());
    }

    public List<BookingDTO> getUpcoming() {
        return bookingRepository
                .findByBookingDateBetween(LocalDate.now(), LocalDate.now().plusMonths(3)).stream()
                .map(this::toDTO).collect(Collectors.toList());
    }

    @Transactional
    public BookingDTO create(BookingRequestDTO req) {
        Vehicle vehicle = vehicleRepository.findById(req.getVehicleId())
                .orElseThrow(() -> new RuntimeException("Vehicle not found: " + req.getVehicleId()));

        // ── Conflict check: is this time slot already taken? ──────────────────
        boolean conflict = bookingRepository
                .existsByBookingDateAndBookingTimeAndStatusNot(
                        req.getBookingDate(), req.getBookingTime(), BookingStatus.CANCELLED);
        if (conflict) {
            throw new IllegalStateException(
                    "Time slot " + req.getBookingTime() + " on " + req.getBookingDate() + " is already booked.");
        }

        Booking booking = Booking.builder()
                .vehicle(vehicle)
                .bookingDate(req.getBookingDate())
                .bookingTime(req.getBookingTime())
                .serviceType(req.getServiceType())
                .mechanicName(req.getMechanicName())
                .notes(req.getNotes())
                .status(BookingStatus.CONFIRMED)
                .build();

        return toDTO(bookingRepository.save(booking));
    }

    @Transactional
    public BookingDTO update(Long id, BookingRequestDTO req) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found: " + id));

        if (req.getBookingDate()  != null) booking.setBookingDate(req.getBookingDate());
        if (req.getBookingTime()  != null) booking.setBookingTime(req.getBookingTime());
        if (req.getServiceType()  != null) booking.setServiceType(req.getServiceType());
        if (req.getMechanicName() != null) booking.setMechanicName(req.getMechanicName());
        if (req.getNotes()        != null) booking.setNotes(req.getNotes());

        return toDTO(bookingRepository.save(booking));
    }

    @Transactional
    public BookingDTO cancel(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found: " + id));
        booking.setStatus(BookingStatus.CANCELLED);
        return toDTO(bookingRepository.save(booking));
    }

    @Transactional
    public void delete(Long id) {
        bookingRepository.deleteById(id);
    }

    // ── Mapper ──────────────────────────────────────────────────────────────
    private BookingDTO toDTO(Booking b) {
        Customer c = b.getVehicle().getCustomer();
        String customerName = (c != null)
                ? c.getFirstName() + " " + c.getLastName()
                : "Unknown";
        String vehicleInfo = b.getVehicle().getYear() + " "
                + b.getVehicle().getMake() + " " + b.getVehicle().getModel();

        return BookingDTO.builder()
                .id(b.getId())
                .vehicleId(b.getVehicle().getId())
                .customerName(customerName)
                .vehicleInfo(vehicleInfo)
                .bookingDate(b.getBookingDate())
                .bookingTime(b.getBookingTime())
                .serviceType(b.getServiceType())
                .mechanicName(b.getMechanicName())
                .status(b.getStatus())
                .notes(b.getNotes())
                .build();
    }

    // Add to BookingService.java

    public List<BookingDTO> getByUsername(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return bookingRepository.findAll().stream()
                .filter(b -> b.getVehicle().getCustomer() != null &&
                        b.getVehicle().getCustomer().getEmail().equals(user.getEmail()))
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<BookingDTO> getUpcomingForUser(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return bookingRepository
                .findByBookingDateBetween(LocalDate.now(), LocalDate.now().plusMonths(3))
                .stream()
                .filter(b -> b.getVehicle().getCustomer() != null &&
                        b.getVehicle().getCustomer().getEmail().equals(user.getEmail()))
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<BookingDTO> getByDateForUser(LocalDate date, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return bookingRepository.findByBookingDate(date).stream()
                .filter(b -> b.getVehicle().getCustomer() != null &&
                        b.getVehicle().getCustomer().getEmail().equals(user.getEmail()))
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    // Updated create — validates vehicle ownership
    public BookingDTO create(BookingRequestDTO req, String username) {
        Vehicle vehicle = vehicleRepository.findById(req.getVehicleId())
                .orElseThrow(() -> new RuntimeException("Vehicle not found"));
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Check vehicle belongs to user (unless admin — admin has no restriction)
        boolean isAdmin = user.getRole() == User.Role.ADMIN;
        if (!isAdmin) {
            String vehicleOwnerEmail = vehicle.getCustomer() != null
                    ? vehicle.getCustomer().getEmail() : null;
            if (!user.getEmail().equals(vehicleOwnerEmail)) {
                throw new RuntimeException("You can only book your own vehicles");
            }
        }

        // ── Overlap check: prevent double-booking the same time slot ─────────
        boolean conflict = bookingRepository
                .existsByBookingDateAndBookingTimeAndStatusNot(
                        req.getBookingDate(), req.getBookingTime(), BookingStatus.CANCELLED);
        if (conflict) {
            throw new IllegalStateException(
                    "Time slot " + req.getBookingTime() + " on " + req.getBookingDate() + " is already booked.");
        }

        Booking booking = Booking.builder()
                .vehicle(vehicle)
                .bookingDate(req.getBookingDate())
                .bookingTime(req.getBookingTime())
                .serviceType(req.getServiceType())
                .mechanicName(req.getMechanicName())
                .notes(req.getNotes())
                .status(BookingStatus.CONFIRMED)
                .build();

        return toDTO(bookingRepository.save(booking));
    }
}