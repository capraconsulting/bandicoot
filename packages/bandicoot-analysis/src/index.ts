import { VehicleActivityBoxed } from "bandicoot-core"
import {
  FileStorage,
  getAllPersistedVmPayload,
  getStorageDirEnv,
} from "bandicoot-persistence"
import { promises as fs } from "fs"
import moment from "moment"
import { createCollection, createPoint } from "./geojson"
import { isMissingLocation, not } from "./util"

const storage = new FileStorage(getStorageDirEnv())

function formatTime(value: string) {
  return moment(value)
    .utc()
    .format("YYYY-MM-DD HH:mm:ss")
}

async function getData() {
  let data: VehicleActivityBoxed[] = []
  await getAllPersistedVmPayload(storage, async item => {
    data.push(item)
  })
  console.log("count", data.length)
  return data
}

async function mainTimeFrequency() {
  const data = (await getData()).filter(not(isMissingLocation))

  let colorvalues: string[] = []
  const color2 = (value: string) => {
    let idx = colorvalues.indexOf(value)
    if (idx === -1) {
      idx = colorvalues.push(value) - 1
    }

    const m = 10
    return Math.round(((idx + 1) / m) * 255 * 255)
      .toString(16)
      .padStart(4, "0")
  }

  const key = (d: VehicleActivityBoxed) =>
    d.data.MonitoredVehicleJourney.LineRef.value +
    ":" +
    d.data.MonitoredVehicleJourney.VehicleRef.value

  const grouped = data.reduce<Record<string, VehicleActivityBoxed[]>>(
    (acc, cur) => {
      const kv = key(cur)
      acc[kv] = acc[kv] || []
      acc[kv].push(cur)
      return acc
    },
    {},
  )

  const items = Object.values(grouped)[1]

  const color = (i: number, len: number) =>
    Math.round(((i + 1) % len) * 255)
      .toString(16)
      .padStart(2, "0")

  await fs.writeFile(
    "data.json",
    items.map(it => JSON.stringify(it)).join("\n"),
  )

  const features = items.map((it, i) =>
    createPoint(
      it.data.MonitoredVehicleJourney.VehicleLocation.Longitude,
      it.data.MonitoredVehicleJourney.VehicleLocation.Latitude,
      {
        "marker-color": `#${color(i, items.length)}${color2(
          it.data.MonitoredVehicleJourney.FramedVehicleJourneyRef
            .DatedVehicleJourneyRef,
        )}`,
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

  await fs.writeFile(
    "data.geojson",
    JSON.stringify(createCollection(features), undefined, "  "),
  )
}

async function mainLateDataDetail() {
  const data = await getData()

  const n = data.map(it => ({
    responseTimestamp: formatTime(it.responseTimestamp),
    recordedTimestamp: formatTime(it.data.RecordedAtTime),
  }))

  const n2 = n.map(it => Object.values(it).join(","))
  const n3 = (n.length > 0 ? [Object.keys(n[0])] : []).concat(n2)
  const n4 = n3.join("\n")

  await fs.writeFile("out.csv", n4)
}

mainTimeFrequency().catch(error => {
  console.error(error.stack || error.message || error)
  process.exitCode = 1
})
