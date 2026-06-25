package com.ritesh.space_debris_collision.parser;

import com.ritesh.space_debris_collision.entity.Satellite;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
public class TleParser {

    public List<Satellite> parse(String tleData, String group) {

        List<Satellite> satellites = new ArrayList<>();

        String[] lines = tleData.split("\\r?\\n");

        for (int i = 0; i < lines.length; i += 3) {

            if (i + 2 >= lines.length)
                break;

            String name = lines[i].trim();
            String line1 = lines[i + 1].trim();
            String line2 = lines[i + 2].trim();

            Long noradId = Long.parseLong(
                    line1.substring(2, 7).trim()
            );

            Satellite satellite = new Satellite();

            satellite.setNoradId(noradId);
            satellite.setName(name);
            satellite.setGroupName(group);
            satellite.setTleLine1(line1);
            satellite.setTleLine2(line2);
            satellite.setNoradAndGroup(String.valueOf(noradId)+group);

            satellites.add(satellite);
        }

        return satellites;
    }
}