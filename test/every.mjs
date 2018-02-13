import test from 'zora';
import {counterGen} from "./util/source.mjs";
import {every} from "../lib/operators.mjs";

export default test('every test suite', t => {
	t.test('basic', async t => {
		let i = 0;
		const lowerThan5 = await every((item, index) => {
			t.equal(i,index,'should have forwarded the index');
			i++;
			return item <= 5;
		}, counterGen(5));

		t.equal(i,5,'should have done 5 iterations');
		t.equal(lowerThan5,true,'all items are lower than 5');

		i=0;

		const odd = await every((item, index) => {
			t.equal(i,index,'should have forwarded the index');
			i++;
			return item % 2 === 0;
		}, counterGen(5));

		t.equal(i,2,'should have done 2 iterations (until the first non odd number');
		t.equal(odd,false,'not every item is odd');
	});

	t.test('curried', async t => {
		let i = 0;
		const lowerThan5 = await every((item, index) => {
			t.equal(i,index,'should have forwarded the index');
			i++;
			return item <= 5;
		})(counterGen(5));

		t.equal(i,5,'should have done 5 iterations');
		t.equal(lowerThan5,true,'all items are lower than 5');

		i=0;

		const odd = await every((item, index) => {
			t.equal(i,index,'should have forwarded the index');
			i++;
			return item % 2 === 0;
		})(counterGen(5));

		t.equal(i,2,'should have done 2 iterations (until the first non odd number');
		t.equal(odd,false,'not every item is odd');
	});

});