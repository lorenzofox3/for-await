import {parser} from './csv-parser.js';
import fromFile from './node/fromFile.js';

//program
(async function () {
	const stream = await parser(fromFile('./examples/fixture.csv'));
	for await (const line of stream) {
		console.log(line);
	}
})();
