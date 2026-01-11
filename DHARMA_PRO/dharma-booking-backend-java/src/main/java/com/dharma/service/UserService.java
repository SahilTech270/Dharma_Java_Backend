package com.dharma.service;

import com.dharma.dto.UserCreateDTO;
import com.dharma.dto.UserLoginDTO;
import com.dharma.model.User;
import com.dharma.repository.UserRepository;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public User registerUser(UserCreateDTO payload) {
        if (userRepository.findByEmail(payload.getEmail()).isPresent()) {
            throw new RuntimeException("Email already registered");
        }
        if (userRepository.findByUserName(payload.getUserName()).isPresent()) {
            throw new RuntimeException("Username already taken");
        }

        User user = new User();
        BeanUtils.copyProperties(payload, user);
        // Note: Password encryption should be added here
        return userRepository.save(user);
    }

    public User loginUser(UserLoginDTO payload) {
        // Try finding by email first
        Optional<User> userOpt = userRepository.findByEmail(payload.getIdentifier());
        if (userOpt.isEmpty()) {
            // Try finding by username
            userOpt = userRepository.findByUserName(payload.getIdentifier());
        }

        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (user.getPassword().equals(payload.getPassword())) {
                return user; // Success
            }
        }
        throw new RuntimeException("Invalid credentials");
    }

    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
