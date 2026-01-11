package com.dharma.dto;

import lombok.Data;

@Data
public class UserCreateDTO {
    private String userName;
    private String firstName;
    private String lastName;
    private String mobileNumber;
    private String email;
    private String gender;
    private String state;
    private String city;
    private String profilePhoto;
    private String password;
}
