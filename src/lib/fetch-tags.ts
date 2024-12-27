import { execSync } from "child_process";

export function fetchTags(repoUrl: string) {
	const rawTags = execSync(`git ls-remote --refs --tags ${repoUrl}`)
		.toString()
		.trim()
		.split("\n");
	return rawTags
		.map((rawTag) => rawTag.split("refs/tags/").pop())
		.filter((t) => typeof t === "string");
}
