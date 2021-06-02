export const classNameGenerator = (object: {[key: string]: unknown}): string => {
	return Object.entries(object).filter(([k, v]) => k && v).map(x => x[0]).join(' ')
}

export const sanitizeNumberInput = (input: string): string => {
	return input
		.replace(/[^\d.]/g, '')
		.replace(/\./, 'x')
		.replace(/\./g, '')
		.replace(/x/, '.')
}