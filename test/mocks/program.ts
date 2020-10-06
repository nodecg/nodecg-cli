import commander from 'commander';

export class MockCommand extends commander.Command {
	log() {
		// To be mocked later
	}

	request(opts: any) {
		throw new Error('Unexpected request: ' + JSON.stringify(opts, null, 2));
	}

	async runWith(argString: string) {
		return this.parseAsync(['node', './', ...argString.split(' ')]);
	}
}

export const createMockProgram = () => {
	const program = new MockCommand();

	// eslint-disable-next-line no-void
	jest.spyOn(program, 'log').mockReturnValue(void 0);

	return program;
};
