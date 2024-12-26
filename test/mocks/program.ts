import { mock } from "node:test";

import commander from "commander";

export class MockCommand extends commander.Command {
	log() {
		// To be mocked later
	}

	request(opts: any) {
		throw new Error("Unexpected request: " + JSON.stringify(opts, null, 2));
	}

	async runWith(argString: string) {
		return this.parseAsync(["node", "./", ...argString.split(" ")]);
	}
}

export const createMockProgram = () => {
	const program = new MockCommand();

	mock.method(program, "log").mock.mockImplementation(() => void 0);

	return program;
};
