package com.dharma.dto;

import lombok.Data;

@Data
public class UserLoginDTO {
    private String identifier; // email or username
    private String password;
}
