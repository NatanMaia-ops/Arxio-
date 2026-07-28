import assert from "node:assert/strict";
import { describe, it } from "node:test";

import type { SearchResult } from "@/features/search/types/search.types";

import { filterSearchResults, normalizeTerm } from "./search-filter";

function resultOf(title: string, authorName: string): SearchResult {
	return { id: title, title, authorName };
}

const RESULTS = [
	resultOf("Reprodutibilidade em experimentos", "Marina Duarte"),
	resultOf("Revisão por pares em público", "Caio Ribeiro"),
	resultOf("Arquitetura hexagonal", "Ana Beatriz Lopes"),
];

describe("Search filter", () => {
	it("removes accents and casing when normalizing", () => {
		assert.equal(normalizeTerm("  Revisão PÚBLICA "), "revisao publica");
	});

	it("returns the first results when the query is empty", () => {
		assert.deepEqual(filterSearchResults(RESULTS, "   "), RESULTS);
	});

	it("matches titles ignoring accents", () => {
		const results = filterSearchResults(RESULTS, "revisao");

		assert.deepEqual(
			results.map((result) => result.title),
			["Revisão por pares em público"],
		);
	});

	it("matches author names", () => {
		const results = filterSearchResults(RESULTS, "marina");

		assert.deepEqual(
			results.map((result) => result.authorName),
			["Marina Duarte"],
		);
	});

	it("requires every term to match", () => {
		assert.deepEqual(filterSearchResults(RESULTS, "revisao marina"), []);
	});

	it("caps the number of results", () => {
		assert.equal(filterSearchResults(RESULTS, "", 2).length, 2);
	});
});
