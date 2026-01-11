package com.dharma.service;

import com.dharma.dto.AdminLoginDTO;
import com.dharma.dto.AdminRegisterDTO;
import com.dharma.model.Admin;
import com.dharma.repository.AdminRepository;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AdminService {

    @Autowired
    private AdminRepository adminRepository;

    public Admin registerAdmin(AdminRegisterDTO payload) {
        if (adminRepository.findByEmail(payload.getEmail()).isPresent()) {
            throw new RuntimeException("Admin already exists with this email");
        }

        Admin admin = new Admin();
        BeanUtils.copyProperties(payload, admin);
        // Note: Password hashing should be added here
        return adminRepository.save(admin);
    }

    public Admin login(AdminLoginDTO payload) {
        // Python looks up by email (mapped to username in form_data)
        // Adjusting to support either email or username if needed, but Python was
        // strict on email.
        String email = payload.getUserName() != null ? payload.getUserName() : payload.getEmail();

        Optional<Admin> adminOpt = adminRepository.findByEmail(email);
        if (adminOpt.isEmpty()) {
            throw new RuntimeException("Admin not found");
        }

        Admin admin = adminOpt.get();
        if (!admin.getPassword().equals(payload.getPassword())) {
            throw new RuntimeException("Incorrect password");
        }
        return admin;
    }

    public Admin getAdminById(Long id) {
        return adminRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Admin not found"));
    }
}
