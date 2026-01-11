package com.dharma.dto;

import lombok.Data;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class SlotResponseDTO {
    private Long slotId;
    private Long templeId;
    private Integer slotNumber;
    private LocalDate date;
    private LocalTime startTime;
    private LocalTime endTime;
    private Integer capacity;
    private Integer reservedOfflineTickets;
    private Integer onlineTickets;
    private Integer remaining;
}
