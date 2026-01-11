package com.dharma.dto;

import lombok.Data;

@Data
public class AdminLoginDTO {
    private String userName; // Some frontends send email as username field
    private String email;
    private String password;
}
