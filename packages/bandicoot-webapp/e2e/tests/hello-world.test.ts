import { Selector } from "testcafe"

fixture`Example app`.page("http://localhost:3000")

test("Check Leaflet rendered", async t => {
  await t
    .expect(Selector(".leaflet-control-attribution").textContent)
    .match(new RegExp("Leaflet"))
})
