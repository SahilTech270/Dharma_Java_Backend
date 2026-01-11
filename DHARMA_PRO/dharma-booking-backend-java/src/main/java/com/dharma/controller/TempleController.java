package com.dharma.controller;

import com.dharma.dto.TempleCreateDTO;
import com.dharma.dto.TempleResponseDTO;
import com.dharma.model.Temple;
import com.dharma.service.TempleService;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/temples")
public class TempleController {

    @Autowired
    private TempleService templeService;

    @PostMapping("/")
    public ResponseEntity<TempleResponseDTO> createTemple(@RequestBody TempleCreateDTO payload) {
        Temple temple = templeService.createTemple(payload);
        return new ResponseEntity<>(mapToResponse(temple), HttpStatus.CREATED);
    }

    @GetMapping("/")
    public ResponseEntity<List<TempleResponseDTO>> getAllTemples() {
        return ResponseEntity.ok(templeService.getAllTemples().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TempleResponseDTO> getTempleById(@PathVariable Long id) {
        return ResponseEntity.ok(mapToResponse(templeService.getTempleById(id)));
    }

    private TempleResponseDTO mapToResponse(Temple temple) {
        TempleResponseDTO dto = new TempleResponseDTO();
        BeanUtils.copyProperties(temple, dto);
        return dto;
    }
}
