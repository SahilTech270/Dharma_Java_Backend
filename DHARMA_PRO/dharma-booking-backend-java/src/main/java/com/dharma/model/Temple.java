package com.dharma.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Entity
@Table(name = "temples")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Temple {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long templeId;

    @Column(length = 150)
    private String templeName;

    @Column(length = 200)
    private String location;

    @OneToMany(mappedBy = "temple", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Booking> bookings;

    @OneToMany(mappedBy = "temple", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Slot> slots;

    // Note: ParkingZone relationship omitted for now, can be added later
}
