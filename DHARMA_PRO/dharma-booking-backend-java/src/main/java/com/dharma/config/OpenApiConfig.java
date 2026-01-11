package com.dharma.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI dharmaOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("DHARMA Booking Backend")
                        .version("2.0.0")
                        .description("Temple Booking and Darshan Slot Management System (Java Migration)"));
    }
}
