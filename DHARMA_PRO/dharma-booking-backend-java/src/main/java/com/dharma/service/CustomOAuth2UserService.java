package com.dharma.service;

import com.dharma.model.User;
import com.dharma.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);

        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");
        String picture = oAuth2User.getAttribute("picture");

        Optional<User> userOptional = userRepository.findByEmail(email);
        User user;
        if (userOptional.isPresent()) {
            user = userOptional.get();
            // Update details
            updateName(user, name);
            user.setProfilePhoto(picture);
            userRepository.save(user);
        } else {
            // Register new user
            user = new User();
            user.setEmail(email);
            user.setUserName(email); // Use email as default username
            updateName(user, name);
            user.setProfilePhoto(picture);

            // Set defaults for mandatory fields if not nullable yet (but we made them
            // nullable)
            // Or just leave them null

            userRepository.save(user);
        }

        return oAuth2User;
    }

    private void updateName(User user, String fullName) {
        if (fullName == null)
            return;
        String[] parts = fullName.split(" ", 2);
        user.setFirstName(parts[0]);
        if (parts.length > 1) {
            user.setLastName(parts[1]);
        } else {
            user.setLastName("");
        }
    }
}
