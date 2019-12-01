import axios from "axios"
import { VehicleActivityBoxed, VmPayload, log } from "bandicoot-core"
import { FileStorage, storeVmPayload } from "bandicoot-persistence"
import { EventEmitter } from "events"
import iconv from "iconv-lite"

type FetchResult =
  | {
      success: true
      data: VmPayload
      records: VehicleActivityBoxed[]
    }
  | {
      success: false
      error: any
    }

async function fetchData(
  storage: FileStorage,
  uuid: string,
): Promise<FetchResult> {
  try {
    const response = await axios.get(
      `https://api.entur.io/realtime/v1/rest/vm?requestorId=${uuid}&datasetId=RUT`,
      {
        headers: {
          Accept: "application/json",
          "ET-Client-Name": "capra - bandicoot",
        },
        // Do not parse JSON.
        transformResponse: res => res,
      },
    )

    // Fix charset as the data is converted from ISO-8859-1 to UTF-8
    // on already correct UTF-8 data.
    const data = JSON.parse(
      String(iconv.encode(response.data, "iso-8859-1")),
    ) as VmPayload

    storeVmPayload(storage, uuid, data)

    const records: VehicleActivityBoxed[] = data.Siri.ServiceDelivery.VehicleMonitoringDelivery.flatMap(
      it =>
        it.VehicleActivity.map(inner => ({
          // FIXME
          responseTimestamp: it.ResponseTimestamp,
          data: inner,
        })),
    )

    return {
      success: true,
      data,
      records,
    }
  } catch (error) {
    return {
      success: false,
      error,
    }
  }
}

function sleep(seconds: number) {
  return new Promise(resolve => setTimeout(resolve, seconds * 1000))
}

export async function startFetcher(
  storage: FileStorage,
  uuid: string,
  emitter: EventEmitter,
) {
  // https://developer.entur.org/pages-real-time-api
  //   Note:Limited to 4 requests per minute. If more frequent updates are
  //   needed, publish/subscribe should be used.

  while (true) {
    log("Fetching data")

    const result = await fetchData(storage, uuid)
    if (!result.success) {
      if (result.error.response) {
        console.log(result.error.response.data)
        console.log(result.error.response.status)
        console.log(result.error.response.headers)
      } else if (result.error.request) {
        console.log(result.error.request)
      } else {
        console.log("Error", result.error.message)
      }

      log("Got fault, sleeping a bit more before retrying")
      await sleep(30)
      continue
    }

    log(`Got ${result.records.length} items`)
    if (result.records.length > 0) {
      log("Emitting events")
      result.records.forEach(it => {
        emitter.emit("data", it)
      })
    }

    log("Idling before next request")

    await sleep(15)
  }
}
