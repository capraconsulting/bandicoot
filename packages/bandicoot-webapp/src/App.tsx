import { PositionToWeb } from "bandicoot-core"
import "leaflet/dist/images/layers-2x.png"
import "leaflet/dist/images/layers.png"
import "leaflet/dist/images/marker-icon-2x.png"
import "leaflet/dist/images/marker-icon.png"
import "leaflet/dist/images/marker-shadow.png"
import "leaflet/dist/leaflet.css"
import * as React from "react"
import { Map, Marker, TileLayer } from "react-leaflet"
// @ts-ignore
// import * as geojson from '../data.geojson';
import "./styles/base.css"

function getAge(it: PositionToWeb) {
  return (new Date().getTime() - new Date(it.recordTimestamp).getTime()) / 1000
}

function getOpacity(it: PositionToWeb) {
  const age = getAge(it)

  if (age < 30) return 1

  const op = ((300 - (age - 30)) / 300) * 0.7 + 0.1
  if (op < 0.1) return 0.1
  return op
}

const Markers = () => {
  const [list, dispatch] = React.useReducer(
    (state: PositionToWeb[], action) =>
      state
        .filter(it => it.vehicleRef !== action.data.vehicleRef)
        .concat(action.data),
    [],
  )

  React.useEffect(() => {
    const es = new EventSource("http://localhost:5000/events")
    es.addEventListener("message", event => {
      const eventData = JSON.parse(event.data) as PositionToWeb
      dispatch({
        data: eventData,
      })
    })

    return () => {
      es.close()
    }
  }, [])

  return (
    <>
      {list.map(pos => (
        <Marker
          // key={pos.recordTimestamp + pos.vehicleRef}
          key={pos.vehicleRef}
          position={{
            lat: pos.location.latitude,
            lng: pos.location.longitude,
          }}
          opacity={getOpacity(pos)}
        />
      ))}
    </>
  )
}

const App = () => (
  <Map center={[59.860067, 10.66615]} zoom={11}>
    <TileLayer
      attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    />
    <Markers />
  </Map>
)

export default App
