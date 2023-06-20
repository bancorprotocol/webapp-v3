import { DepositMethods, FiatBox, Operations } from 'elements/fiat/FiatBox';
import { ReactComponent as moonPayLogo } from 'assets/logos/moonpay.svg';
import { ReactComponent as rampLogo } from 'assets/logos/ramp.svg';
import { ReactComponent as mercuryoLogo } from 'assets/logos/mercuryo.svg';
import { ReactComponent as junoLogo } from 'assets/logos/juno.svg';
import { ReactComponent as transakLogo } from 'assets/logos/transak.svg';
import { ReactComponent as binanceLogo } from 'assets/logos/binance.svg';
import { ReactComponent as everestLogo } from 'assets/logos/everest.svg';
import { ReactComponent as IconInfo } from 'assets/icons/info.svg';
import { Page } from 'components/Page';

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
      DepositMethods.samsungPay,
      DepositMethods.googlePay,
      DepositMethods.applePay,
    ],
    buyUrl:
      'https://buy.moonpay.com/?apiKey=pk_live_qiJRayRj9iKRUWCfaWX5Vo6Sn0rnNsj&defaultCurrencyCode=ETH',
    sellUrl:
      'https://sell.moonpay.com/?apiKey=pk_live_qiJRayRj9iKRUWCfaWX5Vo6Sn0rnNsj&defaultCurrencyCode=ETH',
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
    smallGap: true,
    buyUrl: 'https://ramp.network/buy/',
  },
  {
    name: 'Mercuryo',
    text: 'Mercuryo is a cross-border payment network providing global access to fast and cheap money transfers. Working together with industry leaders, Mercuryo offers a multi-currency widget that allows purchasing and selling crypto securely with the lowest fees.',
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
  {
    name: 'Juno',
    text: 'Juno is a leading mobile banking platform that allows customers to manage cryptocurrency and traditional payment accounts in one easy-to-use app. Juno has the lowest fees, tightest spreads, and most innovative features, enabling you to buy, sell and spend your crypto.',
    logo: junoLogo,
    operations: [Operations.fiatIn],
    depositMethods: [
      DepositMethods.creditCard,
      DepositMethods.debitCard,
      DepositMethods.venmo,
      DepositMethods.cashApp,
    ],
    buyUrl:
      'https://juno.finance/partners/bancor?action=buy&currency=eth&partnerKey=live_th2t6ysuok4xu11gykm2p65e&name=bancor',
  },
  {
    name: 'Transak',
    text: 'Transak is as a global fiat-to-crypto payment gateway which doubles as a developer integration. We solve the important problem of helping mainstream users and businesses access crypto and the blockchain directly by integrating local regulatory compliance, payment methods, and liquidity from around the world. Transak is backed by Consensys, The LAO, Lunex, Koji Ventures, and IOSG.',
    logo: transakLogo,
    operations: [Operations.fiatIn],
    depositMethods: [
      DepositMethods.sepa,
      DepositMethods.applePay,
      DepositMethods.googlePay,
      DepositMethods.fasterBankTransfer,
      DepositMethods.upiBankTransfer,
      DepositMethods.mobikwikPayments,
      DepositMethods.visa,
      DepositMethods.mastercard,
      DepositMethods.americanExpress,
      DepositMethods.discover,
    ],
    buyUrl: 'https://global.transak.com/',
  },
  {
    name: 'Binance Connect',
    text: 'Binance Connect is Binance’s official fiat-to-crypto payments provider. It has been powering fiat-to-crypto on- and off-ramps, processing millions of transactions globally for Binance.com users. Binance Connect supports over 50 cryptocurrencies and major payment methods such as VISA, Mastercard, and more.',
    logo: binanceLogo,
    operations: [Operations.fiatIn, Operations.fiatOut],
    depositMethods: [
      DepositMethods.creditCard,
      DepositMethods.debitCard,
      DepositMethods.applePay,
    ],
    buyUrl: 'https://www.binancecnt.com/en/buy-sell-crypto/',
    sellUrl: 'https://www.binancecnt.com/en/buy-sell-crypto/',
  },
  {
    name: 'Everest',
    text: 'Everest is as a global fiat-to-crypto payment gateway and crypt-to-fiat service provider. We help new and returning visitors to easily access crypto. Use your Debit Card or Bank Account (SEPA) from nearly anywhere in the world.',
    logo: everestLogo,
    operations: [Operations.fiatIn, Operations.fiatOut],
    depositMethods: [
      DepositMethods.debitCard,
      DepositMethods.sepa,
      DepositMethods.sepaInstant,
    ],
    buyUrl:
      'https://kyc.everest.org/?appKey=zDhr57jc2XzCCMq',    
    sellUrl:
      'https://kyc.everest.org/sell?appKey=zDhr57jc2XzCCMq',  
  },

];

export const Fiat = () => {
  return (
    <Page title={'Fiat Gateway Providers'}>
      <div className="grid md:grid-cols-2 gap-40">
        <div className="mt-20 text-secondary">
          <p>Below is a list of popular fiat gateways.</p>
          <p>
            It can be used to buy or sell crypto with a credit card, bank
            transfer & more.
          </p>
        </div>
        <div className="bg-white shadow dark:shadow-none hover:shadow-lg dark:bg-charcoal px-20 py-16 rounded-20 text-12">
          <div className="flex items-center mb-8 text-16">
            <IconInfo className="w-15 h-15 mr-10" />
            Fiat Services
          </div>
          <div className="text-secondary">
            Fiat services on Bancor are provided by third-parties. Bancor is not
            associated with, responsible or liable for the performance of these
            third-party services. Any claims & questions should be addressed
            with the selected provider directly.
          </div>
        </div>
        {fiats.map((fiat) => (
          <FiatBox key={fiat.name} fiat={fiat} />
        ))}
      </div>
    </Page>
  );
};
