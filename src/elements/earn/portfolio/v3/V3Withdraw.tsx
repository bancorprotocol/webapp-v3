import { TokenBalance } from 'components/tokenBalance/TokenBalance';
import { Button, ButtonSize, ButtonVariant } from 'components/button/Button';
import { ReactComponent as IconTimes } from 'assets/icons/times.svg';

const WithdrawAvailableItem = () => {
  return (
    <div className="flex justify-between items-center">
      <TokenBalance
        symbol={'ETH'}
        amount={'123'}
        usdPrice={'0.8'}
        imgUrl={''}
      />
      <div className="flex items-center space-x-14">
        <Button size={ButtonSize.EXTRASMALL} variant={ButtonVariant.SECONDARY}>
          Withdraw
        </Button>
        <button>
          <IconTimes className="w-10" />
        </button>
      </div>
    </div>
  );
};

export const V3Withdraw = () => {
  return (
    <section className="content-block p-14 space-y-20">
      <div>
        <h2 className="text-12 text-graphite font-normal mb-10">
          Available to withdraw
        </h2>
        <div className="space-y-10">
          <WithdrawAvailableItem />
          <WithdrawAvailableItem />
          <WithdrawAvailableItem />
        </div>
      </div>
      <hr className="opacity-20" />
      <div>
        <h2 className="text-12 text-graphite font-normal mb-10">
          Cooling down
        </h2>
        <div className="space-y-10">
          <WithdrawAvailableItem />
          <WithdrawAvailableItem />
          <WithdrawAvailableItem />
        </div>
      </div>
      <hr className="opacity-20" />
      <div>
        <h2 className="text-12 text-graphite font-normal mb-10">Reset</h2>
        <div className="space-y-10">
          <WithdrawAvailableItem />
          <WithdrawAvailableItem />
          <WithdrawAvailableItem />
        </div>
      </div>
    </section>
  );
};
