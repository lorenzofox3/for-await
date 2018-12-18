import iterable from './browser-adapter.js';

export default (path, otps = {}) => {
    return {
        [Symbol.asyncIterator]: async function* () {
            const res = await fetch(path);
            for await (const chunk of iterable(res.body)) {
                // decode
                yield String.fromCodePoint(...chunk);
            }
        }
    };
}
