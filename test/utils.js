import {test} from 'zora';
import {curry} from '../src/lib/util';

export default test('utils test suite', t => {
    t.test('should curry function with two arguments', t => {
        const sum = curry((a, b) => a + b);
        const plusTwo = sum(2);

        t.equal(sum(3, 2), 5, 'should return result when called with two arguments');
        t.equal(typeof plusTwo, 'function', 'should return a function when called with one argument');
        t.equal(plusTwo(4), 6, 'should curry function if called with one argument');
    });
});
