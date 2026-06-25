package com.ritesh.space_debris_collision.controller;

import com.ritesh.space_debris_collision.dto.OrbitPointDTO;
import com.ritesh.space_debris_collision.dto.SatellitePositionDTO;
import com.ritesh.space_debris_collision.entity.Satellite;
import com.ritesh.space_debris_collision.repository.SatelliteRepository;
import com.ritesh.space_debris_collision.service.OrbitPropagationService;
import com.ritesh.space_debris_collision.service.SatelliteService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/satellites")
@RequiredArgsConstructor
public class SatelliteController {

    private static final int ORBIT_PATH_INTERVAL_SECONDS = 120;

    private final SatelliteService satelliteService;
    private final OrbitPropagationService orbitPropagationService;

    @GetMapping("/fetch/{group}")
    public List<Satellite> fetchSatellitesByGroup(@PathVariable String group) throws IOException {
        return satelliteService.fetchSatelliteDataByGroup(group);
    }

    @GetMapping("/fetch/id/{id}")
    public Satellite fetchSatelliteById(@PathVariable Long id) {
        return satelliteService.fetchSatelliteDataById(id);
    }

    @GetMapping("/{noradId}/position")
    public SatellitePositionDTO getPosition(@PathVariable Long noradId) {
        Satellite satellite = satelliteService.fetchSatelliteDataById(noradId);
        return orbitPropagationService.getCurrentPosition( satellite );
    }

    @GetMapping("/{noradId}/path")
    public List<OrbitPointDTO> getPath(@PathVariable Long noradId) {
        Satellite satellite = satelliteService.fetchSatelliteDataById(noradId);
        return orbitPropagationService.getOrbitPath(satellite, ORBIT_PATH_INTERVAL_SECONDS);
    }

}
