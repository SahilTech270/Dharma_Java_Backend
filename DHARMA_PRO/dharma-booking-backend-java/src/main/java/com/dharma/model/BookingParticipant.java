package com.dharma.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "booking_participants")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingParticipant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long participantId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bookingId", nullable = false)
    private Booking booking;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private Integer age;

    @Column(nullable = false)
    private String gender;

    private String photoIdType;
    private String photoIdNumber;

    @Column(name = "participant_by_category")
    private String participantByCategory;
}
