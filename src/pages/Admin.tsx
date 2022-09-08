import { AdminUseFork } from 'elements/admin/AdminUseFork';
import { AdminControls } from 'elements/admin/AdminControls';
import { isForkAvailable } from 'services/web3/config';
import { AdminFaucet } from 'elements/admin/AdminFaucet';
import { AdminTransfer } from 'elements/admin/AdminTransfer';
import { Page } from 'components/Page';
import { AdminUseMainnet } from 'elements/admin/AdminUseMainnet';
import { AdminPoolData } from 'elements/admin/AdminPoolData';
import { AdminStandardRewardsData } from 'elements/admin/AdminStandardRewardsData';
import { AdminStandardRewardsCreate } from 'elements/admin/AdminStandardRewardsCreate';

export const Admin = () => {
  return (
    <Page
      title={'Debug'}
      subtitle={'Admin tools for development and debugging.'}
    >
      <div className="space-y-20 text-center">
        <div className={'grid md:grid-cols-2 gap-20'}>
          <div className={'space-y-20'}>
            <div className={'content-block rounded p-20'}>
              <AdminUseMainnet />
            </div>
            <div className={'content-block rounded p-20'}>
              <AdminUseFork />
            </div>
            {isForkAvailable && (
              <div className={'content-block rounded p-20'}>
                <AdminControls />
              </div>
            )}
          </div>
          {isForkAvailable && (
            <div className={'space-y-20'}>
              <div className={'content-block rounded p-20'}>
                <AdminFaucet />
              </div>
              <div className={'content-block rounded p-20'}>
                <AdminTransfer />
              </div>
            </div>
          )}
        </div>

        <div className={'content-block rounded p-20'}>
          <AdminPoolData />
        </div>

        <div className={'content-block rounded p-20'}>
          <AdminStandardRewardsCreate />
        </div>

        <div className={'content-block rounded p-20'}>
          <AdminStandardRewardsData />
        </div>
      </div>
    </Page>
  );
};
