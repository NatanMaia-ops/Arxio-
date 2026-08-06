import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { getAcademicInfoItems } from "./profile-academic-info";

describe("Profile academic information", () => {
	it("omits the academic section when there is no presentable data", () => {
		assert.deepEqual(getAcademicInfoItems(null), []);
		assert.deepEqual(
			getAcademicInfoItems({
				course: " ",
				semester: null,
				institution: "",
			}),
			[],
		);
	});

	it("includes labels only for academic fields with values", () => {
		assert.deepEqual(
			getAcademicInfoItems({
				course: " Ciência da Computação ",
				semester: 4,
				institution: null,
			}),
			[
				{ label: "Curso", value: "Ciência da Computação" },
				{ label: "Período", value: "4º período" },
			],
		);
	});
});
