import test from 'zora';
import {counterGen} from "./util/source.mjs";
import {includes} from "../lib/operators.mjs";

export default test('includes test suite', t => {
	t.test('includes', async t => {
		const has3 = await includes(3, counterGen(5));
		t.equal(has3, true, 'should have 3');

		const has666 = await includes(666, counterGen(5));
		t.equal(has666, false, 'should not have 666');

		const has1 = await includes(0, 1, counterGen(5));
		t.equal(has1, false, 'should not have 0 when starting at 1');

		const has5 = await includes(5, 3, counterGen(10));
		t.equal(has5, true, 'should have 5 when starting at 3');
	});

	t.test('includes curried', async t => {
		const has3 = await includes(3)(counterGen(5));
		t.equal(has3, true, 'should have 3');

		const has666 = await includes(666)(counterGen(5));
		t.equal(has666, false, 'should not have 666');

		const has1 = await includes(0, 1)(counterGen(5));
		t.equal(has1, false, 'should not have 0 when starting at 1');

		const has5 = await includes(5, 3)(counterGen(10));
		t.equal(has5, true, 'should have 5 when starting at 3');
	});

});
