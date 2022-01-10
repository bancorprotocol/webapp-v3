export enum Currency {
  usd,
  euro,
  gbp,
}

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
