package com.dharma.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        // Match Python: allow specific origins + wildcard for now if needed or specific
        // ports
        // Python: allow_origins=["http://localhost:5173", "http://localhost:5174", "*"]
        // Spring Boot recommended: be specific or use patterns.

        registry.addMapping("/**")
                .allowedOriginPatterns("*") // Using patterns to allow wildcard with credentials
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}
