import { ComponentMeta, ComponentStory } from '@storybook/react';
import { withDesign } from 'storybook-addon-designs';

export default {
  title: 'DesignSystem/Typography',
  decorators: [withDesign],
} as ComponentMeta<any>;

export const Typography: ComponentStory<any> = () => {
  return (
    <div className="bg-white p-20 rounded shadow">
      <div className="overflow-x-scroll space-y-[50px] ">
        <h1>Typography</h1>

        <div>
          <h2 className="mb-20">Fonts</h2>
          <div className="grid grid-cols-2">
            <div>
              <h3 className="font-inter">Inter</h3>
              <h3 className="font-poppins">Poppins</h3>
            </div>
            <div>
              <h3 className="font-inter font-bold">Inter Font bold</h3>
              <h3 className="font-poppins font-bold">Poppins Font bold</h3>
            </div>
          </div>
        </div>

        <div>
          <h2 className="mb-20">Headlines</h2>
          <h1>H1 - Headline</h1>
          <h2>H2 - Headline Level 2</h2>
          <h3>H3 - Headline Level 3</h3>
          <h4>H4 - Headline Level 4</h4>
          <h5>H5 - Headline Level 5</h5>
          <h6>H6 - Headline Level 6</h6>
        </div>
      </div>
    </div>
  );
};

Typography.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/fwADI9wqDrRAdlMX8EddCw/Bancor-v3?node-id=7879%3A257081',
  },
};
