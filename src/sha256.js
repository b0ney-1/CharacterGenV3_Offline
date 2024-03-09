const Web3 = require('web3');
const BigNumber = require('bignumber.js');


const getSettings = (seed) => {
	let lastRand = { v: web3.utils.sha3(seed.toString()).slice(-64) };

	const settings = {
		lastRand,
	};

	layers.forEach((layer) => {
		if (layer !== 'line') {
			settings[layer] = rand(settings.lastRand, keyedInfo[layer]);
		}
	});

	return settings;
};

const getAttributes = (seed) => {
	const settings = getSettings(seed);
	const attributes = [];
	layers.forEach((layer) => {
		if (layer !== 'line') {
			const data = keyedInfo[layer][settings[layer]];
			if (data.name.length > 0) {
				attributes.push({
					trait: layer,
					value: data.name,
				});
			}
		}
	});
	return attributes;
};

const getRand = (lastRand, a = 0, b = 1) => {
	lastRand.v = web3.utils.sha3(lastRand.v).slice(-64);
	const rand = new BigNumber(lastRand.v, 16)
		.div(new BigNumber(2 ** 256))
		.toNumber();
	return a + (b - a) * rand;
};

const rand = (lastRand, info) => {
	const arr = info.map((e) => e.chance);
	const total = arr.reduce((a, v) => a + v);
	const r = getRand(lastRand, 0, total);
	let c = 0;
	let i = 0;
	for (; i < arr.length; i++) {
		c += arr[i];
		if (r < c) {
			break;
		}
	}
	return i;
};