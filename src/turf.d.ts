declare module "@turf/turf" {
  import * as turf from "@turf/helpers";
  export = turf;
}

declare module "@turf/helpers" {
  import {
    Feature,
    FeatureCollection,
    Geometry,
    Point,
    Polygon,
  } from "@turf/turf";
  export { Feature, FeatureCollection, Geometry, Point, Polygon };
}

declare module "@turf/points-within-polygon" {
  import {
    Feature,
    FeatureCollection,
    Polygon,
    MultiPolygon,
    MultiPoint,
    Point,
    Properties,
  } from "@turf/helpers";

  export default function pointsWithinPolygon<
    F extends Point | MultiPoint,
    G extends Polygon | MultiPolygon,
    P = Properties,
  >(
    points: Feature<F, P> | FeatureCollection<F, P>,
    polygons: Feature<G> | FeatureCollection<G> | G,
  ): FeatureCollection<F, P>;
}
