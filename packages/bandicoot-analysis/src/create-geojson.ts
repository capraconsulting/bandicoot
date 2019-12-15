import { VehicleActivityBoxed } from "bandicoot-core"
import {
  FileStorage,
  getAllPersistedVmPayload,
  getStorageDirEnv,
} from "bandicoot-persistence"
import { promises as fs } from "fs"
import { createCollection, createPoint } from "./geojson"
import { isMissingLocation, not } from "./util"

const storage = new FileStorage(getStorageDirEnv())

async function getData() {
  const data: VehicleActivityBoxed[] = []
  await getAllPersistedVmPayload(storage, async item => {
    data.push(item)
  })
  console.log("count", data.length)
  return data
}

async function main() {
  const features0 = (await getData())
    .filter(not(isMissingLocation))
    .sort((a, b) => a.data.RecordedAtTime.localeCompare(b.data.RecordedAtTime))
    .slice(-1000)
    // .filter(it => it.MonitoredVehicleJourney.LineRef.value === "RUT:Line:32")
    .reduce<Record<string, VehicleActivityBoxed>>((acc, cur) => {
      acc[cur.data.MonitoredVehicleJourney.VehicleRef.value] = cur
      return acc
    }, {})

  const features = Object.values(features0).map(it =>
    createPoint(
      it.data.MonitoredVehicleJourney.VehicleLocation.Longitude,
      it.data.MonitoredVehicleJourney.VehicleLocation.Latitude,
      {
        "marker-color": "#ff0000",
        "marker-size": "medium",
        "marker-symbol": "rail",
        "line-ref": it.data.MonitoredVehicleJourney.LineRef.value,
        "journey-title":
          it.data.MonitoredVehicleJourney.JourneyPatternRef.value,
        age:
          (new Date().getTime() - new Date(it.data.RecordedAtTime).getTime()) /
          1000,
      },
    ),
  )
  // .slice(0, 1000);

  /*
  await fs.writeFile(
    "data-latest.json",
    Object.values(features0)
      .map(it => JSON.stringify(it))
      .join("\n"),
  )
  */

  await fs.writeFile(
    "data.geojson",
    JSON.stringify(createCollection(features), undefined, "  "),
  )
}

main().catch(error => {
  console.error(error.stack || error.message || error)
  process.exitCode = 1
})
