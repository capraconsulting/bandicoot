import { FileStorage, getStorageDirEnv } from "bandicoot-persistence"
import { EventEmitter } from "events"
import { startServer } from "./api"
import { startFetcher } from "./fetcher"

const uuid = "57340b69-cb24-499a-ba12-518921167694"
const storage = new FileStorage(getStorageDirEnv())
const emitter = new EventEmitter()

startFetcher(storage, uuid, emitter).catch(error => {
  console.error(error.stack || error.message || error)
  process.exitCode = 1
})

startServer(emitter)
