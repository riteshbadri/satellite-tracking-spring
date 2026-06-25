package com.ritesh.space_debris_collision;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class SpaceDebrisCollisionApplication {

	public static void main(String[] args) {
		SpringApplication.run(SpaceDebrisCollisionApplication.class, args);
	}

}
