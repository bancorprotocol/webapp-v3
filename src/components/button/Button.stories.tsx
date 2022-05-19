import { ComponentMeta, ComponentStory } from '@storybook/react';
import { withDesign } from 'storybook-addon-designs';
import { Button, ButtonSize, ButtonVariant } from './Button';

export default {
  title: 'Components/Buttons',
  component: Button,
  decorators: [withDesign],
} as ComponentMeta<typeof Button>;

const options = [
  {
    label: 'DEFAULT',
    disabled: false,
  },
  {
    label: 'DISABLED',
    disabled: true,
  },
];

export const Variants: ComponentStory<typeof Button> = (args) => {
  const vars = Object.values(ButtonVariant).filter(
    (x) => !isNaN(Number(x))
  ) as ButtonVariant[];
  const sizes = Object.values(ButtonSize).filter(
    (x) => !isNaN(Number(x))
  ) as ButtonSize[];
  return (
    <div className="space-y-20">
      {vars.map((variant) => {
        return (
          <div key={variant} className="space-y-10">
            <h2 className="uppercase">{variant}</h2>
            {options.map((option) => (
              <div className="flex items-center space-x-20" key={option.label}>
                <div className="min-w-[120px]">{option.label}</div>
                {sizes.map((size) => {
                  return (
                    <Button
                      key={size}
                      {...args}
                      variant={variant}
                      size={size}
                      disabled={option.disabled}
                    >
                      Click me now
                    </Button>
                  );
                })}
              </div>
            ))}
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
  variant: ButtonVariant.Primary,
  size: ButtonSize.Meduim,
  disabled: false,
  className: '',
};

Playground.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/37rEn9Up8BK377t7KFQZ91/Bancor-Design-System?node-id=103%3A1425',
  },
};
