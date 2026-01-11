package com.dharma.controller;

import com.dharma.dto.SlotCreateDTO;
import com.dharma.dto.SlotResponseDTO;
import com.dharma.model.Slot;
import com.dharma.service.SlotService;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/slots")
public class SlotController {

    @Autowired
    private SlotService slotService;

    @PostMapping("/")
    public ResponseEntity<SlotResponseDTO> createSlot(@RequestBody SlotCreateDTO payload) {
        Slot slot = slotService.createSlot(payload);
        return new ResponseEntity<>(mapToResponse(slot), HttpStatus.CREATED);
    }

    @GetMapping("/")
    public ResponseEntity<List<SlotResponseDTO>> getAllSlots() {
        return ResponseEntity.ok(slotService.getAllSlots().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<SlotResponseDTO> getSlotById(@PathVariable Long id) {
        return ResponseEntity.ok(mapToResponse(slotService.getSlotById(id)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSlot(@PathVariable Long id) {
        slotService.deleteSlot(id);
        return ResponseEntity.ok().build();
    }

    private SlotResponseDTO mapToResponse(Slot slot) {
        SlotResponseDTO dto = new SlotResponseDTO();
        BeanUtils.copyProperties(slot, dto);
        if (slot.getTemple() != null) {
            dto.setTempleId(slot.getTemple().getTempleId());
        }
        return dto;
    }
}
