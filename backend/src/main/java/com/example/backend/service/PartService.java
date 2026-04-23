package com.example.backend.service;

import com.example.backend.dto.PartDTO;
import com.example.backend.entity.Part;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.repository.PartRepository;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.Base64;
import java.util.List;
import java.util.stream.Collectors;

@Service @RequiredArgsConstructor
public class PartService {

    private final PartRepository partRepo;
    private final ModelMapper mapper;

    public List<PartDTO> getAll() {
        return partRepo.findByActiveTrueOrderByNameAsc()
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    public PartDTO getById(Long id) { return toDto(findOrThrow(id)); }

    public PartDTO create(PartDTO dto, MultipartFile image) throws Exception {
        Part p = mapper.map(dto, Part.class);
        p.setId(null);
        if (image != null && !image.isEmpty()) {
            p.setImageData(image.getBytes());
            p.setImageType(image.getContentType());
        }
        return toDto(partRepo.save(p));
    }

    public PartDTO update(Long id, PartDTO dto, MultipartFile image) throws Exception {
        Part existing = findOrThrow(id);
        mapper.map(dto, existing);
        existing.setId(id);
        if (image != null && !image.isEmpty()) {
            existing.setImageData(image.getBytes());
            existing.setImageType(image.getContentType());
        }
        return toDto(partRepo.save(existing));
    }

    public void delete(Long id) {
        Part p = findOrThrow(id);
        p.setActive(false);
        partRepo.save(p);
    }

    public List<PartDTO> search(String q) {
        return partRepo.searchParts(q).stream().map(this::toDto).collect(Collectors.toList());
    }

    public List<PartDTO> getLowStock() {
        return partRepo.findLowStockParts().stream().map(this::toDto).collect(Collectors.toList());
    }

    public PartDTO adjustStock(Long id, int quantity) {
        Part p = findOrThrow(id);
        p.setStockQuantity(p.getStockQuantity() + quantity);
        return toDto(partRepo.save(p));
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private Part findOrThrow(Long id) {
        return partRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Part not found: " + id));
    }

    private PartDTO toDto(Part p) {
        PartDTO dto = mapper.map(p, PartDTO.class);
        dto.setLowStock(p.getStockQuantity() <= p.getMinimumStock());

        // Convert binary image to Base64 for the frontend
        if (p.getImageData() != null && p.getImageData().length > 0) {
            dto.setImageBase64(Base64.getEncoder().encodeToString(p.getImageData()));
            dto.setImageType(p.getImageType());
        }
        return dto;
    }
}