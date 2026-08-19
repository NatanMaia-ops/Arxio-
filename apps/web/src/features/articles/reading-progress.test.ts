import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { scrollRatio, toReadingProgress } from "./reading-progress";

describe("Reading progress", () => {
	it("ignores an article barely scrolled", () => {
		assert.equal(toReadingProgress(0), null);
		assert.equal(toReadingProgress(0.04), null);
	});

	it("reports an article in progress with its ratio", () => {
		assert.deepEqual(toReadingProgress(0.4), { status: "reading", ratio: 0.4 });
	});

	it("treats the last stretch as fully read", () => {
		assert.deepEqual(toReadingProgress(0.95), { status: "read" });
		assert.deepEqual(toReadingProgress(1), { status: "read" });
	});

	it("discards values that are not a number", () => {
		assert.equal(toReadingProgress(Number.NaN), null);
	});

	it("reports no progress when there is nothing to scroll", () => {
		assert.equal(scrollRatio(0, 900, 700), null);
		assert.equal(scrollRatio(0, 901, 901), null);
	});

	it("measures how much of the scrollable area was covered", () => {
		assert.equal(scrollRatio(300, 700, 1700), 0.3);
	});

	it("clamps the ratio between zero and one", () => {
		assert.equal(scrollRatio(-100, 700, 1700), 0);
		assert.equal(scrollRatio(9999, 700, 1700), 1);
	});
});
