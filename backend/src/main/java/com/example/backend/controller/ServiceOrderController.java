package com.example.backend.controller;

import com.example.backend.dto.ServiceOrderDTO;
import com.example.backend.entity.ServiceOrder;
import com.example.backend.service.ServiceOrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController @RequestMapping("/api/service-orders") @RequiredArgsConstructor
public class ServiceOrderController {
    private final ServiceOrderService service;

    @GetMapping public List<ServiceOrderDTO> getAll() { return service.getAll(); }
    @GetMapping("/{id}") public ServiceOrderDTO getById(@PathVariable Long id) { return service.getById(id); }
    @GetMapping("/customer/{customerId}") public List<ServiceOrderDTO> byCustomer(@PathVariable Long customerId) {
        return service.getByCustomer(customerId);
    }
    @GetMapping("/vehicle/{vehicleId}") public List<ServiceOrderDTO> byVehicle(@PathVariable Long vehicleId) {
        return service.getByVehicle(vehicleId);
    }
    @GetMapping("/status/{status}") public List<ServiceOrderDTO> byStatus(@PathVariable ServiceOrder.Status status) {
        return service.getByStatus(status);
    }

    @PostMapping
    public ResponseEntity<ServiceOrderDTO> create(@Valid @RequestBody ServiceOrderDTO dto) {
        return ResponseEntity.ok(service.create(dto));
    }

    @PutMapping("/{id}")
    public ServiceOrderDTO update(@PathVariable Long id, @RequestBody ServiceOrderDTO dto) {
        return service.update(id, dto);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}