package com.ritesh.space_debris_collision.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.Instant;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class OrbitPointDTO implements Serializable {

    private Instant timestamp;

    private double latitude;

    private double longitude;

    private double altitude;
    
}
