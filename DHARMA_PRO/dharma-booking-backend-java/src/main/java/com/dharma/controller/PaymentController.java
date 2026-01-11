package com.dharma.controller;

import com.dharma.dto.PaymentCreateDTO;
import com.dharma.dto.PaymentResponseDTO;
import com.dharma.dto.WebhookPayloadDTO;
import com.dharma.model.Payment;
import com.dharma.service.PaymentService;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/payment")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @PostMapping("/create")
    public ResponseEntity<PaymentResponseDTO> createPayment(@RequestBody PaymentCreateDTO payload) {
        Payment payment = paymentService.createPayment(payload);
        return new ResponseEntity<>(mapToResponse(payment), HttpStatus.CREATED);
    }

    @PostMapping("/webhook")
    public ResponseEntity<Map<String, Object>> webhook(@RequestBody WebhookPayloadDTO payload) {
        Map<String, Object> result = paymentService.processWebhook(payload);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PaymentResponseDTO> getPayment(@PathVariable Long id) {
        return ResponseEntity.ok(mapToResponse(paymentService.getPaymentById(id)));
    }

    private PaymentResponseDTO mapToResponse(Payment payment) {
        PaymentResponseDTO dto = new PaymentResponseDTO();
        BeanUtils.copyProperties(payment, dto);
        if (payment.getBooking() != null) {
            dto.setBookingId(payment.getBooking().getBookingId());
        }
        return dto;
    }
}
