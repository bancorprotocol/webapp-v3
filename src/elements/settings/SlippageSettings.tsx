import { useDispatch } from 'react-redux';
import { setSlippageTolerance } from 'store/user/user';
import { useAppSelector } from 'store';
import { useState } from 'react';
import { sanitizeNumberInput } from 'utils/pureFunctions';

export const SlippageSettings = () => {
  const currentSlippage = useAppSelector(
    (state) => state.user.slippageTolerance
  );
  const slippages = [0.001, 0.005, 0.01];
  const [customSlippage, setCustomSlippage] = useState(
    slippages.includes(currentSlippage)
      ? ''
      : (currentSlippage * 100).toString()
  );

  const dispatch = useDispatch();

  const normalizedSlippage = Number(customSlippage) / 100;

  return (
    <div className="space-y-15 text-black-low dark:text-white-low">
      <div>Slippage Tolerance</div>
      <p className={'text-12'}>
        Your transaction will revert if the price changes unfavorably by more
        then this percentage.
      </p>
      <div className="flex justify-between space-x-6">
        {slippages.map((slippage) => (
          <button
            key={slippage}
            onClick={() => {
              dispatch(setSlippageTolerance(slippage));
              setCustomSlippage('');
            }}
            className={`w-full border text-black dark:text-white rounded-[6px] text-12 p-8 ${
              currentSlippage === slippage
                ? 'border-primary dark:border-primary'
                : 'border-silver dark:border-grey'
            }`}
          >
            +{slippage * 100}%
          </button>
        ))}
        <span
          className={`flex items-center border rounded-[6px] px-5 text-12 text-black dark:text-white ${
            currentSlippage === normalizedSlippage &&
            !slippages.includes(currentSlippage)
              ? 'border-primary dark:border-primary'
              : 'border-silver dark:border-grey'
          }`}
        >
          <input
            type="text"
            className={`w-[50px] border-none outline-none text-center ${
              currentSlippage === normalizedSlippage &&
              !slippages.includes(currentSlippage)
                ? 'bg-white dark:bg-black'
                : 'bg-white dark:bg-black'
            }`}
            value={customSlippage ? `${customSlippage}%` : ''}
            onKeyDown={(e) => {
              if (e.keyCode === 46 || e.keyCode === 8) {
                setCustomSlippage('');
                dispatch(setSlippageTolerance(Number(0.5) / 100));
              }
            }}
            onChange={(event) => {
              const sanitized = sanitizeNumberInput(event.target.value);
              if (sanitized === '') {
                setCustomSlippage(sanitized);
                dispatch(setSlippageTolerance(Number(0.5) / 100));
                return;
              }
              setCustomSlippage(sanitized);
              dispatch(setSlippageTolerance(Number(sanitized) / 100));
            }}
            placeholder="Custom"
          />
        </span>
      </div>
    </div>
  );
};
