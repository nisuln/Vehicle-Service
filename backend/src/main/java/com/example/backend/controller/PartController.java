package com.example.backend.controller;

import com.example.backend.dto.PartDTO;
import com.example.backend.service.PartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/parts")
@RequiredArgsConstructor
public class PartController {

    private final PartService service;

    @GetMapping
    public List<PartDTO> getAll() { return service.getAll(); }

    @GetMapping("/{id}")
    public PartDTO getById(@PathVariable Long id) { return service.getById(id); }

    @GetMapping("/search")
    public List<PartDTO> search(@RequestParam String q) { return service.search(q); }

    @GetMapping("/low-stock")
    public List<PartDTO> lowStock() { return service.getLowStock(); }

    /**
     * Create a part with an optional image.
     * Accepts multipart/form-data:
     *   - "part"  : JSON blob of PartDTO fields
     *   - "image" : image file (optional)
     */
    @PostMapping(consumes = { "multipart/form-data", "application/json" })
    public ResponseEntity<PartDTO> create(
            @RequestPart("part") @Valid PartDTO dto,
            @RequestPart(value = "image", required = false) MultipartFile image) throws Exception {
        return ResponseEntity.ok(service.create(dto, image));
    }

    /**
     * Update a part with an optional new image.
     */
    @PutMapping(value = "/{id}", consumes = { "multipart/form-data", "application/json" })
    public PartDTO update(
            @PathVariable Long id,
            @RequestPart("part") @Valid PartDTO dto,
            @RequestPart(value = "image", required = false) MultipartFile image) throws Exception {
        return service.update(id, dto, image);
    }

    @PatchMapping("/{id}/stock")
    public PartDTO adjustStock(@PathVariable Long id, @RequestParam int quantity) {
        return service.adjustStock(id, quantity);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}