import { Button } from 'components/button/Button';
import { PoolV3 } from 'services/observables/pools';
import { useState } from 'react';
import { ContractsApi } from 'services/web3/v3/contractsApi';
import { utils } from 'ethers';
import { useNavigation } from 'services/router';
import { useDispatch } from 'react-redux';
import { updatePortfolioData } from 'services/web3/v3/portfolio/helpers';
import { useAppSelector } from 'redux/index';
import { useApproveModal } from 'hooks/useApproveModal';
import ModalFullscreenV3 from 'components/modalFullscreen/modalFullscreenV3';

interface Props {
  pool: PoolV3;
}

export const DepositV3Modal = ({ pool }: Props) => {
  const account = useAppSelector((state) => state.user.account);
  const [isOpen, setIsOpen] = useState(false);
  const { pushPortfolio } = useNavigation();
  const dispatch = useDispatch();

  const deposit = async () => {
    if (!pool.reserveToken.balance || !account) {
      return;
    }
    try {
      const res = await ContractsApi.BancorNetwork.write.deposit(
        pool.pool_dlt_id,
        utils.parseUnits(pool.reserveToken.balance, pool.reserveToken.decimals)
      );
      console.log(res);
      setIsOpen(false);
      pushPortfolio();
      await updatePortfolioData(dispatch, account);
    } catch (e) {
      console.error(e);
    }
  };

  const [onStart, ApproveModal] = useApproveModal(
    [{ amount: pool.reserveToken.balance || '0', token: pool.reserveToken }],
    deposit,
    ContractsApi.BancorNetwork.contractAddress
  );

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Deposit</Button>
      <ModalFullscreenV3
        title={'Deposit'}
        setIsOpen={setIsOpen}
        isOpen={isOpen}
      >
        <div>
          <div>deposit {pool.name}</div>
          <div>{pool.reserveToken.balance}</div>
          <Button onClick={() => onStart()}>Deposit</Button>
          {ApproveModal}
        </div>
      </ModalFullscreenV3>
    </>
  );
};
