package com.ritesh.space_debris_collision.config;

import org.orekit.data.DataContext;
import org.orekit.data.DataProvidersManager;
import org.orekit.data.DirectoryCrawler;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.event.EventListener;

import java.io.File;
import java.net.URISyntaxException;
import java.net.URL;
import java.nio.file.Files;
import java.nio.file.Path;

@Configuration
public class OrekitConfig {

//    @PostConstruct
    @EventListener(ApplicationReadyEvent.class)
    public void init() throws URISyntaxException {

        File orekitData = resolveOrekitDataDirectory();

        DataProvidersManager manager =
                DataContext.getDefault().getDataProvidersManager();

        manager.addProvider(
                new DirectoryCrawler(orekitData)
        );
    }

    private File resolveOrekitDataDirectory() throws URISyntaxException {
        Path[] candidates = {
                Path.of("src", "main", "resources", "orekit-data-main"),
                Path.of("space-debris-collision", "src", "main", "resources", "orekit-data-main")
        };

        for (Path candidate : candidates) {
            if (Files.isDirectory(candidate)) {
                return candidate.toFile();
            }
        }

        URL resource = getClass().getClassLoader().getResource("orekit-data-main");
        if (resource != null && "file".equals(resource.getProtocol())) {
            File resourceDirectory = new File(resource.toURI());
            if (resourceDirectory.isDirectory()) {
                return resourceDirectory;
            }
        }

        throw new IllegalStateException("Orekit data directory not found. Start the backend from the space-debris-collision directory or ensure orekit-data-main is on the classpath.");
    }
}
