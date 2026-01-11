package com.dharma.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class BookingResponseDTO {
    private Long bookingId;
    private String bookingType;
    private Boolean special;
    private LocalDateTime bookingDate;
    private Long templeId;
    private Long userId;
    private Long slotId;
    private String templeName; // Extra useful info
}
