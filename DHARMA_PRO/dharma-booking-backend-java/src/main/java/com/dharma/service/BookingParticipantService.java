package com.dharma.service;

import com.dharma.dto.BookingParticipantCreateDTO;
import com.dharma.model.Booking;
import com.dharma.model.BookingParticipant;
import com.dharma.repository.BookingParticipantRepository;
import com.dharma.repository.BookingRepository;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BookingParticipantService {

    @Autowired
    private BookingParticipantRepository participantRepository;

    @Autowired
    private BookingRepository bookingRepository;

    public BookingParticipant addParticipant(BookingParticipantCreateDTO payload) {
        Booking booking = bookingRepository.findById(payload.getBookingId())
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        BookingParticipant participant = new BookingParticipant();
        BeanUtils.copyProperties(payload, participant);
        participant.setBooking(booking); // Set relationship

        return participantRepository.save(participant);
    }

    public List<BookingParticipant> getParticipantsForBooking(Long bookingId) {
        if (!bookingRepository.existsById(bookingId)) {
            throw new RuntimeException("Booking not found");
        }
        return participantRepository.findByBooking_BookingId(bookingId);
    }

    public BookingParticipant getParticipantById(Long id) {
        return participantRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Participant not found"));
    }

    public void deleteParticipant(Long id) {
        if (!participantRepository.existsById(id)) {
            throw new RuntimeException("Participant not found");
        }
        participantRepository.deleteById(id);
    }
}
