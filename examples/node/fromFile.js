import {createReadStream} from 'fs';

// note: create a new stream on every asyncIterator invocation
export default (file, opts = {encoding: 'utf8'}) => {
    return ({
        [Symbol.asyncIterator]() {
            return createReadStream(file, opts)[Symbol.asyncIterator]();
        }
    });
}
