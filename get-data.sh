#!/bin/bash
set -eu -o pipefail

# TODO: MoreData=true

# https://developer.entur.org/pages-real-time-api
#   Note:Limited to 4 requests per minute. If more frequent updates are
#   needed, publish/subscribe should be used.

# https://www.uuidgenerator.net/
uuid=57340b69-cb24-499a-ba12-518921167694

fetch_data() {
  id=$(date -u +"%Y%m%d-%H%M%S-%N")
  outfile="data/data-$uuid-$id.json"

  curl \
    -H "accept: application/json" \
    -H "ET-Client-Name: capra - bandicoot" \
    https://api.entur.io/realtime/v1/rest/vm?requestorId=$uuid\&datasetId=RUT \
    | iconv --from=utf-8 --to=iso-8859-1 \
    >"$outfile"

  echo "data/data-$uuid-$id.json"
}

log() {
  echo "$(date -u +"%H:%M:%S"): $@"
}

while true; do
  log "Fetching data"
  out_file=$(fetch_data)

  if jq -e .fault "$out_file"; then
    echo "Got fault, sleeping a bit more before retrying"
    sleep 30
    continue
  fi

  len=$(jq '.Siri.ServiceDelivery.VehicleMonitoringDelivery[].VehicleActivity | length' "$out_file")
  log "Got $len items"
  log "Idling before next request"
  sleep 15
done
