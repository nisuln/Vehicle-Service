package com.example.backend.controller;

import com.example.backend.dto.CustomerDTO;
import com.example.backend.service.CustomerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController @RequestMapping("/api/customers") @RequiredArgsConstructor
public class CustomerController {
    private final CustomerService service;

    @GetMapping public List<CustomerDTO> getAll() { return service.getAll(); }
    @GetMapping("/{id}") public CustomerDTO getById(@PathVariable Long id) { return service.getById(id); }
    @GetMapping("/search") public List<CustomerDTO> search(@RequestParam String q) { return service.search(q); }

    @PostMapping
    public ResponseEntity<CustomerDTO> create(@Valid @RequestBody CustomerDTO dto) {
        return ResponseEntity.ok(service.create(dto));
    }

    @PutMapping("/{id}")
    public CustomerDTO update(@PathVariable Long id, @Valid @RequestBody CustomerDTO dto) {
        return service.update(id, dto);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}