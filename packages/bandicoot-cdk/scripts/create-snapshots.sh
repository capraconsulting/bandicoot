#!/bin/bash
set -eu -o pipefail

dir=__snapshots__

rm -rf cdk.out
rm -rf "$dir"
mkdir "$dir"

IS_SNAPSHOT=true ./cdk.sh synth >/dev/null

# Transform the manifest to be more snapshot friendly.
node ./scripts/transform-manifest.js cdk.out/manifest.json

cp -rp cdk.out $dir

# The tree file doesn't give us much value as part of the snapshot.
rm "$dir/tree.json"

# Remove asset contents for now.
rm -rf "$dir/asset."*
