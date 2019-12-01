import { EventEmitter } from "events"
import { startServer } from "./api"
import { subscribeByInternalSse } from "./subscriber"

const emitter = new EventEmitter()

startServer(emitter)
subscribeByInternalSse("http://localhost:5001/events", emitter)
