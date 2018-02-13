import test from 'zora';
import {counterGen} from "./util/source.mjs";
import {some} from "../lib/operators.mjs";

export default test('some test suite', t => {
	t.test('basic', async t => {
		let i = 0;
		const lowerThan5 = await some((item, index) => {
			t.equal(i, index, 'should have forwarded the index');
			i++;
			return item <= 5;
		}, counterGen(5));

		t.equal(i, 1, 'should have done 1 iteration as the first item is lower than 5');
		t.equal(lowerThan5, true, 'at least one item is lower than 5');

		i = 0;

		const greaterThanEvil = await some((item, index) => {
			t.equal(i, index, 'should have forwarded the index');
			i++;
			return item >= 666;
		}, counterGen(5));

		t.equal(i, 5, 'should have done the 5 iterations');
		t.equal(greaterThanEvil, false, 'There is no item greater than 666');
	});

	t.test('curried', async t => {
		let i = 0;
		const lowerThan5 = await some((item, index) => {
			t.equal(i, index, 'should have forwarded the index');
			i++;
			return item <= 5;
		})(counterGen(5));

		t.equal(i, 1, 'should have done 1 iteration as the first item is lower than 5');
		t.equal(lowerThan5, true, 'at least one item is lower than 5');

		i = 0;

		const greaterThanEvil = await some((item, index) => {
			t.equal(i, index, 'should have forwarded the index');
			i++;
			return item >= 666;
		})(counterGen(5));

		t.equal(i, 5, 'should have done the 5 iterations');
		t.equal(greaterThanEvil, false, 'There is no item greater than 666');
	});

});