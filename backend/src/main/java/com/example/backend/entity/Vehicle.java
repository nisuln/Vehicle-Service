package com.example.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity @Table(name = "vehicles")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Vehicle {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "customer_id", nullable = false)
    @ToString.Exclude @EqualsAndHashCode.Exclude private Customer customer;
    @Column(nullable = false, length = 50) private String make;
    @Column(nullable = false, length = 50) private String model;
    @Column(nullable = false) private Integer year;
    @Column(unique = true, length = 20) private String vin;
    @Column(name = "license_plate", length = 20) private String licensePlate;
    @Column(length = 30) private String color;
    @Enumerated(EnumType.STRING) @Column(name = "fuel_type") private FuelType fuelType;
    @Enumerated(EnumType.STRING) private TransmissionType transmission;
    private Integer mileage;
    @Column(columnDefinition = "TEXT") private String notes;
    @Column(name = "created_at") private LocalDateTime createdAt;
    @Column(name = "updated_at") private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "vehicle", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @ToString.Exclude @EqualsAndHashCode.Exclude private List<ServiceOrder> serviceOrders;

    @PrePersist protected void onCreate() { createdAt = updatedAt = LocalDateTime.now(); }
    @PreUpdate  protected void onUpdate() { updatedAt = LocalDateTime.now(); }

    public enum FuelType { PETROL, DIESEL, ELECTRIC, HYBRID, LPG }
    public enum TransmissionType { MANUAL, AUTOMATIC, CVT, SEMI_AUTOMATIC }
}