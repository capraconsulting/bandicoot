import { PositionToWeb, VehicleActivityBoxed } from "bandicoot-core"
import { EventEmitter } from "events"
import express, { Request, Response } from "express"
import http from "http"

async function handleRequest(
  emitter: EventEmitter,
  request: Request,
  response: Response,
) {
  response.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
      "Origin, X-Requested-With, Content-Type, Accept",
  })

  response.write("\n")

  const lastEventId =
    Number(request.headers["last-event-id"]) ||
    Number(request.query.lastEventId) ||
    0
  console.log("lastEventId: " + lastEventId)

  const handleData = (event: any) => {
    if (event.type !== "VehicleActivityBoxed") {
      console.warn("Discaring unknown data")
      return
    }

    const eventPayload = event.payload as VehicleActivityBoxed

    const journey = eventPayload.data.MonitoredVehicleJourney
    const webData: PositionToWeb = {
      recordTimestamp: eventPayload.data.RecordedAtTime,
      responseTimestamp: eventPayload.responseTimestamp,
      vehicleRef: journey.VehicleRef.value,
      lineRef: journey.LineRef.value,
      lineName: journey.PublishedLineName[0].value,
      journeyTitle: journey.JourneyPatternRef.value,
      origin: {
        name: journey.OriginName[0].value,
      },
      destination: {
        name: journey.DestinationName[0].value,
      },
      location: {
        longitude: journey.VehicleLocation.Longitude,
        latitude: journey.VehicleLocation.Latitude,
      },
      delay: journey.Delay,
    }

    response.write(`data: ${JSON.stringify(webData)}\n\n`)
  }

  emitter.on("data", handleData)

  response.on("close", () => {
    emitter.removeListener("data", handleData)
    response.end()
  })
}

export function startServer(emitter: EventEmitter) {
  const PORT = process.env.PORT || 5000
  const app = express()
  const server = http.createServer(app)

  // See https://jasonbutz.info/2018/08/server-sent-events-with-node/

  app.get("/events", (request, response) =>
    handleRequest(emitter, request, response),
  )
  app.options("/events", (request, response) => {
    response.writeHead(200, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers":
        "Origin, X-Requested-With, Content-Type, Accept",
    })
  })

  server.listen(PORT)
  console.log(`Listening on port ${PORT}...`)

  return server
}
