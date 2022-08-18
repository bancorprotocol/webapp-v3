import { ExpandableSection } from 'components/expandableSection/ExpandableSection';
import { ReactComponent as IconChevron } from 'assets/icons/chevronRight.svg';
import { Button, ButtonSize, ButtonVariant } from 'components/button/Button';
import { Navigate } from '../../../../../components/navigate/Navigate';

const faq = [
  {
    q: 'What does it mean when a pool has a vault balance in deficit or surplus?',
    a: 'The vault balance represents the number of a specific token are currently in the protocol. The vault is in surplus when it contains more tokens than were directly supplied by liquidity providers. The vault is in deficit when it contains less tokens than liquidity providers deposited.',
  },
  {
    q: 'How does disabling the BNT distribution mechanism affect users?',
    a: 'Prior to the BNT distribution mechanism being disabled, liquidity providers who withdrew from a vault in deficit would have received BNT to protect against any loss they would otherwise have incurred from the vault deficit. As a result of the BNT distribution mechanism being disabled, users who withdraw while a vault is in deficit are not eligible to receive BNT and are therefore at risk of withdrawing fewer tokens.',
  },
];

export const DepositFAQ = () => {
  return (
    <div className={'bg-secondary p-30'}>
      <h2 className={'text-[22px] mb-10'}>FAQ</h2>

      <div className={'space-y-20'}>
        <p className={'text-secondary text-12'}>
          On June 19th, BNT distribution was disabled.
        </p>

        {faq.map(({ q, a }, i) => (
          <ExpandableSection
            key={i}
            className={'space-y-20'}
            btnClassName={'flex justify-between items-start'}
            renderButtonChildren={(expanded) => (
              <>
                <span className={'pr-20'}>{q}</span>
                <IconChevron
                  className={`w-20 h-20 flex-shrink-0 ${
                    expanded ? 'rotate-90' : ''
                  }`}
                />
              </>
            )}
          >
            <p className={'text-secondary text-12'}>{a}</p>
          </ExpandableSection>
        ))}

        <div>
          <Navigate
            to={
              'https://support.bancor.network/hc/en-us/articles/6352404707602-FAQ-Pause-of-BNT-Distribution'
            }
          >
            <Button variant={ButtonVariant.Secondary} size={ButtonSize.Small}>
              Learn more
            </Button>
          </Navigate>
        </div>
      </div>
    </div>
  );
};
