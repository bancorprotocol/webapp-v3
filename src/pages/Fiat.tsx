import { DepositMethods, FiatBox, Operations } from 'elements/fiat/FiatBox';
import moonPayLogo from 'assets/logos/moonpay.svg';

const fiats = [
  {
    name: 'MoonPay',
    text: 'MoonPay is a financial technology company that builds payments infrastructure for crypto. Our on-and-off-ramp suite of products provides a seamless experience for converting between fiat currencies and cryptocurrencies using all major payment methods.',
    logo: moonPayLogo,
    operations: [Operations.fiatIn, Operations.fiatOut],
    depositMethods: [
      DepositMethods.wire,
      DepositMethods.creditCard,
      DepositMethods.debitCard,
      DepositMethods.samsumgPay,
      DepositMethods.googlePay,
      DepositMethods.applePay,
    ],
    buyUrl:
      'https://buy.moonpay.com/?apiKey=pk_live_qiJRayRj9iKRUWCfaWX5Vo6Sn0rnNsj&defaultCurrencyCode=ETH',
    sellUrl:
      'https://sell.moonpay.com/?apiKey=pk_live_qiJRayRj9iKRUWCfaWX5Vo6Sn0rnNsj&defaultCurrencyCode=ETH',
  },
];

export const Fiat = () => {
  return (
    <div className="grid">
      {fiats.map((fiat) => (
        <FiatBox key={fiat.name} fiat={fiat} />
      ))}
    </div>
  );
};
