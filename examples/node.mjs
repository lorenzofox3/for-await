import {parser} from './csv-parser.mjs';
import fromFile from './node/fromFile.mjs';

//program
(async function () {
	const stream = await parser(fromFile('./examples/fixture.csv'));
	for await (const line of stream) {
		console.log(line);
	}
})();