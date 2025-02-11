import type { ChildProcessWithoutNullStreams } from "node:child_process";
import { spawn } from "node:child_process";
import EventsEmitter from "node:events";

interface IContext {
	exitter: { resolve: any; reject: any };
	whenEnd: Promise<unknown>;
	child: ChildProcessWithoutNullStreams;
	emitter: EventsEmitter;
	outString: string;
}

interface IParams {
	root: string;
	logger?: boolean;
}

export default ({ root, logger = false }: IParams) => {
	// Solve problem: https://stackoverflow.com/questions/43230346/error-spawn-npm-enoent
	const _npm = process.platform === "win32" ? "npm.cmd" : "npm";

	const EventsCallbacks = [
		{
			key: "stdoutError",
			callback({ exitter }: IContext, error: Error) {
				logger && info(`Error: ${error.message}`);
				exitter.reject(error);
			},
		},

		{
			key: "stderrError",
			callback({ exitter }: IContext, error: Error) {
				logger && info(`Error: ${error.message}`);
				exitter.reject(error);
			},
		},

		{
			key: "stdoutData",
			callback(context: IContext, data: any) {
				const content = String(data);
				context.emitter.emit("data", content);
				context.outString = context.outString.concat(content);
				logger && console.info(content);
			},
		},

		{
			key: "stderrData",
			callback(context: IContext, data: any) {
				const content = String(data);
				context.emitter.emit("data", content);
				context.outString = context.outString.concat(content);
				logger && console.info(content);
			},
		},

		{
			key: "message",
			callback(_context: IContext, data: any) {
				logger && console.info(data.toString());
			},
		},
		{
			key: "exit",
			callback({ exitter, outString }: IContext) {
				exitter.resolve(outString);
			},
		},
		{
			key: "error",
			callback({ exitter }: IContext, error: Error) {
				logger && info(`Error: ${error.message}`);
				exitter.reject(error);
			},
		},
	];

	const info = (log: string) =>
		console.info(`\x1b[1m${log}\x1b[22m`);

	const run = (command: string, params: string[]) => {
		const child = spawn(command, params, { cwd: root });
		const exitter = { resolve: null, reject: null };

		const promise = new Promise((resolve, reject) =>
			Object.assign(exitter, { resolve, reject })
		);

		const emitter = new EventsEmitter();
		const outString = "";
		const context = {
			exitter,
			whenEnd: promise,
			child,
			emitter,
			outString,
		} as IContext;

		const events = Object.fromEntries(
			EventsCallbacks.map(({ callback, key }) => [
				key,
				callback.bind(null, context),
			])
		);

		(() => {
			child.stdout.on("error", events.stdoutError);
			child.stderr.on("error", events.stderrError);
			child.stdout.on("data", events.stdoutData);
			child.stderr.on("data", events.stderrData);
			child.on("error", events.error);
			child.on("message", events.message);
			child.on("exit", events.exit);
		})();

		promise.finally(() => {
			child.stdout.removeListener("error", events.stdoutError);
			child.stderr.removeListener("error", events.stderrError);
			child.stdout.removeListener("data", events.stdoutData);
			child.stderr.removeListener("data", events.stderrData);
			child.removeListener("error", events.error);
			child.removeListener("message", events.message);
			child.removeListener("exit", events.exit);
		});

		return context;
	};

	return { run, info, _npm };
};

