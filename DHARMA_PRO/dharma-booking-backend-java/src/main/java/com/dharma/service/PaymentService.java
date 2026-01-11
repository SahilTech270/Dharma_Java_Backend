package com.dharma.service;

import com.dharma.dto.PaymentCreateDTO;
import com.dharma.dto.WebhookPayloadDTO;
import com.dharma.model.Booking;
import com.dharma.model.Payment;
import com.dharma.repository.BookingRepository;
import com.dharma.repository.PaymentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Map;

import com.dharma.enums.PaymentStatus;
import com.dharma.exception.ResourceNotFoundException;

@Service
public class PaymentService {

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private BookingRepository bookingRepository;

    public Payment createPayment(PaymentCreateDTO payload) {
        Booking booking = bookingRepository.findById(payload.getBookingId())
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        Payment payment = Payment.builder()
                .booking(booking)
                .amount(payload.getAmount())
                .paymentMethod(payload.getPaymentMethod())
                .paymentStatus(PaymentStatus.PENDING)
                .paymentDate(LocalDateTime.now())
                .build();

        return paymentRepository.save(payment);
    }

    @Transactional
    public Map<String, Object> processWebhook(WebhookPayloadDTO payload) {
        Payment payment = paymentRepository.findById(Long.valueOf(payload.getOur_payment_id()))
                .orElseThrow(() -> new ResourceNotFoundException("Payment record not found"));

        // Idempotency
        if (PaymentStatus.CONFIRMED.equals(payment.getPaymentStatus()) && "SUCCESS".equals(payload.getStatus())) {
            return Map.of("ok", true, "message", "Already confirmed");
        }

        if ("SUCCESS".equals(payload.getStatus())) {
            payment.setPaymentStatus(PaymentStatus.CONFIRMED);
            payment.setTransactionId(payload.getGateway_txn_id());
            payment.setPaymentDate(LocalDateTime.now());
            paymentRepository.save(payment);

            // TODO: Generate Ticket Logic Here (or return flag to controller)

            return Map.of("ok", true, "paymentStatus", "confirmed");
        } else {
            payment.setPaymentStatus(PaymentStatus.CANCELLED);
            payment.setTransactionId(payload.getGateway_txn_id());
            paymentRepository.save(payment);
            return Map.of("ok", true, "paymentStatus", "cancelled");
        }
    }

    public Payment getPaymentById(Long id) {
        return paymentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Payment not found"));
    }
}
