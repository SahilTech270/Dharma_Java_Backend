package com.dharma.controller;

import com.dharma.dto.BookingParticipantCreateDTO;
import com.dharma.dto.BookingParticipantResponseDTO;
import com.dharma.model.BookingParticipant;
import com.dharma.service.BookingParticipantService;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/participant")
public class BookingParticipantController {

    @Autowired
    private BookingParticipantService participantService;

    @PostMapping("/add")
    public ResponseEntity<BookingParticipantResponseDTO> addParticipant(
            @RequestBody BookingParticipantCreateDTO payload) {
        BookingParticipant participant = participantService.addParticipant(payload);
        return new ResponseEntity<>(mapToResponse(participant), HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<BookingParticipantResponseDTO> getParticipant(@PathVariable Long id) {
        return ResponseEntity.ok(mapToResponse(participantService.getParticipantById(id)));
    }

    @GetMapping("/booking/{bookingId}")
    public ResponseEntity<List<BookingParticipantResponseDTO>> getParticipantsForBooking(@PathVariable Long bookingId) {
        return ResponseEntity.ok(participantService.getParticipantsForBooking(bookingId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteParticipant(@PathVariable Long id) {
        participantService.deleteParticipant(id);
        return ResponseEntity.ok().build();
    }

    private BookingParticipantResponseDTO mapToResponse(BookingParticipant participant) {
        BookingParticipantResponseDTO dto = new BookingParticipantResponseDTO();
        BeanUtils.copyProperties(participant, dto);
        if (participant.getBooking() != null) {
            dto.setBookingId(participant.getBooking().getBookingId());
        }
        return dto;
    }
}
