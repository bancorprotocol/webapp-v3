import { DepositMethods, FiatBox, Operations } from 'elements/fiat/FiatBox';
import { ReactComponent as moonPayLogo } from 'assets/logos/moonpay.svg';
import { ReactComponent as banxaLogo } from 'assets/logos/banxa.svg';
import { ReactComponent as simplexLogo } from 'assets/logos/simplex.svg';
import { ReactComponent as rampLogo } from 'assets/logos/ramp.svg';
import { ReactComponent as mercuryoLogo } from 'assets/logos/mercuryo.svg';

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
  {
    name: 'Banxa',
    text: 'Banxa is a globally operating fiat-to-crypto on-ramp providing the easiest way for anyone looking to enter the digital asset ecosystem. Banxa users can choose from a variety of the most popular and convenient payment methods.',
    logo: banxaLogo,
    operations: [Operations.fiatIn],
    depositMethods: [
      DepositMethods.creditCard,
      DepositMethods.debitCard,
      DepositMethods.applePay,
      DepositMethods.ideal,
      DepositMethods.interac,
      DepositMethods.sepa,
    ],
    buyUrl: 'https://pay.banxa.com',
  },
  {
    name: 'Simplex',
    text: 'Simplex is the industry leader, providing global on/off ramps to the entire fiat to crypto ecosystem. Working with a vast network of partners, Simplex ensures that crypto is safe and accessible to all.',
    logo: simplexLogo,
    operations: [Operations.fiatIn, Operations.fiatOut],
    depositMethods: [
      DepositMethods.wire,
      DepositMethods.creditCard,
      DepositMethods.debitCard,
      DepositMethods.applePay,
    ],
    buyUrl: 'https://b.buy-crypto-with-simplex.com/?crypto=ETH',
    sellUrl:
      'https://www.simplex.com/account/sell?ref=b1990d7be52dfae9fa894a0d56317f28',
  },
  {
    name: 'Ramp',
    text: 'Ramp Network provides the ultimate crypto on-boarding flow. This globally accessible product focuses on excellent UX, supports multiple payment options and ensures lowest slippage and transactional fees.',
    logo: rampLogo,
    operations: [Operations.fiatIn],
    depositMethods: [
      DepositMethods.openBanking,
      DepositMethods.sepaInstant,
      DepositMethods.fasterPayments,
      DepositMethods.debitCard,
      DepositMethods.creditCard,
      DepositMethods.applePay,
    ],
    buyUrl:
      'https://buy.ramp.network/?hostApiKey=qg4s4spwnm7nahqdxfsjyzsjvtxbbzg8dxnxxrum&userAddress=0x5f7a009664b771e889751f4fd721adc439033ecd',
  },
  {
    name: 'Mercuryo',
    text: 'Mercuryo is a cross-boarder payment network providing global access to fast and cheap money transfers. Working together with industry leaders, Mercuryo offers a multi-currency widget that allows purchasing and selling crypto securely with the lowest fees.',
    logo: mercuryoLogo,
    operations: [Operations.fiatIn, Operations.fiatOut],
    depositMethods: [
      DepositMethods.creditCard,
      DepositMethods.debitCard,
      DepositMethods.applePay,
      DepositMethods.googlePay,
    ],
    buyUrl:
      'https://exchange.mercuryo.io/?widget_id=d7702dc1-c8ee-4726-a5be-5f18e31849b6&currency=ETH&type=buy',
    sellUrl:
      'https://exchange.mercuryo.io/?widget_id=d7702dc1-c8ee-4726-a5be-5f18e31849b6&currency=ETH&type=sell',
  },
];

export const Fiat = () => {
  return (
    <div className="grid grid-cols-2 gap-40">
      {fiats.map((fiat) => (
        <FiatBox key={fiat.name} fiat={fiat} />
      ))}
    </div>
  );
};
