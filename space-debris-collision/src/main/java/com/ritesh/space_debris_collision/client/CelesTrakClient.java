package com.ritesh.space_debris_collision.client;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

@Component
@RequiredArgsConstructor
public class CelesTrakClient {

    private final WebClient webClient;

//    private static final String URL = "https://celestrak.org/NORAD/elements/gp.php?GROUP=stations&FORMAT=tle";

    public String fetchTleData(String group) throws IOException {

        String URL = "https://celestrak.org/NORAD/elements/gp.php?GROUP="+group+"&FORMAT=tle";


        return webClient
                .get()
                .uri(URL)
                .retrieve()
                .bodyToMono(String.class)
                .block();

    }

}
