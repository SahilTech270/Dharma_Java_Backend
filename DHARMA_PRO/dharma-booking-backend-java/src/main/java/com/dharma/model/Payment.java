package com.dharma.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payment {

    // Trigger Recompile
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long paymentId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bookingId", nullable = false)
    private Booking booking;

    @Column(nullable = false)
    private Double amount;

    @Column(length = 50, nullable = false)
    private String paymentMethod; // UPI / Card / NetBanking

    @Column(length = 100)
    private String transactionId;

    @Builder.Default
    private LocalDateTime paymentDate = LocalDateTime.now();

    @Enumerated(EnumType.STRING)
    @Column(length = 20, nullable = false)
    private com.dharma.enums.PaymentStatus paymentStatus;

    @PrePersist
    protected void onCreate() {
        if (paymentDate == null) {
            paymentDate = LocalDateTime.now();
        }
        if (paymentStatus == null) {
            paymentStatus = com.dharma.enums.PaymentStatus.PENDING;
        }
    }
}
