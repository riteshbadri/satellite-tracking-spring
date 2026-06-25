package com.ritesh.space_debris_collision.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SatellitePositionDTO implements Serializable {

    private Long noradId;

    private String name;

    private double latitude;

    private double longitude;

    private double altitude;

    private double x;

    private double y;

    private double z;
}