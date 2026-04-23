package com.example.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity @Table(name = "invoices")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Invoice {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(name = "invoice_number", unique = true, nullable = false, length = 20) private String invoiceNumber;
    @OneToOne(fetch = FetchType.LAZY) @JoinColumn(name = "service_order_id", nullable = false)
    @ToString.Exclude @EqualsAndHashCode.Exclude private ServiceOrder serviceOrder;
    @Column(name = "issue_date", nullable = false) private LocalDate issueDate;
    @Column(name = "due_date") private LocalDate dueDate;
    @Column(name = "labor_total", precision = 10, scale = 2) @Builder.Default private BigDecimal laborTotal = BigDecimal.ZERO;
    @Column(name = "parts_total", precision = 10, scale = 2) @Builder.Default private BigDecimal partsTotal = BigDecimal.ZERO;
    @Column(precision = 10, scale = 2) @Builder.Default private BigDecimal subtotal = BigDecimal.ZERO;
    @Column(name = "discount_amount", precision = 10, scale = 2) @Builder.Default private BigDecimal discountAmount = BigDecimal.ZERO;
    @Column(name = "tax_amount", precision = 10, scale = 2) @Builder.Default private BigDecimal taxAmount = BigDecimal.ZERO;
    @Column(name = "total_amount", precision = 10, scale = 2) @Builder.Default private BigDecimal totalAmount = BigDecimal.ZERO;
    @Column(name = "paid_amount", precision = 10, scale = 2) @Builder.Default private BigDecimal paidAmount = BigDecimal.ZERO;
    @Enumerated(EnumType.STRING) @Column(name = "payment_status", nullable = false) @Builder.Default private PaymentStatus paymentStatus = PaymentStatus.UNPAID;
    @Enumerated(EnumType.STRING) @Column(name = "payment_method") private PaymentMethod paymentMethod;
    @Column(name = "payment_date") private LocalDate paymentDate;
    @Column(length = 500) private String notes;
    @Column(name = "created_at") private LocalDateTime createdAt;
    @Column(name = "updated_at") private LocalDateTime updatedAt;
    @PrePersist protected void onCreate() { createdAt = updatedAt = LocalDateTime.now(); }
    @PreUpdate  protected void onUpdate() { updatedAt = LocalDateTime.now(); }
    public enum PaymentStatus { UNPAID, PARTIALLY_PAID, PAID }
    public enum PaymentMethod { CASH, CREDIT_CARD, DEBIT_CARD, BANK_TRANSFER, CHECK, ONLINE }
}