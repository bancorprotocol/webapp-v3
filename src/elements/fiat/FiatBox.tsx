import { ReactComponent as IconCheck } from 'assets/icons/check.svg';

export enum Operations {
  fiatIn,
  fiatOut,
}

export enum DepositMethods {
  wire = 'Wire Transfer',
  creditCard = 'Credit Card',
  debitCard = 'Debit Card',
  samsungPay = 'Samsung Pay',
  googlePay = 'Google Pay',
  applePay = 'Apple Pay',
  ideal = 'iDeal',
  interac = 'Interac',
  sepa = 'SEPA',
  openBanking = 'Open Banking',
  sepaInstant = 'SEPA Instant',
  fasterPayments = 'Faster Payments',
}

export interface Fiat {
  name: string;
  text: string;
  logo: React.FunctionComponent<
    React.SVGProps<SVGSVGElement> & {
      title?: string | undefined;
    }
  >;
  operations: Operations[];
  depositMethods: DepositMethods[];
  buyUrl?: string;
  sellUrl?: string;
  smallGap?: boolean;
}

export const FiatBox = ({ fiat }: { fiat: Fiat }) => {
  const fiatIn = fiat.operations.includes(Operations.fiatIn);
  const fiatOut = fiat.operations.includes(Operations.fiatOut);

  return (
    <div className="flex flex-col items-between bg-white dark:bg-blue-4 [h-360px] p-30 shadow hover:shadow-lg rounded-20 text-grey-4 dark:text-grey-0">
      <fiat.logo className="h-40 w-140 self-start text-black dark:text-white" />
      <div className="flex items-center my-20 font-medium">
        Available Operations
        {fiatIn && (
          <div className="text-10 text-white font-semibold bg-success-500 rounded-10 px-15 py-2 ml-10">
            Fiat in
          </div>
        )}
        {fiatOut && (
          <div className="text-10 text-white font-semibold bg-primary-light rounded-10 px-15 py-2 ml-10">
            Fiat Out
          </div>
        )}
      </div>
      {fiat.text}
      <div className="flex justify-between items-center my-20 max-w-[280px]">
        {fiatIn && (
          <a
            className="btn-primary rounded w-[135px] h-[40px]"
            href={fiat.buyUrl}
            rel="noreferrer"
            target="_blank"
          >
            Buy
          </a>
        )}
        {fiatOut && (
          <a
            className="btn-primary rounded w-[135px] h-[40px]"
            href={fiat.sellUrl}
            rel="noreferrer"
            target="_blank"
          >
            Sell
          </a>
        )}
      </div>
      <hr className="widget-separator" />
      <div className="flex align-top h-42 text-12 weight-medium">
        <div className="mr-12">Deposit Methods</div>
        <div
          className={`grid grid-cols-2 md:grid-cols-3 gap-y-10 gap-x-4 ${
            fiat.smallGap ? 'md:gap-x-[10px]' : 'md:gap-x-[30px]'
          }`}
        >
          {fiat.depositMethods.map((method) => (
            <div key={method} className="flex items-center">
              <IconCheck className="w-15 h-15 p-2 bg-blue-0 rounded-full mr-8 dark:bg-blue-1" />
              {method}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
