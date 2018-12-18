import test from 'zora';
import {skip} from '../src/lib/operators';
import {counterIterable, breakableCounter, counterGenerator} from './util/source.js';

export default test('skip operator', t => {

    t.test('basic', async t => {
        let i = 1;
        const to3 = counterGenerator();
        const stream = skip(1, to3);


        for await (const item of stream) {
            t.equal(item, i, `should see item ${i}`);
            i++;
        }

        for await (const item of stream) {
            i++;
        }

        t.equal(i - 1, 2, 'should have seen 2 iterations only');

    });

    t.test('forward the consumable nature of the underlying asyncIterator', async t => {
        let i = 1;
        const to3 = counterIterable();
        const stream = skip(1, to3);

        for await (const item of stream) {
            t.equal(item, i, `should see the item ${i}`);
            i++;
        }

        t.equal(i - 1, 2, 'should have seen 2 iterations');
        i = 1;

        for await (const item of stream) {
            t.equal(item, i, `should see the item ${i} again`);
            i++;
        }

        t.equal(i - 1, 2, 'should have seen 2 iterations again');

    });

    t.test('forward control flow event', async t => {
        let i = 0;
        const to3 = breakableCounter();
        const stream = skip(1, to3);
        for await (const item of stream) {
            i++;
            break;
        }

        t.equal(i, 1, 'should have done a single iteration');

        t.equal(to3.done, true, 'should have called the return of underlying iterator');
        t.equal(to3.index, 2, 'should have pulled two items (one for the skipped');
    });

    t.test('curried skip', async t => {
        const skipOne = skip(1);
        let i = 1;
        for await (const item of skipOne(counterGenerator())) {
            t.equal(item, i, `should have seen the item ${i}`);
            i++;
        }

        i = 1;
        for await (const item of skipOne(counterGenerator())) {
            t.equal(item, i, `should have seen the item ${i}`);
            i++;
        }
    });
});
