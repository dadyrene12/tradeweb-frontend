export const CURRENCY = 'FRW';

export const formatMoney = (value) =>
  `${CURRENCY} ${Math.round(Number(value) || 0).toLocaleString('en-US')}`;

export default formatMoney;
