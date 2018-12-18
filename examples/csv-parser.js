import {stream} from '../dist/bundle/module.js';

// take chunks stream (whether they come from file or network) and yield lines.
export const lines = chunkStream => ({
    [Symbol.asyncIterator]: async function* () {
        let remaining = ''; // chunk may ends in the middle of a line
        for await (const chunk of chunkStream) {
            const chunkLines = (remaining + chunk).split('\n');
            remaining = chunkLines.pop();
            yield* chunkLines;
        }
        yield remaining;
    }
});

export async function parser(source) {
    const iterable = stream(lines(source))
        .map(i => i.split(','));

    const headers = await iterable
        .slice(0, 1)
        .reduce(acc => acc);

    return stream(iterable)
        .slice(1)
        .map(line => {
            const item = {};
            for (let i = 0; i < headers.length; i++) {
                item[headers[i]] = line[i];
            }
            return item;
        });
}


