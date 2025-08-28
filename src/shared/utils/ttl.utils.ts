const multipliers = {
	s: 1000,
	m: 1000 * 60,
	h: 1000 * 60 * 60,
	d: 1000 * 60 * 60 * 24,
} as const;

type TimeUnit = keyof typeof multipliers;

export function ttlToMs(value: string): number | null {
	const match = value.trim().match(/(?<num>\d+)(?<unit>[a-zA-Z]+)/);
	if (!match) return null;

	const {num, unit} = match.groups as {num: string; unit: TimeUnit};

	return parseInt(num, 10) * multipliers[unit];
}
