import { ComponentMeta, ComponentStory } from '@storybook/react';
import { withDesign } from 'storybook-addon-designs';
import { V3EarningsTableMenuContent } from 'elements/earn/portfolio/v3/earningsTable/menu/V3EarningTableMenuContent';

export default {
  title: 'Elements/V3/Portfolio/EarningsTable/Menu',
  component: V3EarningsTableMenuContent,
  decorators: [withDesign],
} as ComponentMeta<typeof V3EarningsTableMenuContent>;

export const Menu: ComponentStory<typeof V3EarningsTableMenuContent> = (
  args
) => {
  return (
    <div className="w-screen max-w-[300px]">
      <div className="overflow-hidden rounded bg-white p-20 border border-silver h-[280px]">
        <V3EarningsTableMenuContent {...args} />
      </div>
    </div>
  );
};

Menu.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/37rEn9Up8BK377t7KFQZ91/Bancor-Design-System?node-id=338%3A32981',
  },
};
