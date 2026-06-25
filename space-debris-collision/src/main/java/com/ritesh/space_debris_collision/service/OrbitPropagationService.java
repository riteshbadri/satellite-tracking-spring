package com.ritesh.space_debris_collision.service;

import com.ritesh.space_debris_collision.dto.OrbitPointDTO;
import com.ritesh.space_debris_collision.dto.SatellitePositionDTO;
import com.ritesh.space_debris_collision.entity.Satellite;
import org.hipparchus.geometry.euclidean.threed.Vector3D;
import org.hipparchus.util.FastMath;
import org.orekit.bodies.GeodeticPoint;
import org.orekit.bodies.OneAxisEllipsoid;
import org.orekit.frames.Frame;
import org.orekit.frames.FramesFactory;
import org.orekit.propagation.SpacecraftState;
import org.orekit.propagation.analytical.tle.TLE;
import org.orekit.propagation.analytical.tle.TLEPropagator;
import org.orekit.time.AbsoluteDate;
import org.orekit.time.TimeScalesFactory;
import org.orekit.utils.Constants;
import org.orekit.utils.IERSConventions;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Service
public class OrbitPropagationService {

    private static final Logger log =
            LoggerFactory.getLogger(OrbitPropagationService.class);

    @Cacheable(
            value = "current-position",
            key = "#satellite.noradId + '_' + #satellite.tleLine1.hashCode() + '_' + #satellite.tleLine2.hashCode()"
    )
    public SatellitePositionDTO getCurrentPosition(Satellite satellite) {

        TLE tle = new TLE(
                satellite.getTleLine1(),
                satellite.getTleLine2());

        TLEPropagator propagator =
                TLEPropagator.selectExtrapolator(tle);

        AbsoluteDate date =
                new AbsoluteDate(
                        new Date(),
                        TimeScalesFactory.getUTC());

        SpacecraftState state =
                propagator.propagate(date);

        Vector3D position =
                state.getPVCoordinates().getPosition();

        Frame earthFrame =
                FramesFactory.getITRF(
                        IERSConventions.IERS_2010,
                        true);

        OneAxisEllipsoid earth =
                new OneAxisEllipsoid(
                        Constants.WGS84_EARTH_EQUATORIAL_RADIUS,
                        Constants.WGS84_EARTH_FLATTENING,
                        earthFrame);

        GeodeticPoint point =
                earth.transform(
                        position,
                        FramesFactory.getTEME(),
                        date);

        return new SatellitePositionDTO(
                satellite.getNoradId(),
                satellite.getName(),
                FastMath.toDegrees(point.getLatitude()),
                FastMath.toDegrees(point.getLongitude()),
                point.getAltitude()/1000,
                position.getX()/1000,
                position.getY()/1000,
                position.getZ()/1000
        );
    }


    @Cacheable(
            value = "orbit-paths",
            key = "#satellite.noradId + '_' + #satellite.tleLine1.hashCode() + '_' + #satellite.tleLine2.hashCode() + '_' + #intervalSeconds"
    )
    public List<OrbitPointDTO> getOrbitPath(Satellite satellite, int intervalSeconds) {

        log.info("Computing one-revolution orbit path for NORAD {}", satellite.getNoradId());
        List<OrbitPointDTO> path = new ArrayList<>();

        TLE tle = new TLE(
                satellite.getTleLine1(),
                satellite.getTleLine2());

        int orbitalPeriodSeconds =
                (int) FastMath.ceil((2.0 * FastMath.PI) / tle.getMeanMotion());

        TLEPropagator propagator =
                TLEPropagator.selectExtrapolator(tle);

        AbsoluteDate now =
                new AbsoluteDate(
                        new Date(),
                        TimeScalesFactory.getUTC());

        Frame earthFrame =
                FramesFactory.getITRF(
                        IERSConventions.IERS_2010,
                        true);

        OneAxisEllipsoid earth =
                new OneAxisEllipsoid(
                        Constants.WGS84_EARTH_EQUATORIAL_RADIUS,
                        Constants.WGS84_EARTH_FLATTENING,
                        earthFrame);

        for (int seconds = 0;
             seconds <= orbitalPeriodSeconds;
             seconds += intervalSeconds) {

            AbsoluteDate futureDate =
                    now.shiftedBy(seconds);

            SpacecraftState state =
                    propagator.propagate(futureDate);

            Vector3D position =
                    state.getPVCoordinates().getPosition();

            GeodeticPoint point =
                    earth.transform(
                            position,
                            FramesFactory.getTEME(),
                            futureDate);

            path.add(
                    new OrbitPointDTO(
                            Instant.ofEpochMilli(
                                    futureDate.toDate(
                                                    TimeScalesFactory.getUTC())
                                            .getTime()),
                            FastMath.toDegrees(point.getLatitude()),
                            FastMath.toDegrees(point.getLongitude()),
                            point.getAltitude() / 1000.0
                    )
            );
        }

        if ((orbitalPeriodSeconds % intervalSeconds) != 0) {
            AbsoluteDate finalDate =
                    now.shiftedBy(orbitalPeriodSeconds);

            SpacecraftState state =
                    propagator.propagate(finalDate);

            Vector3D position =
                    state.getPVCoordinates().getPosition();

            GeodeticPoint point =
                    earth.transform(
                            position,
                            FramesFactory.getTEME(),
                            finalDate);

            path.add(
                    new OrbitPointDTO(
                            Instant.ofEpochMilli(
                                    finalDate.toDate(
                                                    TimeScalesFactory.getUTC())
                                            .getTime()),
                            FastMath.toDegrees(point.getLatitude()),
                            FastMath.toDegrees(point.getLongitude()),
                            point.getAltitude() / 1000.0
                    )
            );
        }

        return path;
    }
}
