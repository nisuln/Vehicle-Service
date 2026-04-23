package com.example.backend.repository;


import com.example.backend.entity.Booking;
import com.example.backend.entity.Booking.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByVehicleId(Long vehicleId);
    List<Booking> findByStatus(BookingStatus status);
    List<Booking> findByBookingDate(LocalDate date);
    List<Booking> findByBookingDateBetween(LocalDate start, LocalDate end);
    boolean existsByVehicle_IdAndBookingDateAndBookingTimeAndStatusNot(
            Long vehicleId, LocalDate date, java.time.LocalTime time, BookingStatus status);

    // ADD to BookingRepository interface
    boolean existsByBookingDateAndBookingTimeAndStatusNot(
            LocalDate date, LocalTime time, BookingStatus status);
}
