export default async function * (readable) {
	let exhausted = false;
	const reader = readable.getReader();
	try {
		while (true) {
			const {value, done} = await reader.read();
			exhausted = done;
			if (done) {
				break;
			}
			yield value;
		}
	}
	finally {
			reader.cancel();
	}
}