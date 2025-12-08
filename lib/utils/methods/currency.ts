export const formatNumber = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatNumberWithCurrency = (
  amount: number,
  currency: string = 'INR',
  locale: string = 'en-IN'
) => {
  const _locale = locale || 'en-IN';
  const _currency = currency || 'INR';

  return new Intl.NumberFormat(_locale, {
    style: 'currency',
    currency: _currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};
