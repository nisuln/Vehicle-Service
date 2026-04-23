package com.example.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Entity @Table(name = "service_orders")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class ServiceOrder {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(name = "order_number", unique = true, nullable = false, length = 20) private String orderNumber;

    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "vehicle_id", nullable = false)
    @ToString.Exclude @EqualsAndHashCode.Exclude private Vehicle vehicle;

    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "assigned_mechanic_id")
    @ToString.Exclude @EqualsAndHashCode.Exclude private User assignedMechanic;

    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "created_by_id")
    @ToString.Exclude @EqualsAndHashCode.Exclude private User createdBy;

    @Enumerated(EnumType.STRING) @Column(nullable = false) @Builder.Default private Status status = Status.PENDING;
    @Enumerated(EnumType.STRING) @Column(nullable = false) private Priority priority;

    @Column(name = "service_type", length = 100) private String serviceType;
    @Column(name = "customer_complaint", columnDefinition = "TEXT") private String customerComplaint;
    @Column(name = "technician_notes", columnDefinition = "TEXT") private String technicianNotes;
    @Column(name = "date_in", nullable = false) private LocalDate dateIn;
    @Column(name = "estimated_date_out") private LocalDate estimatedDateOut;
    @Column(name = "date_out") private LocalDate dateOut;
    @Column(name = "mileage_in") private Integer mileageIn;
    @Column(name = "mileage_out") private Integer mileageOut;
    @Column(name = "labor_cost", precision = 10, scale = 2) @Builder.Default private BigDecimal laborCost = BigDecimal.ZERO;
    @Column(name = "parts_cost", precision = 10, scale = 2) @Builder.Default private BigDecimal partsCost = BigDecimal.ZERO;
    @Column(name = "total_cost", precision = 10, scale = 2) @Builder.Default private BigDecimal totalCost = BigDecimal.ZERO;
    @Column(precision = 10, scale = 2) @Builder.Default private BigDecimal discount = BigDecimal.ZERO;
    @Column(name = "tax_rate", precision = 5, scale = 2) @Builder.Default private BigDecimal taxRate = BigDecimal.ZERO;
    @Column(name = "created_at") private LocalDateTime createdAt;
    @Column(name = "updated_at") private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "serviceOrder", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @ToString.Exclude @EqualsAndHashCode.Exclude private List<ServiceItem> serviceItems;

    @OneToMany(mappedBy = "serviceOrder", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @ToString.Exclude @EqualsAndHashCode.Exclude private List<ServicePart> serviceParts;

    @OneToOne(mappedBy = "serviceOrder", cascade = CascadeType.ALL)
    @ToString.Exclude @EqualsAndHashCode.Exclude private Invoice invoice;

    @PrePersist protected void onCreate() { createdAt = updatedAt = LocalDateTime.now(); }
    @PreUpdate  protected void onUpdate() { updatedAt = LocalDateTime.now(); }

    public enum Status { PENDING, DIAGNOSED, IN_PROGRESS, WAITING_PARTS, COMPLETED, DELIVERED, CANCELLED }
    public enum Priority { LOW, MEDIUM, HIGH, URGENT }
}