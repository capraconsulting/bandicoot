import { Feature, FeatureCollection, GeoJsonProperties } from "geojson"

export function createPoint(
  longitude: number,
  latitude: number,
  properties: GeoJsonProperties,
): Feature {
  return {
    type: "Feature",
    properties,
    geometry: {
      type: "Point",
      coordinates: [longitude, latitude],
    },
  }
}

export function createCollection(features: Feature[]): FeatureCollection {
  return {
    type: "FeatureCollection",
    features,
  }
}
