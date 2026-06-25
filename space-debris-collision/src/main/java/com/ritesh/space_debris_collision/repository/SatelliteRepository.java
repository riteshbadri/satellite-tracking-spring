package com.ritesh.space_debris_collision.repository;

import com.ritesh.space_debris_collision.entity.Satellite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SatelliteRepository extends JpaRepository<Satellite, Long> {
    List<Satellite> findByGroupName(String group);

    @Query("SELECT COUNT(DISTINCT s.noradId) FROM Satellite s")
    long countDistinctNoradIds();

    Satellite findTopByNoradId(Long id);
}
