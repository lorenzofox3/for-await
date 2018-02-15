console.log('id,foo,bar,bim');

const int = () => Math.floor(Math.random() * 10);

for (let i = 0; i<10000;i++){
	console.log(`${i},${int()},${int()},${int()}`);
}
