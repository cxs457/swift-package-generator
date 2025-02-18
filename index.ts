import { getActionInput, execute } from "./src/functions";

const run = async () => {
	const { artifactPath, iosVersion, projectName, projectFile } =
		getActionInput();

	const numberIosVersion = Number.parseInt(iosVersion);

	if (!Number.isInteger(numberIosVersion)) {
		throw new Error("iosVersion must be an interger.");
	}

	await execute(projectFile, projectName, numberIosVersion, artifactPath);
};

run();
