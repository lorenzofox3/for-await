import {stream} from '../index.mjs';
import toAsync from './node-adapter.mjs';
import fs from 'fs';


// take chunks of file stream and yield lines.
const lines = file => ({
	[Symbol.asyncIterator]: async function * () {
		let remaining = '';
		for await (const chunk of toAsync(fs.createReadStream(file, {encoding: 'utf8', highWaterMark: 7}))) {
			const chunkLines = (remaining + chunk).split('\n');
			remaining = chunkLines.pop();
			yield * chunkLines;
		}
		yield remaining;
	}
});


//program
(async function () {

	const iterable = stream(lines('./examples/fixture.csv'))
		.map(l => l.split(','));

	const headers = await iterable
		.slice(0, 1)
		.reduce(acc => acc);

	const body = iterable
		.slice(1)
		.map(line => {
			const item = {};
			headers.forEach((prop, i) => {
				item[prop] = +line[i];
			});
			return item;
		});

	for await (const line of body) {
		console.log(line);
	}

})();