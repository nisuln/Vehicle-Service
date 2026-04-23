package com.example.backend.dto;


import lombok.*;
import java.time.LocalDate;
import java.time.LocalTime;

@Data @NoArgsConstructor @AllArgsConstructor
public class BookingRequestDTO {
    private Long vehicleId;
    private LocalDate bookingDate;
    private LocalTime bookingTime;
    private String serviceType;
    private String mechanicName;
    private String notes;
}
