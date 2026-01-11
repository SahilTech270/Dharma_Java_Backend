package com.dharma.repository;

import com.dharma.model.Temple;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TempleRepository extends JpaRepository<Temple, Long> {
}
