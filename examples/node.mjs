import fromFile from './node/fromFile.mjs';
import csv from './csv-parser.mjs';

//program
(async function () {
	const csvData = await csv(fromFile('./examples/fixture.csv'));
	// for await (const item of csvData){
	// 	console.log(item);
	// }
	const sumFoo = await csvData.reduce((acc,curr) => acc + curr.aime, 0);
	console.log(sumFoo);
})();