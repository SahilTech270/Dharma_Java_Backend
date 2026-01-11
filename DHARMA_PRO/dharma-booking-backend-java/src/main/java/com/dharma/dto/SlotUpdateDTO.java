package com.dharma.dto;

import lombok.Data;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class SlotUpdateDTO {
    private LocalDate date;
    private LocalTime startTime;
    private LocalTime endTime;
    private Integer capacity;
    private Integer reservedOfflineTickets;
    private Integer remaining;
}
