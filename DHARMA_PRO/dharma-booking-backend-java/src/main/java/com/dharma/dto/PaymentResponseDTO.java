package com.dharma.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class PaymentResponseDTO {
    private Long paymentId;
    private Long bookingId;
    private Double amount;
    private String paymentMethod;
    private String transactionId;
    private LocalDateTime paymentDate;
    private String paymentStatus;
}
