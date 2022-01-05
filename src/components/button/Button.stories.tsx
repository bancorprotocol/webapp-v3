import { ComponentMeta, ComponentStory } from '@storybook/react';
import { withDesign } from 'storybook-addon-designs';
import { Button, ButtonSize, ButtonVariant } from './Button';

export default {
  title: 'Components/Buttons',
  component: Button,
  decorators: [withDesign],
} as ComponentMeta<typeof Button>;

export const Variants: ComponentStory<typeof Button> = (args) => {
  return (
    <div className="space-y-20">
      {Object.values(ButtonVariant).map((variant) => {
        return (
          <div key={variant} className="space-y-10">
            <h2 className="uppercase">{variant}</h2>
            <div className="flex items-center space-x-20">
              <div className="min-w-[120px]">DEFAULT</div>
              {Object.values(ButtonSize).map((size) => {
                return (
                  <Button key={size} {...args} variant={variant} size={size}>
                    Text
                  </Button>
                );
              })}
            </div>
            <div className="flex items-center space-x-20">
              <div className="min-w-[120px]">DISABLED</div>
              {Object.values(ButtonSize).map((size) => {
                return (
                  <Button
                    key={size}
                    {...args}
                    variant={variant}
                    size={size}
                    disabled
                  >
                    Text
                  </Button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

Variants.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/37rEn9Up8BK377t7KFQZ91/Bancor-Design-System?node-id=103%3A1425',
  },
};

export const Playground: ComponentStory<typeof Button> = (args) => (
  <Button {...args} />
);

Playground.args = {
  children: 'Primary Button',
  variant: ButtonVariant.PRIMARY,
  size: ButtonSize.MEDIUM,
  outlined: false,
  disabled: false,
  className: '',
};

Playground.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/37rEn9Up8BK377t7KFQZ91/Bancor-Design-System?node-id=103%3A1425',
  },
};
