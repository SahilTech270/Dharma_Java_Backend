package com.dharma.controller;

import com.dharma.dto.AdminLoginDTO;
import com.dharma.dto.AdminRegisterDTO;
import com.dharma.dto.AdminResponseDTO;
import com.dharma.model.Admin;
import com.dharma.service.AdminService;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/admin/auth")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@RequestBody AdminRegisterDTO payload) {
        Admin admin = adminService.registerAdmin(payload);
        return new ResponseEntity<>(Map.of("message", "Admin registered successfully", "adminId", admin.getAdminId()),
                HttpStatus.CREATED);
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> login(@RequestBody AdminLoginDTO payload) {
        Admin admin = adminService.login(payload);
        // Note: Token generation omitted for simplicity, returning dummy token
        return ResponseEntity
                .ok(Map.of("access_token", "dummy-jwt-token-for-" + admin.getAdminId(), "token_type", "bearer"));
    }

    @GetMapping("/me")
    public ResponseEntity<AdminResponseDTO> getProfile(@RequestParam Long adminId) {
        // Note: Real app would take ID from JWT token in context
        Admin admin = adminService.getAdminById(adminId);
        AdminResponseDTO response = new AdminResponseDTO();
        BeanUtils.copyProperties(admin, response);
        return ResponseEntity.ok(response);
    }
}
