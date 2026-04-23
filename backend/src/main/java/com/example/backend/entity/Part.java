package com.example.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity @Table(name = "parts")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Part {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(name = "part_number", unique = true, nullable = false, length = 50) private String partNumber;
    @Column(nullable = false, length = 200) private String name;
    @Column(length = 500) private String description;
    @Column(length = 100) private String brand;
    @Column(length = 100) private String category;
    @Column(name = "unit_cost", nullable = false, precision = 10, scale = 2) private BigDecimal unitCost;
    @Column(name = "selling_price", nullable = false, precision = 10, scale = 2) private BigDecimal sellingPrice;
    @Column(name = "stock_quantity", nullable = false) @Builder.Default private Integer stockQuantity = 0;
    @Column(name = "minimum_stock") @Builder.Default private Integer minimumStock = 5;
    @Column(length = 50) private String unit;
    @Column(length = 100) private String supplier;
    @Column(nullable = false) @Builder.Default private boolean active = true;

    // Image stored as binary in DB
    @Lob
    @Column(name = "image_data", columnDefinition = "LONGBLOB")
    private byte[] imageData;

    @Column(name = "image_type", length = 50)
    private String imageType; // e.g. "image/jpeg"

    @Column(name = "created_at") private LocalDateTime createdAt;
    @Column(name = "updated_at") private LocalDateTime updatedAt;
    @PrePersist protected void onCreate() { createdAt = updatedAt = LocalDateTime.now(); }
    @PreUpdate  protected void onUpdate() { updatedAt = LocalDateTime.now(); }
}