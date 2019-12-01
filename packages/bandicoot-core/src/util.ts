function getTime() {
  const now = new Date()
  return [
    String(now.getHours()).padStart(2, "0"),
    String(now.getMinutes()).padStart(2, "0"),
    String(now.getSeconds()).padStart(2, "0"),
  ].join(":")
}

export function log(value: string) {
  console.log(getTime() + ": " + value)
}
