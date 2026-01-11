package com.dharma.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long userId;

    @Column(nullable = false, unique = true, length = 50)
    private String userName;

    @Column(nullable = false, length = 100)
    private String firstName;

    @Column(nullable = false, length = 100)
    private String lastName;

    @Column(nullable = false, length = 15)
    private String mobileNumber;

    @Column(nullable = false, unique = true, length = 150)
    private String email;

    @Column(nullable = true, length = 200) // Changed to nullable for OAuth
    private String password;

    @Column(nullable = true, length = 20) // Changed to nullable
    private String gender;

    @Column(nullable = true, length = 100)
    private String state;

    @Column(nullable = true, length = 100)
    private String city;

    @Column(columnDefinition = "TEXT")
    private String profilePhoto;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Booking> bookings;
}
