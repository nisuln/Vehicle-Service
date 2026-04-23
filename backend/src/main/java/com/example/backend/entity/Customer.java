package com.example.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity @Table(name = "customers")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Customer {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(name = "first_name", nullable = false, length = 50) private String firstName;
    @Column(name = "last_name", nullable = false, length = 50) private String lastName;
    @Column(unique = true, length = 100) private String email;
    @Column(nullable = false, length = 15) private String phone;
    @Column(name = "alt_phone", length = 15) private String altPhone;
    @Column(length = 255) private String address;
    @Column(length = 100) private String city;
    @Column(name = "zip_code", length = 10) private String zipCode;
    @Column(columnDefinition = "TEXT") private String notes;
    @Column(name = "created_at") private LocalDateTime createdAt;
    @Column(name = "updated_at") private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "customer", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @ToString.Exclude @EqualsAndHashCode.Exclude private List<Vehicle> vehicles;

    @PrePersist protected void onCreate() { createdAt = updatedAt = LocalDateTime.now(); }
    @PreUpdate  protected void onUpdate() { updatedAt = LocalDateTime.now(); }
}