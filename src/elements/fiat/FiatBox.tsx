import { ReactComponent as IconCheck } from 'assets/icons/check.svg';

export enum Operations {
  fiatIn,
  fiatOut,
}

export enum DepositMethods {
  wire = 'Wire Transfer',
  creditCard = 'Credit Card',
  debitCard = 'Debit Card',
  samsumgPay = 'Samsumg Pay',
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
}

export const FiatBox = ({ fiat }: { fiat: Fiat }) => {
  const fiatIn = fiat.operations.includes(Operations.fiatIn);
  const fiatOut = fiat.operations.includes(Operations.fiatOut);

  return (
    <div className="flex flex-col items-between bg-white dark:bg-blue-4 w-[550px] [h-360px] p-30 rounded-20 text-grey-4 dark:text-grey-0">
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
      <div className="flex justify-between items-center w-[288px] my-20">
        {fiatIn && (
          <a
            className="btn-primary rounded w-full w-[135px] h-[40px]"
            href={fiat.buyUrl}
            rel="noreferrer"
            target="_blank"
          >
            Buy
          </a>
        )}
        {fiatOut && (
          <a
            className="btn-primary rounded w-full w-[135px] h-[40px]"
            href={fiat.sellUrl}
            rel="noreferrer"
            target="_blank"
          >
            Sell
          </a>
        )}
      </div>
      <hr className="widget-separator" />
      <div className="flex">
        <div className="w-[120px]">Deposit Methods</div>
        <div className="grid grid-cols-3">
          {fiat.depositMethods.map((method) => (
            <div
              key={method}
              className="flex items-center mx-12 my-5 text-12 weight-medium"
            >
              <IconCheck className="w-14 h-14 p-2 bg-blue-0 rounded-full mr-5 dark:bg-blue-1" />
              {method}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
