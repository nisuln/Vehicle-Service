package com.example.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity @Table(name = "service_parts")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class ServicePart {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "service_order_id", nullable = false)
    @ToString.Exclude @EqualsAndHashCode.Exclude private ServiceOrder serviceOrder;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "part_id", nullable = false)
    @ToString.Exclude @EqualsAndHashCode.Exclude private Part part;
    @Column(nullable = false) private Integer quantity;
    @Column(name = "unit_price", nullable = false, precision = 10, scale = 2) private BigDecimal unitPrice;
    @Column(name = "total_price", nullable = false, precision = 10, scale = 2) private BigDecimal totalPrice;
    @Column(length = 300) private String notes;
}