package com.example.backend.service;

import com.example.backend.dto.InvoiceDTO;
import com.example.backend.entity.*;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service @RequiredArgsConstructor
public class InvoiceService {
    private final InvoiceRepository invoiceRepo;
    private final ServiceOrderRepository orderRepo;
    private final ModelMapper mapper;

    public List<InvoiceDTO> getAll() {
        return invoiceRepo.findAll().stream().map(this::toDto).collect(Collectors.toList());
    }

    public InvoiceDTO getById(Long id) {
        return toDto(invoiceRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found")));
    }

    public InvoiceDTO getByOrderId(Long orderId) {
        return toDto(invoiceRepo.findByServiceOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found for order: " + orderId)));
    }

    @Transactional
    public InvoiceDTO generateFromOrder(Long orderId) {
        ServiceOrder order = orderRepo.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Service order not found"));
        if (invoiceRepo.findByServiceOrderId(orderId).isPresent()) {
            throw new RuntimeException("Invoice already exists for this order");
        }
        BigDecimal subtotal = order.getLaborCost().add(order.getPartsCost());
        BigDecimal afterDiscount = subtotal.subtract(order.getDiscount());
        BigDecimal taxAmount = afterDiscount.multiply(order.getTaxRate()).divide(BigDecimal.valueOf(100));
        Invoice inv = Invoice.builder()
                .invoiceNumber(generateInvoiceNumber())
                .serviceOrder(order)
                .issueDate(LocalDate.now())
                .dueDate(LocalDate.now().plusDays(30))
                .laborTotal(order.getLaborCost())
                .partsTotal(order.getPartsCost())
                .subtotal(subtotal)
                .discountAmount(order.getDiscount())
                .taxAmount(taxAmount)
                .totalAmount(afterDiscount.add(taxAmount))
                .paidAmount(BigDecimal.ZERO)
                .paymentStatus(Invoice.PaymentStatus.UNPAID)
                .build();
        return toDto(invoiceRepo.save(inv));
    }

    @Transactional
    public InvoiceDTO recordPayment(Long id, BigDecimal amount, Invoice.PaymentMethod method) {
        Invoice inv = invoiceRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found"));
        inv.setPaidAmount(inv.getPaidAmount().add(amount));
        inv.setPaymentMethod(method);
        inv.setPaymentDate(LocalDate.now());
        if (inv.getPaidAmount().compareTo(inv.getTotalAmount()) >= 0)
            inv.setPaymentStatus(Invoice.PaymentStatus.PAID);
        else
            inv.setPaymentStatus(Invoice.PaymentStatus.PARTIALLY_PAID);
        return toDto(invoiceRepo.save(inv));
    }

    private String generateInvoiceNumber() {
        String prefix = "INV-" + LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMM")) + "-";
        long count = invoiceRepo.count() + 1;
        return prefix + String.format("%04d", count);
    }

    private InvoiceDTO toDto(Invoice inv) {
        InvoiceDTO dto = mapper.map(inv, InvoiceDTO.class);
        ServiceOrder o = inv.getServiceOrder();
        dto.setServiceOrderId(o.getId());
        dto.setOrderNumber(o.getOrderNumber());
        dto.setCustomerName(o.getVehicle().getCustomer().getFirstName() + " " + o.getVehicle().getCustomer().getLastName());
        dto.setVehicleInfo(o.getVehicle().getMake() + " " + o.getVehicle().getModel() + " " + o.getVehicle().getYear());
        dto.setBalanceDue(inv.getTotalAmount().subtract(inv.getPaidAmount()));

        // Add parts details
        if (o.getServiceParts() != null && !o.getServiceParts().isEmpty()) {
            List<InvoiceDTO.InvoicePartDTO> parts = o.getServiceParts().stream()
                    .map(sp -> {
                        InvoiceDTO.InvoicePartDTO partDTO = new InvoiceDTO.InvoicePartDTO();
                        partDTO.setPartName(sp.getPart().getName());
                        partDTO.setQuantity(sp.getQuantity());
                        partDTO.setUnitPrice(sp.getUnitPrice());
                        partDTO.setTotalPrice(sp.getTotalPrice());
                        return partDTO;
                    })
                    .collect(Collectors.toList());
            dto.setParts(parts);
        }

        return dto;
    }
}