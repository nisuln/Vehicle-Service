package com.example.backend.service;

import com.example.backend.dto.CustomerDTO;
import com.example.backend.entity.Customer;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service @RequiredArgsConstructor
public class CustomerService {
    private final CustomerRepository customerRepo;
    private final ModelMapper mapper;

    public List<CustomerDTO> getAll() {
        return customerRepo.findAll().stream().map(this::toDto).collect(Collectors.toList());
    }

    public CustomerDTO getById(Long id) {
        return toDto(findOrThrow(id));
    }

    public CustomerDTO create(CustomerDTO dto) {
        Customer c = mapper.map(dto, Customer.class);
        c.setId(null);
        return toDto(customerRepo.save(c));
    }

    public CustomerDTO update(Long id, CustomerDTO dto) {
        Customer existing = findOrThrow(id);
        mapper.map(dto, existing);
        existing.setId(id);
        return toDto(customerRepo.save(existing));
    }

    public void delete(Long id) {
        findOrThrow(id);
        customerRepo.deleteById(id);
    }

    public List<CustomerDTO> search(String q) {
        return customerRepo.searchCustomers(q).stream().map(this::toDto).collect(Collectors.toList());
    }

    private Customer findOrThrow(Long id) {
        return customerRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found: " + id));
    }

    private CustomerDTO toDto(Customer c) {
        CustomerDTO dto = mapper.map(c, CustomerDTO.class);
        dto.setVehicleCount(c.getVehicles() != null ? c.getVehicles().size() : 0);
        return dto;
    }
}