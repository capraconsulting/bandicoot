import { VehicleActivityBoxed } from "bandicoot-core"
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
  })

  response.write("\n")

  // TODO: Should handle last event ID correctly.
  const lastEventId =
    Number(request.headers["last-event-id"]) ||
    Number(request.query.lastEventId) ||
    0
  console.log("lastEventId: " + lastEventId)

  const handleData = (data: VehicleActivityBoxed) => {
    const event = {
      type: "VehicleActivityBoxed",
      payload: data,
    }

    response.write(`data: ${JSON.stringify(event)}\n\n`)
  }

  emitter.on("data", handleData)

  response.on("close", () => {
    emitter.removeListener("data", handleData)
    response.end()
  })
}

export function startServer(emitter: EventEmitter) {
  const PORT = process.env.PORT || 5001
  const app = express()
  const server = http.createServer(app)

  // See https://jasonbutz.info/2018/08/server-sent-events-with-node/

  app.get("/events", (request, response) =>
    handleRequest(emitter, request, response),
  )

  server.listen(PORT)
  console.log(`Listening on port ${PORT}...`)

  return server
}
