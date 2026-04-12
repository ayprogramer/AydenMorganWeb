import * as d3 from 'd3';

export function createProjection(width: number, height: number) {
  return d3
    .geoNaturalEarth1()
    .scale(153 * (width / 960))
    .translate([width / 2, height / 2]);
}

export function createPathGenerator(
  projection: d3.GeoProjection,
): d3.GeoPath {
  return d3.geoPath().projection(projection);
}
