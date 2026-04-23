package com.example.backend.repository;

import com.example.backend.entity.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.util.*;

public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
    Optional<Invoice> findByInvoiceNumber(String invoiceNumber);
    Optional<Invoice> findByServiceOrderId(Long serviceOrderId);
    List<Invoice> findByPaymentStatus(Invoice.PaymentStatus status);
    @Query("SELECT SUM(i.totalAmount) FROM Invoice i WHERE i.issueDate BETWEEN :from AND :to")
    Double sumTotalBetween(@Param("from") LocalDate from, @Param("to") LocalDate to);
}
