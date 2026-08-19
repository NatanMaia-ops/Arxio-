import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { formatCount } from "./article-stats";

describe("Article stats", () => {
	it("keeps counts below a thousand as they are", () => {
		assert.equal(formatCount(0), "0");
		assert.equal(formatCount(7), "7");
		assert.equal(formatCount(999), "999");
	});

	it("abbreviates thousands with a comma as decimal separator", () => {
		assert.equal(formatCount(1000), "1 mil");
		assert.equal(formatCount(1200), "1,2 mil");
		assert.equal(formatCount(12500), "12,5 mil");
	});

	it("falls back to zero for values that are not countable", () => {
		assert.equal(formatCount(Number.NaN), "0");
		assert.equal(formatCount(-5), "0");
	});
});
