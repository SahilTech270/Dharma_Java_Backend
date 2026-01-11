package com.dharma.service;

import com.dharma.dto.SlotCreateDTO;
import com.dharma.dto.SlotUpdateDTO;
import com.dharma.model.Slot;
import com.dharma.model.Temple;
import com.dharma.repository.SlotRepository;
import com.dharma.repository.TempleRepository;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SlotService {

    @Autowired
    private SlotRepository slotRepository;

    @Autowired
    private TempleRepository templeRepository;

    public Slot createSlot(SlotCreateDTO payload) {
        // 1. Validate Temple
        Temple temple = templeRepository.findById(payload.getTempleId())
                .orElseThrow(() -> new RuntimeException("Temple not found"));

        // 2. Validate Time
        if (!payload.getEndTime().isAfter(payload.getStartTime())) {
            throw new RuntimeException("endTime must be after startTime");
        }

        // 3. Overlap Check (Simple implementation)
        // In real app, use a custom query: WHERE templeId=? AND date=? AND start <
        // newEnd AND end > newStart
        List<Slot> existingSlots = slotRepository.findByTemple_TempleId(payload.getTempleId());
        boolean overlap = existingSlots.stream()
                .filter(s -> s.getDate() != null && s.getDate().equals(payload.getDate()))
                .anyMatch(s -> s.getStartTime().isBefore(payload.getEndTime())
                        && s.getEndTime().isAfter(payload.getStartTime()));

        if (overlap) {
            throw new RuntimeException("Another slot overlaps with this time range");
        }

        // 4. Calculate tickets
        int capacity = payload.getCapacity();
        int reserved = payload.getReservedOfflineTickets() != null ? payload.getReservedOfflineTickets() : 0;

        if (reserved > capacity) {
            throw new RuntimeException("reservedOfflineTickets cannot be greater than capacity");
        }

        int online = capacity - reserved;
        int remaining = payload.getRemaining() != null ? payload.getRemaining() : online;

        // 5. Create Slot
        Slot slot = Slot.builder()
                .temple(temple) // Relation
                .date(payload.getDate())
                .startTime(payload.getStartTime())
                .endTime(payload.getEndTime())
                .capacity(capacity)
                .reservedOfflineTickets(reserved)
                .onlineTickets(online)
                .remaining(remaining)
                .slotNumber(existingSlots.size() + 1) // Simple auto-increment logic
                .build();

        return slotRepository.save(slot);
    }

    public List<Slot> getAllSlots() {
        return slotRepository.findAll();
    }

    public Slot getSlotById(Long id) {
        return slotRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Slot not found"));
    }

    public void deleteSlot(Long id) {
        if (!slotRepository.existsById(id)) {
            throw new RuntimeException("Slot not found");
        }
        slotRepository.deleteById(id);
    }
}
