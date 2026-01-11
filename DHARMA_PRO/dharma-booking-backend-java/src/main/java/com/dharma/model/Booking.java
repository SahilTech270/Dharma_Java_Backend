package com.dharma.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "bookings")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long bookingId;

    @Column(length = 50)
    private String bookingType; // Virtual / Special

    @Builder.Default
    private Boolean special = true;

    @Column(columnDefinition = "TIMESTAMP")
    private LocalDateTime bookingDate;

    // Kiosk / Offline Booking Fields
    @Column(length = 15)
    private String mobileNumber;

    private Integer numberOfParticipants;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "templeId")
    private Temple temple;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "userId")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "slotId")
    private Slot slot;

    @OneToMany(mappedBy = "booking", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<BookingParticipant> participants;

    // Note: Payment relationship omitted for now
}
