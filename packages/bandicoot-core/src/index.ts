export { log } from "./util"

// Not covering the full structure.
export interface VmPayload {
  Siri: {
    ServiceDelivery: {
      ResponseTimestamp: string
      MoreData: boolean
      VehicleMonitoringDelivery: Array<{
        VehicleActivity: Array<VehicleActivity>
        ResponseTimestamp: string
        version: string
      }>
    }
    version: string
  }
}

export interface VehicleActivity {
  ValidUntilTime: string
  ProgressBetweenStops: {
    LinkDistance: number
    Percentage: number
  }
  MonitoredVehicleJourney: {
    LineRef: {
      /** Example: RUT:Line:575 */
      value: string
    }
    DirectionRef: {
      value: string
    }
    FramedVehicleJourneyRef: {
      DataFrameRef: {
        value: string
      }
      DatedVehicleJourneyRef: string
    }
    JourneyPatternRef: {
      value: string
    }
    PublishedLineName: Array<{
      /** Example: 575 */
      value: string
    }>
    OperatorRef: {
      value: string
    }
    OriginRef: {
      value: string
    }
    OriginName: Array<{
      value: string
    }>
    DestinationRef: {
      value: string
    }
    DestinationName: Array<{
      value: string
    }>
    HeadwayService: boolean
    OriginAimedDepartureTime: string
    DestinationAimedArrivalTime: string
    Monitored: boolean
    MonitoringError: string[]
    InCongestion: boolean
    InPanic: boolean
    DataSource: string
    VehicleLocation: {
      Longitude: number
      Latitude: number
      /** Example: real */
      srsName: string
    }
    Delay: string
    BlockRef: {
      value: string
    }
    VehicleRef: {
      /** Example: 702056 */
      value: string
    }
    PreviousCalls: {
      PreviousCall: Array<{
        StopPointRef: {
          value: string
        }
        VisitNumber: number
        StopPointName: Array<{
          value: string
        }>
      }>
    }
    MonitoredCall: {
      VehicleAtStop: boolean
      DestinationDisplay: Array<{
        value: string
      }>
      StopPointRef: {
        value: string
      }
      VisitNumber: number
      StopPointName: Array<{
        value: string
      }>
    }
    OnwardCalls: {
      OnwardCall: Array<{
        StopPointRef: {
          value: string
        }
        VisitNumber: number
        StopPointName: {
          value: string
        }
      }>
    }
  }
  /** Example: 2019-11-29T10:35:35.633+01:00 */
  RecordedAtTime: string
  /** Example: 702056_A88D7C42-6B1A-4681-9F43-20992BC3007C_575:133:4-13305 */
  ItemIdentifier: string
}

export interface VehicleActivityBoxed {
  responseTimestamp: string
  data: VehicleActivity
}

export interface PositionToWeb {
  recordTimestamp: string
  responseTimestamp: string
  vehicleRef: string
  lineRef: string
  lineName: string
  journeyTitle: string
  origin: {
    name: string
  }
  destination: {
    name: string
  }
  location: {
    longitude: number
    latitude: number
  }
  delay: string
}
