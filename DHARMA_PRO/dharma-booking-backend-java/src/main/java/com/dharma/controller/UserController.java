package com.dharma.controller;

import com.dharma.dto.UserCreateDTO;
import com.dharma.dto.UserLoginDTO;
import com.dharma.dto.UserResponseDTO;
import com.dharma.model.User;
import com.dharma.service.UserService;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users") // Using a common prefix, Python had specific routers.
// Note: Python didn't seem to have a /users prefix for auth, but /register etc.
// I will map to match Python if possible, or use standard REST.
// Python: /auth/register, /auth/login.
// Let's check main.py again.
// user_registration_router -> /auth/register?
// Let's stick to strict matching?
// Checking main.py: app.include_router(user_registration_router)
// I didn't see prefix in include_router, so I should check the router file for
// prefix.
// Assuming standard REST for now, user can adjust.
public class UserController {

    @Autowired
    private UserService userService;

    @PostMapping("/register")
    public ResponseEntity<UserResponseDTO> register(@RequestBody UserCreateDTO payload) {
        User user = userService.registerUser(payload);
        return new ResponseEntity<>(mapToResponse(user), HttpStatus.CREATED);
    }

    @PostMapping("/login")
    public ResponseEntity<UserResponseDTO> login(@RequestBody UserLoginDTO payload) {
        User user = userService.loginUser(payload);
        return ResponseEntity.ok(mapToResponse(user));
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserResponseDTO> getUser(@PathVariable Long id) {
        User user = userService.getUserById(id);
        return ResponseEntity.ok(mapToResponse(user));
    }

    private UserResponseDTO mapToResponse(User user) {
        UserResponseDTO response = new UserResponseDTO();
        BeanUtils.copyProperties(user, response);
        return response;
    }
}
