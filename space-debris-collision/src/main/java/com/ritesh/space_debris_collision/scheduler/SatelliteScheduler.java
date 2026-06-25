package com.ritesh.space_debris_collision.scheduler;

import com.ritesh.space_debris_collision.repository.SatelliteRepository;
import com.ritesh.space_debris_collision.service.SatelliteService;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.List;

@Component
@RequiredArgsConstructor
public class SatelliteScheduler {

    private final SatelliteService satelliteService;
    private final SatelliteRepository satelliteRepository;

    private final List<String> groups = List.of(
            "stations",
            "weather",
            "geo",
//            "starlink",
            "planet",
            "last-30-days",
            "analyst",
            "visual",
            "resource",
            "sar",
            "sarsat",
            "dmc",
            "tdrss",
            "argos",
            "spire",
            "MOVERS",
            "gnss",
            "galileo",
            "sbas",
            "science",
            "engineering",
            "cubesat"

    );

//    @PostConstruct

    @EventListener(ApplicationReadyEvent.class)
    public void initialSatelliteLoad() throws IOException {

        if(satelliteRepository.countDistinctNoradIds() > 2000) {
            System.out.println("Data already synced!");
            System.out.println(satelliteRepository.countDistinctNoradIds());
        }
        else {
            for (String group : groups) {
                satelliteService.syncSatelliteGroup(group);
            }

            System.out.println("Initial synchronization completed");
        }

    }

//    TODO: UNCOMMENT THE BELOW CODE !! IT IS FOR REFRESHING EVERY 10 MIN

//    @SneakyThrows
//    @Scheduled(fixedRate = 600000)
//    public void refreshSatelliteData() throws IOException {
//
////        groups.forEach(
////                satelliteService::syncSatelliteGroup
////        );
//        for(String group : groups) {
//            satelliteService.syncSatelliteGroup(group);
//        }
//
//        System.out.println("Satellite data refreshed");
//
//    }


}
