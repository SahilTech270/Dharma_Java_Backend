package com.dharma.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class BookingCreateDTO {
    private String bookingType = "ONLINE";
    private Boolean special;
    private LocalDateTime bookingDate;
    private Long templeId;
    private Long userId;
    private Long slotId;
}
