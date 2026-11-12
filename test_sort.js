import assert from "node:assert";
import { parseDuration, buildOrder } from "./sortlib.js";

assert.equal(parseDuration("4:35"), 275);
assert.equal(parseDuration("1:02:03"), 3723);
assert.equal(parseDuration("0:00"), 0);
assert.equal(parseDuration("LIVE"), Infinity);
assert.equal(parseDuration(""), Infinity);

assert.deepEqual(
  buildOrder([
    { id: 1, duration: 300 },
    { id: 2, duration: Infinity }, // unknowns last, original order kept
    { id: 3, duration: 100 },
    { id: 4, duration: Infinity },
    { id: 5, duration: 300 }, // tie → stable (1 before 5)
  ]),
  [3, 1, 5, 2, 4],
);

console.log("ok");
