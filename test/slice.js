import test from 'zora';
import {slice} from '../src/lib/operators';
import {counterIterable, breakableCounter, counterGenerator} from './util/source.js';

export default test('slice operator test suite', t => {

    t.test('basic: all arguments', async t => {
        let i = 0;
        const to5 = counterGenerator(5);
        const stream = slice(1, 4, to5);

        const result = [];
        for await (const item of stream) {
            i++;
            result.push(item);
        }

        t.equal(i, 3, 'should have seen 3 iterations');
        t.deepEqual(result, [1, 2, 3], 'should have seen the items');
    });

    t.test('basic: with no end', async t => {
        let i = 0;
        const to5 = counterGenerator(5);
        const stream = slice(1, to5);

        const result = [];
        for await (const item of stream) {
            i++;
            result.push(item);
        }

        t.equal(i, 4, 'should have seen 4 iterations');
        t.deepEqual(result, [1, 2, 3, 4], 'should have gone to the end of the stream');
    });

    t.test('basic: with no end and no start', async t => {
        let i = 0;
        const to5 = counterGenerator(5);
        const stream = slice(to5);

        const result = [];
        for await (const item of stream) {
            i++;
            result.push(item);
        }

        t.equal(i, 5, 'should have seen 5 iterations');
        t.deepEqual(result, [0, 1, 2, 3, 4], 'should have seen all the items');
    });

    t.test('curry with start and end', async t => {
        const sl = slice(1, 4);
        const result = [];
        let i = 0;
        for await (const item of sl(counterGenerator(5))) {
            i++;
            result.push(item);
        }

        t.equal(i, 3, 'should have seen 3 iterations');
        t.deepEqual(result, [1, 2, 3], 'should have seen the items');
    });

    t.test('curry with only start', async t => {
        let i = 0;
        const to5 = counterGenerator(5);
        const sl = slice(1);

        const result = [];
        for await (const item of sl(to5)) {
            i++;
            result.push(item);
        }

        t.equal(i, 4, 'should have seen 4 iterations');
        t.deepEqual(result, [1, 2, 3, 4], 'should have gone to the end of the stream');
    });

    t.test('curry with no start and with no end', async t => {
        let i = 0;
        const to5 = counterGenerator(5);
        const sl = slice();

        const result = [];
        for await (const item of sl(to5)) {
            i++;
            result.push(item);
        }

        t.equal(i, 5, 'should have seen 5 iterations');
        t.deepEqual(result, [0, 1, 2, 3, 4], 'should have seen all the items');
    });

    t.test('forward the consumable nature of the underlying asyncIterable: gen', async t => {
        const to5 = counterGenerator(5);
        let i = 0;
        let stream = slice(1, 4, to5);
        let result = [];

        for await (const item of stream) {
            result.push(item);
            i++;
        }

        for await (const item of stream) {
            result.push(item);
            i++;
        }

        t.equal(i, 3, 'should have seen 3 iterations only');
        t.deepEqual(result, [1, 2, 3]);
    });

    t.test('forward the consumable nature of the underlying asyncIterable: stateless iterator', async t => {
        const to5 = counterIterable(5);
        let i = 0;
        let stream = slice(1, 4, to5);
        let result = [];

        for await (const item of stream) {
            result.push(item);
            i++;
        }

        for await (const item of stream) {
            result.push(item);
            i++;
        }

        t.equal(i, 6, 'should have seen 6 iterations');
        t.deepEqual(result, [1, 2, 3, 1, 2, 3]);
    });

    t.test('should forward control flow events', async t => {
        const to5 = breakableCounter(5);
        const stream = slice(1, 4, to5);
        let i = 0;
        for await (const item of stream) {
            i++;
            break;
        }

        t.equal(i, 1, 'should have seen 1 iteration only');
        t.equal(to5.done, true, 'should have called the return hook of the underlying stream');
        t.equal(to5.index, 2, 'should have pulled two items (one skipped)');
    });

});
