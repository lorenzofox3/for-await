import toAsync from './node-adapter.mjs';
import fs from 'fs';

// note: create a new stream on every asyncIterator invocation
export default (file, opts = {encoding: 'utf8'}) => ({
	[Symbol.asyncIterator]() {
		 return toAsync(fs.createReadStream(file, opts));
	}
});