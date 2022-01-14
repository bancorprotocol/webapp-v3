import { ComponentStory, ComponentMeta } from '@storybook/react';
import { withDesign } from 'storybook-addon-designs';
import { Ticker } from './Ticker';

export default {
  title: 'Components/Ticker',
  component: Ticker,
  decorators: [withDesign],
} as ComponentMeta<typeof Ticker>;

export const Tickerr: ComponentStory<typeof Ticker> = ({
  id,
  children,
  speedMs,
}) => {
  return (
    <section className="content-section pt-20 pb-10">
      <h2 className="ml-[20px] md:ml-[44px]">Ticker Component</h2>
      <hr className="content-separator my-14 mx-[20px] md:mx-[44px]" />
      <Ticker id={id} children={children} speedMs={speedMs} />
    </section>
  );
};

const children = (
  <div className="flex space-x-16 mt-10">
    {[...Array(20)].map((index) => (
      <div
        key={index}
        className="flex items-center justify-center min-w-[170px] h-[75px] rounded-[6px] bg-blue-0 dark:bg-blue-2 shadow-ticker hover:shadow-content dark:shadow-none transition-all duration-300"
      >
        {index}
      </div>
    ))}
  </div>
);

Tickerr.args = {
  id: 'ticker-id',
  children,
};

Tickerr.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/fwADI9wqDrRAdlMX8EddCw/Bancor-v3?node-id=7879%3A257081',
  },
};
