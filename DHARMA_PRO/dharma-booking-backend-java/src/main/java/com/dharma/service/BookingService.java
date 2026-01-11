package com.dharma.service;

import com.dharma.dto.BookingCreateDTO;
import com.dharma.model.Booking;
import com.dharma.model.Slot;
import com.dharma.model.Temple;
import com.dharma.model.User;
import com.dharma.repository.BookingRepository;
import com.dharma.repository.SlotRepository;
import com.dharma.repository.TempleRepository;
import com.dharma.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class BookingService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TempleRepository templeRepository;

    @Autowired
    private SlotRepository slotRepository;

    @Value("${sms.url:http://localhost:8000/sms}") // Default placeholder
    private String smsUrl;

    public Booking createBooking(BookingCreateDTO payload) {
        // 1. Validate User
        User user = userRepository.findById(payload.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // 2. Validate Temple
        Temple temple = templeRepository.findById(payload.getTempleId())
                .orElseThrow(() -> new RuntimeException("Temple not found"));

        // 3. Validate Slot
        Slot slot = null;
        if (payload.getSlotId() != null) {
            slot = slotRepository.findById(payload.getSlotId())
                    .orElseThrow(() -> new RuntimeException("Slot not found"));

            // Note: In strict JPA validation, you might check if
            // slot.getTemple().getTempleId() matches payload.getTempleId()
        }

        // 4. Create Booking
        Booking booking = Booking.builder()
                .bookingType("ONLINE")
                .special(payload.getSpecial())
                .temple(temple)
                .user(user)
                .slot(slot)
                .bookingDate(payload.getBookingDate())
                .mobileNumber(user.getMobileNumber())
                .build();

        Booking savedBooking = bookingRepository.save(booking);

        // 5. Send SMS (Simulated)
        sendSms(user, temple, savedBooking);

        return savedBooking;
    }

    private void sendSms(User user, Temple temple, Booking booking) {
        try {
            String dateStr = booking.getBookingDate() != null
                    ? booking.getBookingDate().format(DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm"))
                    : "N/A";

            String message = String.format(
                    "Dear %s, your Dharma booking is confirmed!\n" +
                            "Booking ID: %d\n" +
                            "Temple: %s\n" +
                            "Date: %s\n" +
                            "Slot ID: %s\n" +
                            "Thank you for using Dharma.",
                    user.getFirstName(),
                    booking.getBookingId(),
                    temple.getTempleName(),
                    dateStr,
                    booking.getSlot() != null ? booking.getSlot().getSlotId() : "N/A");

            System.out.println("PREPARE SMS: " + message);

            // Mocking Request similar to Python
            // RestTemplate restTemplate = new RestTemplate();
            // Map<String, String> body = new HashMap<>();
            // body.put("mobile", user.getMobileNumber());
            // body.put("message", message);
            // restTemplate.postForObject(smsUrl, body, String.class);
            System.out.println("SMS SENT SUCCESS (Simulated)");

        } catch (Exception e) {
            System.err.println("SMS ERROR: " + e.getMessage());
        }
    }

    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    public Booking getBookingById(Long id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
    }

    public List<Booking> getBookingsByUser(Long userId) {
        return bookingRepository.findByUser_UserId(userId);
    }

    public void deleteBooking(Long id) {
        if (!bookingRepository.existsById(id)) {
            throw new RuntimeException("Booking not found");
        }
        bookingRepository.deleteById(id);
    }
}
