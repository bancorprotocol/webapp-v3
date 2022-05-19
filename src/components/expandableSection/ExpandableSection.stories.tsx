import { ComponentStory, ComponentMeta } from '@storybook/react';
import { ExpandableSection } from './ExpandableSection';
import { withDesign } from 'storybook-addon-designs';
import { ReactComponent as IconChevron } from 'assets/icons/chevronDown.svg';

export default {
  title: 'Components/ExpandableSection',
  component: ExpandableSection,
  decorators: [withDesign],
} as ComponentMeta<typeof ExpandableSection>;

const Template: ComponentStory<typeof ExpandableSection> = (args) => (
  <ExpandableSection {...args} />
);

export const Section = Template.bind({});

Section.args = {
  initiallyExpanded: true,
  renderButtonChildren: (isExpanded) => (
    <div>{isExpanded ? 'Hide' : 'Show'}</div>
  ),
  children: <div>{'TEXT CONTENT'}</div>,
};

export const StyledSection = Template.bind({});

StyledSection.args = {
  renderButtonChildren: (isExpanded) => (
    <>
      <div className="text-black dark:text-white">Explore Bonuses</div>
      <div className="flex items-center">
        {!isExpanded && <div>This is summary</div>}
        <IconChevron
          className={`w-14 ml-20 ${isExpanded ? 'transform rotate-180' : ''}`}
        />
      </div>
    </>
  ),
  children: <div>{'TEXT CONTENT'}</div>,
};

StyledSection.parameters = Section.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/fwADI9wqDrRAdlMX8EddCw/Bancor-v3?node-id=10644%3A318685',
  },
};
