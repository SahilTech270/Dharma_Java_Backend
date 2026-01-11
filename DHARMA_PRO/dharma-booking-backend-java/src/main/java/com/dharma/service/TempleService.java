package com.dharma.service;

import com.dharma.dto.TempleCreateDTO;
import com.dharma.dto.TempleResponseDTO;
import com.dharma.model.Temple;
import com.dharma.repository.TempleRepository;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TempleService {

    @Autowired
    private TempleRepository templeRepository;

    public Temple createTemple(TempleCreateDTO payload) {
        // Check for duplicate name if required (omitted for brevity, can add custom
        // query)
        Temple temple = new Temple();
        BeanUtils.copyProperties(payload, temple);
        return templeRepository.save(temple);
    }

    public List<Temple> getAllTemples() {
        return templeRepository.findAll();
    }

    public Temple getTempleById(Long id) {
        return templeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Temple not found"));
    }

    // Update and Delete methods can be added as needed
}
