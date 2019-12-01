import { VehicleActivityBoxed } from "bandicoot-core"

export function isMissingLocation(it: VehicleActivityBoxed) {
  return (
    it.data.MonitoredVehicleJourney.VehicleLocation.Longitude === 0 &&
    it.data.MonitoredVehicleJourney.VehicleLocation.Latitude === 0
  )
}

export function not<T>(fn: (it: T) => boolean): (it: T) => boolean {
  return (it: T) => !fn(it)
}
