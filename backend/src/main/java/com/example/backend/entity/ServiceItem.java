package com.example.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity @Table(name = "service_items")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class ServiceItem {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "service_order_id", nullable = false)
    @ToString.Exclude @EqualsAndHashCode.Exclude private ServiceOrder serviceOrder;
    @Column(nullable = false, length = 200) private String description;
    @Column(name = "labor_hours", precision = 5, scale = 2) private BigDecimal laborHours;
    @Column(name = "hourly_rate", precision = 10, scale = 2) private BigDecimal hourlyRate;
    @Column(name = "total_price", precision = 10, scale = 2) private BigDecimal totalPrice;
    @Column(length = 500) private String notes;
    @Enumerated(EnumType.STRING) @Builder.Default private ItemStatus status = ItemStatus.PENDING;
    public enum ItemStatus { PENDING, IN_PROGRESS, COMPLETED }
}