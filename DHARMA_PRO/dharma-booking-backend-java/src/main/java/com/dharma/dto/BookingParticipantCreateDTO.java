package com.dharma.dto;

import lombok.Data;

@Data
public class BookingParticipantCreateDTO {
    private Long bookingId;
    private String participant_by_category;
    private String name;
    private Integer age;
    private String gender;
    private String photoIdType;
    private String photoIdNumber;
}
