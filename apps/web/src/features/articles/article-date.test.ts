import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { formatAbsoluteDate, formatPublishedDate } from "./article-date";

const REFERENCE = new Date("2026-07-27T12:00:00.000Z");

function hoursBefore(hours: number): Date {
	return new Date(REFERENCE.getTime() - hours * 60 * 60 * 1000);
}

describe("Article date", () => {
	it("formats an absolute date in Portuguese", () => {
		assert.equal(
			formatAbsoluteDate(new Date("2026-06-30T18:45:00.000Z")),
			"30 de jun de 2026",
		);
	});

	it("labels the last hour as recent", () => {
		assert.equal(
			formatPublishedDate(hoursBefore(0.5), REFERENCE),
			"agora há pouco",
		);
	});

	it("labels the same day in hours", () => {
		assert.equal(formatPublishedDate(hoursBefore(5), REFERENCE), "há 5 h");
	});

	it("labels the previous day as yesterday", () => {
		assert.equal(formatPublishedDate(hoursBefore(30), REFERENCE), "ontem");
	});

	it("labels the last week in days", () => {
		assert.equal(
			formatPublishedDate(hoursBefore(24 * 4), REFERENCE),
			"há 4 dias",
		);
	});

	it("falls back to the absolute date after a week", () => {
		assert.equal(
			formatPublishedDate(new Date("2026-06-30T18:45:00.000Z"), REFERENCE),
			"30 de jun de 2026",
		);
	});

	it("falls back to the absolute date for future dates", () => {
		assert.equal(
			formatPublishedDate(new Date("2026-08-02T10:00:00.000Z"), REFERENCE),
			"2 de ago de 2026",
		);
	});
});
