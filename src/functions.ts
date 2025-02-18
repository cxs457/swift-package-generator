import { join, resolve, normalize } from "node:path";
import { readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { error, getInput, info } from "@actions/core";
import { exec } from "@actions/exec";
import { context as ghContext } from "@actions/github";
import type {
	PullRequest,
	PushEvent,
} from "@octokit/webhooks-definitions/schema";

const handleError = (err: Error) => {
	error(err || "Error during operation");
};

const getActionInput = () => {
	const inputNames = [
		"project-name",
		"ios-version",
		"artifact-path",
		"project-file",
		"artifact-url",
	];

	const [projectName, iosVersion, artifactPath, projectFile, artifactUrl] =
		inputNames.map((input) => {
			const inputValue = getInput(input);
			if (!inputValue) {
				throw new Error(`${input} is required.`);
			}

			return inputValue;
		});

	return {
		projectName,
		iosVersion,
		artifactPath,
		projectFile,
		artifactUrl,
	};
};

const commitAndPush = async (filePath: string) => {
	try {
		info("Starting commit and push process...");

		info("Adding Project.swift to git...");
		await exec("git", ["add", filePath]);

		info("Committing changes...");
		await exec("git", ["commit", "-m", "Generate new Project.swift"]);

		let branchName = ghContext.ref;

		if (ghContext.eventName === "push") {
			const pushPayload = ghContext.payload as PushEvent;
			branchName = pushPayload.ref;
		}

		if (ghContext.eventName === "pull_request") {
			const pushPayload = ghContext.payload as PullRequest;
			branchName = pushPayload.head.ref;
		}

		if (!branchName) {
			throw new Error("Branch name is required");
		}

		info(`Detected branch for PR: ${branchName}`);

		info("Pushing changes...");
		await exec("git", ["push", "--force", "origin", `HEAD:${branchName}`]);

		info("Successfully committed and pushed version update");
	} catch (error) {
		if (error instanceof Error) {
			throw error;
		}
		throw new Error("Failed to commit and push changes");
	}
};

const configureGit = async () => {
	info("Configuring git credentials...");
	await exec("git", ["config", "--global", "user.name", "GitHub Action"]);
	await exec("git", ["config", "--global", "user.email", "action@github.com"]);
};

const mutateProjectFile = async (
	templateContent: string,
	checksum: string,
	projectName: string,
	iosVersion: number,
	zipFileUrl: string,
) => {
	const replacers = {
		projectName: "projectName",
		iosVersion: "iosVersion",
		artifactUrl: "artifactUrl",
		checksum: "checksumValue",
	};

	const newContent = templateContent
		.replaceAll(replacers.projectName, `"${projectName}"`)
		.replaceAll(replacers.iosVersion, `.v${iosVersion}`)
		.replaceAll(replacers.artifactUrl, `"${zipFileUrl}"`)
		.replaceAll(replacers.checksum, `"${checksum}"`);

	info("Applying changes...");
	return newContent;
};

const loadTemplate = async () => {
	info("Loading template...");

	const templatePath = resolve(join("swift-template.swift"));

	const templateContent = await readFile(templatePath).then((res) =>
		res.toString(),
	);

	return templateContent;
};

const generateChecksum = (data: string) =>
	createHash("md5").update(data, "utf8").digest("hex");

const generateFileChecksum = async (artifactPath: string) => {
	info("Generating checksum...");
	const zipFilePath = resolve(artifactPath);

	const checksum = await readFile(zipFilePath).then((res) =>
		generateChecksum(res.toString()),
	);

	return checksum;
};

const execute = async (
	projectFile: string,
	projectName: string,
	iosVersion: number,
	artifactPath: string,
	artifactUrl: string,
) => {
	try {
		const [template, checksum] = await Promise.all([
			loadTemplate(),
			generateFileChecksum(artifactPath),
		]);

		const newContent = await mutateProjectFile(
			template,
			checksum,
			projectName,
			iosVersion,
			artifactUrl,
		);

		await writeFile(projectFile, newContent);

		await configureGit();
		await commitAndPush(projectFile);
	} catch (err) {
		handleError(err as Error);
	}
};

export {
	getActionInput,
	commitAndPush,
	configureGit,
	mutateProjectFile,
	loadTemplate,
	generateChecksum,
	generateFileChecksum,
	execute,
};
