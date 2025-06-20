const cosine = (a, b) => {
	let dot = 0,
		magA = 0,
		magB = 0;
	for (let i = 0; i < a.length; i++) {
		dot += a[i] * b[i];
		magA += a[i] ** 2;
		magB += b[i] ** 2;
	}
	return magA && magB ? dot / (Math.sqrt(magA) * Math.sqrt(magB)) : 0;
};

export default { cosine };
