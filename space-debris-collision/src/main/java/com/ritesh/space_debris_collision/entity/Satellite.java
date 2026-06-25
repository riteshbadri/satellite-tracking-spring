package com.ritesh.space_debris_collision.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class Satellite {

    @Id
    private String noradAndGroup;
    private Long noradId;
    private String name;
    private String groupName;
    private String tleLine1;
    private String tleLine2;
}
