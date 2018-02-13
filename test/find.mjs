import test from 'zora';
import {find, findIndex} from "../lib/operators.mjs";
import {counterGen} from "./util/source.mjs";

export default test('find test suite', t => {

	t.test('find', async t => {
		let i = 0;
		const value = await find((item, index) => {
			t.equal(index, i, 'should have forwarded the index');
			i++;
			return item >= 3
		}, counterGen(5));

		t.equal(value, 3, 'should have found 3');
		t.equal(i, 4, 'should have broken after four iterations');
	});

	t.test('find: no result', async t => {
		let i = 0;
		const value = await find((item, index) => {
			t.equal(index, i, 'should have forwarded the index');
			i++;
			return item >= 666;
		}, counterGen(5));

		t.equal(value, void 0, 'result value should be undefined');
		t.equal(i, 5, 'should have iterated over the whole stream');
	});

	t.test('find curried', async t => {
		let i = 0;

		const greaterOrEqualTo3 = find((item, index) => {
			t.equal(index, i, 'should have forwarded the index');
			i++;
			return item >= 3
		});

		const value = await greaterOrEqualTo3(counterGen(5));

		t.equal(value, 3, 'should have found 3');
		t.equal(i, 4, 'should have broken after four iterations');
	});

	t.test('find curried with no result', async t => {
		let i = 0;

		const greaterOrEqualToEvil = find((item, index) => {
			t.equal(index, i, 'should have forwarded the index');
			i++;
			return item >= 666;
		});

		const value = await greaterOrEqualToEvil(counterGen(5));

		t.equal(value, void 0, 'retuned value should be undefined');
		t.equal(i, 5, 'should have iterated the whole stream');
	});

	t.test('find Index', async t => {
		let i = 0;
		const value = await findIndex((item, index) => {
			t.equal(index, i, 'should have forwarded the index');
			i++;
			return item >= 3
		}, counterGen(5));

		t.equal(value, 3, 'should have return the index of value 3');
		t.equal(i, 4, 'should have broken after four iterations');
	});

	t.test('find Index: no result', async t => {
		let i = 0;
		const value = await findIndex((item, index) => {
			t.equal(index, i, 'should have forwarded the index');
			i++;
			return item >= 666;
		}, counterGen(5));

		t.equal(value, -1, 'result index should be -1');
		t.equal(i, 5, 'should have iterated over the whole stream');
	});

	t.test('find Index curried', async t => {
		let i = 0;

		const greaterOrEqualTo3 = findIndex((item, index) => {
			t.equal(index, i, 'should have forwarded the index');
			i++;
			return item >= 3
		});

		const value = await greaterOrEqualTo3(counterGen(5));

		t.equal(value, 3, 'should have return the index of value 3');
		t.equal(i, 4, 'should have broken after four iterations');
	});

	t.test('find Index curried with no result', async t => {
		let i = 0;

		const greaterOrEqualToEvil = findIndex((item, index) => {
			t.equal(index, i, 'should have forwarded the index');
			i++;
			return item >= 666;
		});

		const value = await greaterOrEqualToEvil(counterGen(5));

		t.equal(value, -1, 'result index should be -1');
		t.equal(i, 5, 'should have iterated over the whole stream');
	});
});