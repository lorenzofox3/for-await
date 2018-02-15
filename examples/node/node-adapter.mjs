export default async function * (readable) {
	let exhausted = false;
	const onData = () => new Promise(resolve => {
		readable.once('readable', () => {
			resolve(readable.read());
		});
	});

	try {
		while (true) {
			const chunk = await onData();
			if (chunk === null) {
				exhausted = true;
				break;
			}
			yield chunk;
		}
	} finally {
		if (!exhausted) {
			readable.close();
		}
	}
};