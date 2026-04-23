package com.example.backend.controller;

import com.example.backend.dto.VehicleDTO;
import com.example.backend.service.VehicleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vehicles")
@RequiredArgsConstructor
public class VehicleController {

    private final VehicleService vehicleService;

    private boolean isAdmin(Authentication auth) {
        return auth.getAuthorities().contains(new SimpleGrantedAuthority("ADMIN"));
    }

    // ADMIN → all vehicles, USER → only their own
    @GetMapping
    public ResponseEntity<List<VehicleDTO>> getAll(Authentication auth) {
        if (isAdmin(auth)) {
            return ResponseEntity.ok(vehicleService.getAll());
        }
        return ResponseEntity.ok(vehicleService.getByUsername(auth.getName()));
    }

    @GetMapping("/my")
    public ResponseEntity<List<VehicleDTO>> getMy(Authentication auth) {
        return ResponseEntity.ok(vehicleService.getByUsername(auth.getName()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<VehicleDTO> getById(@PathVariable Long id, Authentication auth) {
        if (!isAdmin(auth) && !vehicleService.isOwner(id, auth.getName())) {
            return ResponseEntity.status(403).build();
        }
        return ResponseEntity.ok(vehicleService.getById(id));
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<VehicleDTO>> getByCustomer(@PathVariable Long customerId,
                                                          Authentication auth) {
        if (!isAdmin(auth)) return ResponseEntity.status(403).build();
        return ResponseEntity.ok(vehicleService.getByCustomerId(customerId));
    }

    @GetMapping("/search")
    public ResponseEntity<List<VehicleDTO>> search(@RequestParam String q, Authentication auth) {
        if (isAdmin(auth)) return ResponseEntity.ok(vehicleService.search(q));
        return ResponseEntity.ok(vehicleService.searchForUser(q, auth.getName()));
    }

    // POST — auto-links to logged-in user's customer record
    @PostMapping
    public ResponseEntity<VehicleDTO> create(@RequestBody VehicleDTO dto, Authentication auth) {
        return ResponseEntity.ok(vehicleService.createForUser(dto, auth.getName()));
    }

    // PUT — only the vehicle owner (USER) can edit; ADMIN gets 403
    @PutMapping("/{id}")
    public ResponseEntity<VehicleDTO> update(@PathVariable Long id,
                                             @RequestBody VehicleDTO dto,
                                             Authentication auth) {
        if (!vehicleService.isOwner(id, auth.getName())) {
            return ResponseEntity.status(403).build();
        }
        return ResponseEntity.ok(vehicleService.update(id, dto));
    }

    // DELETE — only the vehicle owner (USER) can delete; ADMIN gets 403
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id, Authentication auth) {
        if (!vehicleService.isOwner(id, auth.getName())) {
            return ResponseEntity.status(403).build();
        }
        vehicleService.delete(id);
        return ResponseEntity.noContent().build();
    }
}