import {fromReadable} from '@lorenzofox3/for-await-node';
import fs from 'fs';

// note: create a new stream on every asyncIterator invocation
export default (file, opts = {encoding: 'utf8'}) => ({
	[Symbol.asyncIterator]() {
		return fromReadable(fs.createReadStream(file, opts));
	}
});