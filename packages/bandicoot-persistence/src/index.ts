import { VehicleActivityBoxed, VmPayload } from "bandicoot-core"
import { promises as fs } from "fs"
import moment from "moment"
import path from "path"

export class FileStorage {
  readonly directory: string

  constructor(directory: string) {
    this.directory = directory
  }
}

export async function storeVmPayload(
  storage: FileStorage,
  uuid: string,
  data: VmPayload,
) {
  const id = moment()
    .utc()
    .format("YYYYMMDD-HHmmss")

  const filename = `data-${uuid}-${id}.json`
  const outfile = path.join(storage.directory, filename)
  await fs.writeFile(outfile, JSON.stringify(data))
}

export function getStorageDirEnv(): string | never {
  const value = process.env.STORAGE_DIR
  if (value == null) {
    throw new Error("Missing STORAGE_DIR environment variable")
  }

  return path.normalize(value)
}

export async function getAllPersistedVmPayload(
  storage: FileStorage,
  receiver: (item: VehicleActivityBoxed) => Promise<void>,
) {
  const dirList = await fs.readdir(storage.directory)

  const dataFiles = dirList
    .filter(it => it.endsWith(".json"))
    // Make sure we will traverse the data in the chronological order.
    .sort()

  for (const filename of dataFiles) {
    const fileContents = await fs.readFile(
      path.join(storage.directory, filename),
      "utf8",
    )

    const records = fileContents
      .split("\n")
      // Remove possible blank lines.
      .filter(it => it.trim() !== "")
      .map(it => {
        try {
          return JSON.parse(it)
        } catch (e) {
          console.error("Error parsing JSON value", e)
          throw new Error("Could not parse JSON value: " + it)
        }
      })
      // Remove errors due to throttling (only relevant for previously stored data).
      .filter(it => !it.hasOwnProperty("fault"))
      .flatMap((it: VmPayload) => {
        if (!it.Siri) {
          throw new Error("Missing data: " + JSON.stringify(it))
        }
        return it.Siri.ServiceDelivery.VehicleMonitoringDelivery.flatMap(
          inner =>
            // There are not always data here. So exclude if no data.
            // {"Siri":{"ServiceDelivery":{"ResponseTimestamp":"2019-11-29T12:49:40.602364+01:00","ProducerRef":{"value":"ENT"},"RequestMessageRef":{"value":"57340b69-cb24-499a-ba12-518921167694"},"MoreData":false,"VehicleMonitoringDelivery":[{"ResponseTimestamp":"2019-11-29T12:49:40.602366+01:00","version":"2.0"}]},"version":"2.0"}}
            inner.hasOwnProperty("VehicleActivity")
              ? inner.VehicleActivity.map<VehicleActivityBoxed>(inner => ({
                  // TODO: Verify correct ResponseTimestamp
                  responseTimestamp: it.Siri.ServiceDelivery.ResponseTimestamp,
                  data: inner,
                }))
              : [],
        )
      })

    for (const record of records) {
      await receiver(record)
    }
  }
}
