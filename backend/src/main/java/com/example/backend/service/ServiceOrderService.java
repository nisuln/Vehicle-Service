package com.example.backend.service;

import com.example.backend.dto.*;
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
public class ServiceOrderService {
    private final ServiceOrderRepository orderRepo;
    private final VehicleRepository vehicleRepo;
    private final UserRepository userRepo;
    private final ServiceItemRepository itemRepo;
    private final ServicePartRepository spRepo;
    private final PartRepository partRepo;
    private final ModelMapper mapper;

    public List<ServiceOrderDTO> getAll() {
        return orderRepo.findAll().stream().map(this::toDto).collect(Collectors.toList());
    }

    public ServiceOrderDTO getById(Long id) { return toDto(findOrThrow(id)); }

    @Transactional
    public ServiceOrderDTO create(ServiceOrderDTO dto) {
        Vehicle vehicle = vehicleRepo.findById(dto.getVehicleId())
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found"));
        ServiceOrder order = ServiceOrder.builder()
                .orderNumber(generateOrderNumber())
                .vehicle(vehicle)
                .status(ServiceOrder.Status.PENDING)
                .priority(dto.getPriority())
                .serviceType(dto.getServiceType())
                .customerComplaint(dto.getCustomerComplaint())
                .dateIn(dto.getDateIn() != null ? dto.getDateIn() : LocalDate.now())
                .estimatedDateOut(dto.getEstimatedDateOut())
                .mileageIn(dto.getMileageIn())
                .discount(dto.getDiscount() != null ? dto.getDiscount() : BigDecimal.ZERO)
                .taxRate(dto.getTaxRate() != null ? dto.getTaxRate() : BigDecimal.ZERO)
                .build();
        if (dto.getAssignedMechanicId() != null) {
            userRepo.findById(dto.getAssignedMechanicId()).ifPresent(order::setAssignedMechanic);
        }
        orderRepo.save(order);
        if (dto.getServiceItems() != null) saveItems(order, dto.getServiceItems());
        if (dto.getServiceParts() != null) saveParts(order, dto.getServiceParts());
        recalculate(order);
        return toDto(orderRepo.save(order));
    }

    @Transactional
    public ServiceOrderDTO update(Long id, ServiceOrderDTO dto) {
        ServiceOrder order = findOrThrow(id);
        if (dto.getStatus() != null) order.setStatus(dto.getStatus());
        if (dto.getPriority() != null) order.setPriority(dto.getPriority());
        if (dto.getServiceType() != null) order.setServiceType(dto.getServiceType());
        if (dto.getCustomerComplaint() != null) order.setCustomerComplaint(dto.getCustomerComplaint());
        if (dto.getTechnicianNotes() != null) order.setTechnicianNotes(dto.getTechnicianNotes());
        if (dto.getEstimatedDateOut() != null) order.setEstimatedDateOut(dto.getEstimatedDateOut());
        if (dto.getDateOut() != null) order.setDateOut(dto.getDateOut());
        if (dto.getMileageOut() != null) order.setMileageOut(dto.getMileageOut());
        if (dto.getDiscount() != null) order.setDiscount(dto.getDiscount());
        if (dto.getTaxRate() != null) order.setTaxRate(dto.getTaxRate());
        if (dto.getAssignedMechanicId() != null) {
            userRepo.findById(dto.getAssignedMechanicId()).ifPresent(order::setAssignedMechanic);
        }
        if (dto.getServiceItems() != null) {
            itemRepo.deleteByServiceOrderId(id);
            saveItems(order, dto.getServiceItems());
        }
        if (dto.getServiceParts() != null) {
            spRepo.deleteByServiceOrderId(id);
            saveParts(order, dto.getServiceParts());
        }
        recalculate(order);
        return toDto(orderRepo.save(order));
    }

    public void delete(Long id) {
        findOrThrow(id);
        orderRepo.deleteById(id);
    }

    public List<ServiceOrderDTO> getByCustomer(Long customerId) {
        return orderRepo.findByCustomerId(customerId).stream().map(this::toDto).collect(Collectors.toList());
    }

    public List<ServiceOrderDTO> getByVehicle(Long vehicleId) {
        return orderRepo.findByVehicleId(vehicleId).stream().map(this::toDto).collect(Collectors.toList());
    }

    public List<ServiceOrderDTO> getByStatus(ServiceOrder.Status status) {
        return orderRepo.findByStatus(status).stream().map(this::toDto).collect(Collectors.toList());
    }

