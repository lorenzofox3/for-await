import {stream} from '../index.mjs';

// take chunks stream (whether they come from file or network) and yield lines.
const lines = chunkStream => ({
	[Symbol.asyncIterator]: async function * () {
		let remaining = ''; // chunk may ends in the middle of a line
		for await (const chunk of chunkStream) {
			const chunkLines = (remaining + chunk).split('\n');
			remaining = chunkLines.pop();
			yield * chunkLines;
		}
		yield remaining;
	}
});

export default async function csvParser(source) {
	const iterable = stream(lines(source))
		.map(l => l.split(','));

	const headers = await iterable
		.slice(0, 1)
		.reduce(acc => acc);

	return iterable
		.slice(1)
		.map(line => {
			const item = {};
			headers.forEach((prop, i) => {
				item[prop] = +line[i];
			});
			return item;
		});
};


