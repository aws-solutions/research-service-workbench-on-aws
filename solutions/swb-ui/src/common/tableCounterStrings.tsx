export const getFilterCounterText = (count: number | undefined) =>
  `${count} ${count === 1 ? 'match' : 'matches'}`;
