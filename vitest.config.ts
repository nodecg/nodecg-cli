import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		coverage: {
			enabled: true,
		},
		typecheck: {
			enabled: true,
			include: ["**/*.ts"],
		},
	},
});
