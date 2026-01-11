package com.dharma.dto;

import lombok.Data;

@Data
public class WebhookPayloadDTO {
    private Integer our_payment_id;
    private String gateway_txn_id;
    private String status; // SUCCESS or FAILED
}
