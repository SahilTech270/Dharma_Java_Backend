package com.dharma.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Entity
@Table(name = "slots")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Slot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long slotId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "templeId")
    private Temple temple;

    private Integer slotNumber;

    private LocalTime startTime;
    private LocalTime endTime;

    private LocalDate date;

    private Integer capacity;

    @Builder.Default
    private Integer reservedOfflineTickets = 1000;

    private Integer onlineTickets;

    private Integer remaining;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    @OneToMany(mappedBy = "slot")
    private List<Booking> bookings;
}
