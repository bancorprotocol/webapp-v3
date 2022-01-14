export enum Currency {
  usd,
  euro,
  gbp,
}

export const getConversionRate = (currency: Currency) => {
  if (currency === Currency.usd) return 1;
  return 0.5;
};

export const getCurrencySymbol = (currency: Currency) => {
  switch (currency) {
    case Currency.usd:
      return '$';
    case Currency.euro:
      return '€';
    case Currency.gbp:
      return '£';
  }
};

export const getCurrencyName = (currency: Currency) => {
  switch (currency) {
    case Currency.usd:
      return 'US Dollar';
    case Currency.euro:
      return 'Euro';
    case Currency.gbp:
      return 'British Pound';
  }
};
