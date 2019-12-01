# Extract first data element.
jq '.Siri.ServiceDelivery.VehicleMonitoringDelivery[].VehicleActivity[0]' \
  data.json >data-one.json

# Convert all records into one file by rows.
jq '.Siri.ServiceDelivery.VehicleMonitoringDelivery[].VehicleActivity[]' -c \
  data-57340b69-cb24-499a-ba12-518921167694-*.json | wc -l\
  >data-all.json
