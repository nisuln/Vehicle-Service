package com.example.backend.service;

import com.example.backend.dto.VehicleDTO;
import com.example.backend.entity.Customer;
import com.example.backend.entity.User;
import com.example.backend.entity.Vehicle;
import com.example.backend.repository.CustomerRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VehicleService {

    private final VehicleRepository  vehicleRepository;
    private final CustomerRepository customerRepository;
    private final UserRepository     userRepository;

    // ── isOwner: compare vehicle's customer email to user's email ─────────────
    public boolean isOwner(Long vehicleId, String username) {
        Vehicle vehicle = vehicleRepository.findById(vehicleId).orElse(null);
        if (vehicle == null) return false;
        User user = userRepository.findByUsername(username).orElse(null);
        if (user == null) return false;
        return isVehicleOwnedByUser(vehicle, user);
    }

    private boolean isVehicleOwnedByUser(Vehicle vehicle, User user) {
        if (vehicle.getCustomer() == null) return false;
        String customerEmail = vehicle.getCustomer().getEmail();
        String userEmail     = user.getEmail();
        if (customerEmail == null || userEmail == null) return false;
        return customerEmail.equals(userEmail);
    }

    // ── Get all vehicles (ADMIN) ───────────────────────────────────────────────
    public List<VehicleDTO> getAll() {
        return vehicleRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public VehicleDTO getById(Long id) {
        Vehicle v = vehicleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Vehicle not found: " + id));
        return toDTO(v);
    }

    public List<VehicleDTO> getByCustomerId(Long customerId) {
        return vehicleRepository.findByCustomerId(customerId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    // ── Get vehicles belonging to a specific user (USER role) ─────────────────
    public List<VehicleDTO> getByUsername(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
        return vehicleRepository.findAll().stream()
                .filter(v -> v.getCustomer() != null &&
                        v.getCustomer().getEmail() != null &&
                        v.getCustomer().getEmail().equals(user.getEmail()))
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<VehicleDTO> search(String q) {
        String lq = q.toLowerCase();
        return vehicleRepository.findAll().stream()
                .filter(v -> matches(v, lq))
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<VehicleDTO> searchForUser(String q, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
        String lq = q.toLowerCase();
        return vehicleRepository.findAll().stream()
                .filter(v -> v.getCustomer() != null &&
                        user.getEmail().equals(v.getCustomer().getEmail()))
                .filter(v -> matches(v, lq))
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    private boolean matches(Vehicle v, String lq) {
        return (v.getMake()  != null && v.getMake().toLowerCase().contains(lq))  ||
                (v.getModel() != null && v.getModel().toLowerCase().contains(lq)) ||
                (v.getLicensePlate() != null && v.getLicensePlate().toLowerCase().contains(lq)) ||
                (v.getColor() != null && v.getColor().toLowerCase().contains(lq)) ||
                (v.getVin()   != null && v.getVin().toLowerCase().contains(lq)) ||
                String.valueOf(v.getYear()).contains(lq);
    }

    // ── Create for USER: auto-find/create customer by user email ─────────────
    public VehicleDTO createForUser(VehicleDTO dto, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));

        Customer customer = customerRepository.findByEmail(user.getEmail())
                .orElseGet(() -> {
                    String fullName  = user.getFullName() != null ? user.getFullName() : username;
                    String firstName = fullName.contains(" ")
                            ? fullName.substring(0, fullName.indexOf(" ")) : fullName;
                    String lastName  = fullName.contains(" ")
                            ? fullName.substring(fullName.indexOf(" ") + 1) : "";
                    return customerRepository.save(
                            Customer.builder()
                                    .email(user.getEmail())
                                    .firstName(firstName)
                                    .lastName(lastName)
                                    .phone(user.getPhone())
                                    .build()
                    );
                });

        dto.setCustomerId(customer.getId());
        return create(dto);
    }

    // ── Create vehicle (ADMIN flow: customerId already in dto) ────────────────
    public VehicleDTO create(VehicleDTO dto) {
        Customer customer = customerRepository.findById(dto.getCustomerId())
                .orElseThrow(() -> new RuntimeException("Customer not found: " + dto.getCustomerId()));

        Vehicle vehicle = buildVehicle(dto, customer);
        return toDTO(vehicleRepository.save(vehicle));
    }


    private Vehicle buildVehicle(VehicleDTO dto, Customer customer) {
        Vehicle.FuelType fuelType = Vehicle.FuelType.PETROL;
        if (dto.getFuelType() != null) {
            try { fuelType = Vehicle.FuelType.valueOf(dto.getFuelType()); }
            catch (IllegalArgumentException ignored) {}
        }

        Vehicle.TransmissionType transmission = Vehicle.TransmissionType.AUTOMATIC;
        if (dto.getTransmissionType() != null) {
            try { transmission = Vehicle.TransmissionType.valueOf(dto.getTransmissionType()); }
            catch (IllegalArgumentException ignored) {}
        }

        return Vehicle.builder()
                .customer(customer)
                .make(dto.getMake())
                .model(dto.getModel())
                .year(dto.getYear())
                .color(dto.getColor())
                .licensePlate(dto.getLicensePlate())
                .vin(dto.getVin())
                .mileage(dto.getMileage() != null ? dto.getMileage() : 0)
                .fuelType(fuelType)
                .transmission(transmission)
                .build();
    }


    // ── Update vehicle ─────────────────────────────────────────────────────────
    public VehicleDTO update(Long id, VehicleDTO dto) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Vehicle not found: " + id));

        // Explicit field mapping — only update non-null values
        if (dto.getMake()             != null) vehicle.setMake(dto.getMake());
        if (dto.getModel()            != null) vehicle.setModel(dto.getModel());
        if (dto.getYear()             != null) vehicle.setYear(dto.getYear());
        if (dto.getColor()            != null) vehicle.setColor(dto.getColor());
        if (dto.getLicensePlate()     != null) vehicle.setLicensePlate(dto.getLicensePlate());
        if (dto.getVin()              != null) vehicle.setVin(dto.getVin());
        if (dto.getMileage()          != null) vehicle.setMileage(dto.getMileage());
        if (dto.getFuelType()         != null) {
            try {
                vehicle.setFuelType(Vehicle.FuelType.valueOf(dto.getFuelType()));
            } catch (IllegalArgumentException ignored) {}
        }
        if (dto.getTransmissionType() != null) {
            try {
                vehicle.setTransmission(Vehicle.TransmissionType.valueOf(dto.getTransmissionType()));
            } catch (IllegalArgumentException ignored) {}
        }

        return toDTO(vehicleRepository.save(vehicle));
    }

    public void delete(Long id) {
        vehicleRepository.deleteById(id);
    }

    // ── toDTO ─────────────────────────────────────────────────────────────────
    public VehicleDTO toDTO(Vehicle v) {
        VehicleDTO dto = new VehicleDTO();
        dto.setId(v.getId());
        dto.setMake(v.getMake());
        dto.setModel(v.getModel());
        dto.setYear(v.getYear());
        dto.setColor(v.getColor());
        dto.setLicensePlate(v.getLicensePlate());
        dto.setVin(v.getVin());
        dto.setMileage(v.getMileage());
        dto.setFuelType(v.getFuelType() != null ? v.getFuelType().name() : null);
        dto.setTransmissionType(v.getTransmission() != null ? v.getTransmission().name() : null);
        dto.setVehicleInfo(v.getYear() + " " + v.getMake() + " " + v.getModel());

        if (v.getCustomer() != null) {
            Customer c = v.getCustomer();
            dto.setCustomerId(c.getId());
            dto.setCustomerName(c.getFirstName() + " " + c.getLastName());

            // Resolve ownerUsername by matching customer email → user email
            if (c.getEmail() != null) {
                userRepository.findByEmail(c.getEmail())
                        .ifPresent(u -> dto.setOwnerUsername(u.getUsername()));
            }
        }

        return dto;
    }

}