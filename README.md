# bandicoot

Live map of public transport in Oslo.

This is early work in progress based on a Hackathon in November 2019.

```bash
npm install
npm run bootstrap
npm run watch
```

## To do / ideas

- Replace markers in map with better symbols
- Try out Amazon EventBridge for internal events distribution
- Draw route lines
- Filtering and search
- Switch to publish/subscribe for data origin
- Predict movement when missing data
- See historical data for some hours back in time

## Port and endpoints allocation

- http://localhost:3000 - webapp
- http://localhost:5000 - backend for frontend
  - http://localhost:5000/events - public events stream
- http://localhost:5001 - fetcher service
  - http://localhost:5001/events - internal events stream

The internal events stream implementation can be replaced with e.g.
Amazon EventBridge later.

## Data source

Currently using [Entur Real-Time API](https://developer.entur.org/pages-real-time-api)
for collecting data using the HTTP GET method (SIRI 2.0 Lite). We want to
switch to the publish/subscribe mechanism, but we had not had
time to find out how to do to the integration and the docs are
not explaining how to do this easily.

https://enturas.atlassian.net/wiki/spaces/PUBLIC/pages/637370425/SIRI-VM

## Similar services and inspiration

- https://www.banenor.no/Jernbanen/togkart/
- https://traze.app/
- https://nagix.github.io/mini-tokyo/
