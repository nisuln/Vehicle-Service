package com.example.backend.dto;


import com.example.backend.entity.Booking.BookingStatus;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalTime;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class BookingDTO {
    private Long id;
    private Long vehicleId;
    private String customerName;
    private String vehicleInfo;
    private LocalDate bookingDate;
    private LocalTime bookingTime;
    private String serviceType;
    private String mechanicName;
    private BookingStatus status;
    private String notes;
    private String ownerUsername;

}