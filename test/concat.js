import test from 'zora';
import {concat} from '../src/lib/operators';
import {breakableCounter, counterGenerator} from './util/source.js';

export default test('concat operator test suite', t => {

    t.test('basic', async t => {
        let i = 0;
        const to3 = counterGenerator();
        const stream = concat(666, [1, 2], {foo: 'bar'}, to3, 'foo');

        const result = [];
        for await (const item of stream) {
            i++;
            result.push(item);
        }

        t.equal(i, 7, 'should have seen 7 iterations');
        t.deepEqual(result, [666, [1, 2], {foo: 'bar'}, 0, 1, 2, 'foo'], 'should have seen the flattened items');
    });

    t.test('forward control flow events', async t => {
        const to3 = breakableCounter();
        const to3Bis = breakableCounter();
        let i = 0;
        const stream = concat(to3, to3Bis);
        const result = [];
        for await (const item of stream) {
            result.push(item);
            i++;
            if (i >= 4) {
                break;
            }
        }

        t.equal(i, 4, 'should have seen 4 iterations only');
        t.deepEqual(result, [0, 1, 2, 0], 'should have collected the flattened items');
        t.equal(to3.done, false, 'should have been exhausted regularly');
        t.equal(to3Bis.done, true, 'should have called the return hook');
        t.equal(to3.index, 3, 'should have been pulled 3 times');
        t.equal(to3Bis.index, 1, 'should have been pulled 1 time only');
    });
});
