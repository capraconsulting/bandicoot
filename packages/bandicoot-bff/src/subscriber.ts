import { EventEmitter } from "events"
import EventSource from "eventsource"

export function subscribeByInternalSse(url: string, emitter: EventEmitter) {
  const es = new EventSource(url)
  es.addEventListener("message", event => {
    const messageEvent = event as MessageEvent
    emitter.emit("data", JSON.parse(messageEvent.data))
  })
}
