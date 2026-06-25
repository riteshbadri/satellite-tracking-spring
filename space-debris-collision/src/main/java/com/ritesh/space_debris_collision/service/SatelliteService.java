package com.ritesh.space_debris_collision.service;

import com.ritesh.space_debris_collision.client.CelesTrakClient;
import com.ritesh.space_debris_collision.entity.Satellite;
import com.ritesh.space_debris_collision.parser.TleParser;
import com.ritesh.space_debris_collision.repository.SatelliteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SatelliteService {

    private final CelesTrakClient celesTrakClient;
    private final TleParser tleParser;
    private final SatelliteRepository satelliteRepository;

    public void syncSatelliteGroup(String group) throws IOException {
        String tleData = celesTrakClient.fetchTleData(group);
        List<Satellite> satelliteList = tleParser.parse(tleData, group);
        satelliteRepository.saveAll(satelliteList);
    }

    public List<Satellite> fetchSatelliteDataByGroup(String group) throws IOException {
        return satelliteRepository.findByGroupName(normalizeGroupName(group));
    }

    public Satellite fetchSatelliteDataById(Long id) {
        return satelliteRepository.findTopByNoradId(id);
    }

    private String normalizeGroupName(String group) {
        if ("latest".equalsIgnoreCase(group)) {
            return "last-30-days";
        }

        return group;
    }

}
