import { expect, spyOn, mock, afterAll, it } from "bun:test";
import * as functions from "../functions";
import { exists, rm, readFile } from "node:fs/promises";

const mutateProjectFileSpy = spyOn(functions, "mutateProjectFile");
const loadTemplateSpy = spyOn(functions, "loadTemplate");
const generateFileChecksumSpy = spyOn(functions, "generateFileChecksum");
const configureGitSpy = spyOn(functions, "configureGit");
const commitAndPushSpy = spyOn(functions, "commitAndPush");

mock.module("@actions/core", () => ({
	error: console.log,
	getInput: () => "",
	info: console.log,
}));

mock.module("@actions/exec", () => ({
	exec: console.log,
}));

mock.module("@actions/github", () => ({
	context: { ref: "testBranch" },
}));

const testFile = "swift-test.swift";

afterAll(async () => {
	if (await exists(testFile)) {
		await rm(testFile);
	}
});

it("test generated switf functions - should generate a swift project file", async () => {
	const projectNameTest = "ProjectTest";

	const versionTest = 16;
	const zipPathTest = "src\\__tests__\\ios-xcframework.zip";

	const artifactUrl =
		"https://github.com/user-name/project-name/releases/download/v0.2.1/ios-xcframework.zip";

	await functions.execute(
		testFile,
		projectNameTest,
		versionTest,
		zipPathTest,
		artifactUrl,
	);

	const fileContent = await readFile(testFile).then((res) => res.toString());

	expect(mutateProjectFileSpy).toBeCalled();
	expect(loadTemplateSpy).toBeCalled();
	expect(generateFileChecksumSpy).toBeCalledWith(zipPathTest);
	expect(commitAndPushSpy).toBeCalled();
	expect(configureGitSpy).toBeCalled();

	expect(await exists(testFile)).toBe(true);

	expect(fileContent).toMatch(projectNameTest);
	expect(fileContent).toMatch(versionTest.toString());
	expect(fileContent).toMatch(artifactUrl);
});
