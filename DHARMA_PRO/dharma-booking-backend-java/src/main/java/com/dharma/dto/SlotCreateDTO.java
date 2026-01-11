package com.dharma.dto;

import lombok.Data;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class SlotCreateDTO {
    private Long templeId;
    private LocalDate date;
    private LocalTime startTime;
    private LocalTime endTime;
    private Integer capacity;
    private Integer reservedOfflineTickets; // Optional in Python, defaulting in Service
    private Integer remaining; // Optional
}
