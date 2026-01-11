package com.dharma.controller;

import com.dharma.dto.BookingCreateDTO;
import com.dharma.dto.BookingResponseDTO;
import com.dharma.model.Booking;
import com.dharma.service.BookingService;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/bookings")
public class BookingController {

    @Autowired
    private BookingService bookingService;

    @PostMapping("/")
    public ResponseEntity<BookingResponseDTO> createBooking(@RequestBody BookingCreateDTO payload) {
        Booking booking = bookingService.createBooking(payload);
        return new ResponseEntity<>(mapToResponse(booking), HttpStatus.CREATED);
    }

    @GetMapping("/")
    public ResponseEntity<List<BookingResponseDTO>> getAllBookings() {
        List<Booking> bookings = bookingService.getAllBookings();
        return ResponseEntity.ok(bookings.stream().map(this::mapToResponse).collect(Collectors.toList()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<BookingResponseDTO> getBookingById(@PathVariable Long id) {
        Booking booking = bookingService.getBookingById(id);
        return ResponseEntity.ok(mapToResponse(booking));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<BookingResponseDTO>> getBookingsByUser(@PathVariable Long userId) {
        List<Booking> bookings = bookingService.getBookingsByUser(userId);
        return ResponseEntity.ok(bookings.stream().map(this::mapToResponse).collect(Collectors.toList()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBooking(@PathVariable Long id) {
        bookingService.deleteBooking(id);
        return ResponseEntity.ok().build();
    }

    private BookingResponseDTO mapToResponse(Booking booking) {
        BookingResponseDTO response = new BookingResponseDTO();
        BeanUtils.copyProperties(booking, response);
        if (booking.getTemple() != null) {
            response.setTempleId(booking.getTemple().getTempleId());
            response.setTempleName(booking.getTemple().getTempleName());
        }
        if (booking.getUser() != null) {
            response.setUserId(booking.getUser().getUserId());
        }
        if (booking.getSlot() != null) {
            response.setSlotId(booking.getSlot().getSlotId());
        }
        return response;
    }
}
