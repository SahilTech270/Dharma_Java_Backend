package com.dharma.repository;

import com.dharma.model.BookingParticipant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookingParticipantRepository extends JpaRepository<BookingParticipant, Long> {
    List<BookingParticipant> findByBooking_BookingId(Long bookingId);
}