    private void saveItems(ServiceOrder order, List<ServiceItemDTO> items) {
        items.forEach(itemDto -> {
            ServiceItem item = ServiceItem.builder()
                    .serviceOrder(order)
                    .description(itemDto.getDescription())
                    .laborHours(itemDto.getLaborHours())
                    .hourlyRate(itemDto.getHourlyRate())
                    .totalPrice(itemDto.getTotalPrice())
                    .notes(itemDto.getNotes())
                    .status(itemDto.getStatus() != null ? itemDto.getStatus() : ServiceItem.ItemStatus.PENDING)
                    .build();
            itemRepo.save(item);
        });
    }

    private void saveParts(ServiceOrder order, List<ServicePartDTO> parts) {
        parts.forEach(spDto -> {
            Part part = partRepo.findById(spDto.getPartId())
                    .orElseThrow(() -> new ResourceNotFoundException("Part not found: " + spDto.getPartId()));
            BigDecimal unitPrice = spDto.getUnitPrice() != null ? spDto.getUnitPrice() : part.getSellingPrice();
            BigDecimal total = unitPrice.multiply(BigDecimal.valueOf(spDto.getQuantity()));
            ServicePart sp = ServicePart.builder()
                    .serviceOrder(order).part(part)
                    .quantity(spDto.getQuantity()).unitPrice(unitPrice).totalPrice(total)
                    .notes(spDto.getNotes()).build();
            spRepo.save(sp);
            // deduct from stock
            part.setStockQuantity(part.getStockQuantity() - spDto.getQuantity());
            partRepo.save(part);
        });
    }

    private void recalculate(ServiceOrder order) {
        BigDecimal laborTotal = itemRepo.findByServiceOrderId(order.getId()).stream()
                .map(i -> i.getTotalPrice() != null ? i.getTotalPrice() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal partsTotal = spRepo.findByServiceOrderId(order.getId()).stream()
                .map(sp -> sp.getTotalPrice() != null ? sp.getTotalPrice() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal subtotal = laborTotal.add(partsTotal);
        BigDecimal discount = order.getDiscount() != null ? order.getDiscount() : BigDecimal.ZERO;
        BigDecimal afterDiscount = subtotal.subtract(discount);
        BigDecimal taxRate = order.getTaxRate() != null ? order.getTaxRate() : BigDecimal.ZERO;
        BigDecimal tax = afterDiscount.multiply(taxRate).divide(BigDecimal.valueOf(100));
        order.setLaborCost(laborTotal);
        order.setPartsCost(partsTotal);
        order.setTotalCost(afterDiscount.add(tax));
    }

    private String generateOrderNumber() {
        String prefix = "SO-" + LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd")) + "-";
        long count = orderRepo.count() + 1;
        return prefix + String.format("%04d", count);
    }

    private ServiceOrder findOrThrow(Long id) {
        return orderRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service order not found: " + id));
    }

    private ServiceOrderDTO toDto(ServiceOrder o) {
        ServiceOrderDTO dto = new ServiceOrderDTO();
        dto.setId(o.getId());
        dto.setOrderNumber(o.getOrderNumber());
        dto.setVehicleId(o.getVehicle().getId());
        dto.setVehicleInfo(o.getVehicle().getYear() + " " + o.getVehicle().getMake() + " " + o.getVehicle().getModel() + " (" + o.getVehicle().getLicensePlate() + ")");
        dto.setCustomerId(o.getVehicle().getCustomer().getId());
        dto.setCustomerName(o.getVehicle().getCustomer().getFirstName() + " " + o.getVehicle().getCustomer().getLastName());
        if (o.getAssignedMechanic() != null) {
            dto.setAssignedMechanicId(o.getAssignedMechanic().getId());
            dto.setMechanicName(o.getAssignedMechanic().getFullName());
        }
        dto.setStatus(o.getStatus());
        dto.setPriority(o.getPriority());
        dto.setServiceType(o.getServiceType());
        dto.setCustomerComplaint(o.getCustomerComplaint());
        dto.setTechnicianNotes(o.getTechnicianNotes());
        dto.setDateIn(o.getDateIn());
        dto.setEstimatedDateOut(o.getEstimatedDateOut());
        dto.setDateOut(o.getDateOut());
        dto.setMileageIn(o.getMileageIn());
        dto.setMileageOut(o.getMileageOut());
        dto.setLaborCost(o.getLaborCost());
        dto.setPartsCost(o.getPartsCost());
        dto.setTotalCost(o.getTotalCost());
        dto.setDiscount(o.getDiscount());
        dto.setTaxRate(o.getTaxRate());
        return dto;
    }
}