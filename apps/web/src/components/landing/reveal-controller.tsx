"use client";

import { useEffect } from "react";

export function RevealController() {
	useEffect(() => {
		const elements = Array.from(
			document.querySelectorAll<HTMLElement>("[data-reveal]"),
		);
		if (elements.length === 0) return;

		const reduced = window.matchMedia(
			"(prefers-reduced-motion: reduce)",
		).matches;
		if (reduced) {
			for (const element of elements) element.classList.add("is-visible");
			return;
		}

		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						entry.target.classList.add("is-visible");
						observer.unobserve(entry.target);
					}
				}
			},
			{ threshold: 0.12 },
		);

		for (const element of elements) observer.observe(element);
		return () => observer.disconnect();
	}, []);

	return null;
}
