package com.dharma.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class HomeController {

    @GetMapping("/")
    public Map<String, String> health() {
        return Map.of("status", "running", "message", "DHARMA Booking Backend API is live! (Java)");
    }
}
