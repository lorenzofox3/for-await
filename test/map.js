import {test} from 'zora';
import {map} from '../src/lib/operators';
import {counterIterable, breakableCounter, counterGenerator} from './util/source.js';

export default test('map operator test suite', t => {

    t.test('basic', async t => {
        let i = 0;
        const to3 = counterGenerator();
        const mappedStream = map((x, index) => {
            t.equal(index, x, 'should have passed the index');
            return x * x;
        }, to3);

        for await (const item of mappedStream) {
            t.equal(item, i * i, `should see the square value of ${i} (${i * i})`);
            i++;
        }

        for await (const item of mappedStream) {
            i++;
        }

        t.equal(i, 3, 'should have seen 3 iterations only');

    });

    t.test('forward the consumable nature of the underlying asyncIterable', async t => {
        let i = 0;
        const to3 = counterIterable();
        const mappedStream = map((x, index) => {
            t.equal(index, x, 'should have passed the index');
            return x * x;
        }, to3);

        for await (const item of mappedStream) {
            t.equal(item, i * i, `should see the square value of ${i} (${i * i})`);
            i++;
        }

        for await (const item of mappedStream) {
            t.equal(item, (i - 3) * (i - 3), `should see the square value of ${i - 3} (${(i - 3) * (i - 3)})`);
            i++;
        }

        t.equal(i, 6, 'should have seen 6 iterations');
    });

    t.test('forward control flow event', async t => {
        let i = 0;
        const to3 = breakableCounter();
        const mappedStream = map(x => x * x, to3);
        for await (const item of mappedStream) {
            i++;
            break;
        }

        t.equal(i, 1, 'should have done a single iteration');

        t.equal(to3.done, true, 'should have called the return of underlying iterator');
        t.equal(to3.index, 1, 'should have pulled one single time');

    });

    t.test('curried map', async t => {
        const square = map(x => x * x);
        let i = 0;
        for await (const item of square(counterGenerator())) {
            t.equal(item, i * i, `should see the square value of ${i} (${i * i})`);
            i++;
        }

        i = 0;
        for await (const item of square(counterGenerator())) {
            t.equal(item, i * i, `should see the square value of ${i} (${i * i}) from an other iterable`);
            i++;
        }
    });
});
