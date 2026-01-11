package com.dharma.dto;

import lombok.Data;

@Data
public class PaymentCreateDTO {
    private Long bookingId;
    private Double amount;
    private String paymentMethod;
}
