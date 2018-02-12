import test from 'zora';
import {toAsync} from "../lib/stream";

export default test('stream test suite', t => {
	t.test('from array', async t => {
		let iter = 0;
		const s = toAsync([0, 1, 2]);
		for await (const i of s) {
			t.equal(i, iter, `should see the value ${iter}`);
			iter++;
		}

		t.equal(iter + 1, 3, 'should have seen 3 iterations');
	});
});