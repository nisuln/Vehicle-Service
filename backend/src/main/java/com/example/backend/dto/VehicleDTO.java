package com.example.backend.dto;

import lombok.*;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class VehicleDTO {
    private Long    id;
    private Long    customerId;
    private String  customerName;
    private String  ownerUsername;      // used for ownership checks
    private String  vehicleInfo;        // computed: "2021 Toyota Camry"

    private String  make;
    private String  model;
    private Integer year;
    private String  color;
    private String  licensePlate;
    private String  vin;
    private Integer mileage;
    private String  fuelType;           // PETROL, DIESEL, ELECTRIC, HYBRID
    private String  transmissionType;   // AUTOMATIC, MANUAL, CVT
}