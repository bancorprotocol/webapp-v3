import { ComponentMeta, ComponentStory } from '@storybook/react';
import { withDesign } from 'storybook-addon-designs';
import colors from 'styles/plugins/colors';

export default {
  title: 'DesignSystem/Colors',
  decorators: [withDesign],
} as ComponentMeta<any>;

export const Colors: ComponentStory<any> = () => {
  return (
    <div className="bg-white p-20 rounded shadow">
      <div className="overflow-x-scroll space-y-[50px] ">
        <h1>Colors</h1>
        {Object.keys(colors).map((color) => (
          <div key={color} className="flex space-x-10">
            <h2 className="min-w-[120px] uppercase">{color}</h2>
            {
              // @ts-ignore
              colors[color].DEFAULT ? (
                <div className="text-center">
                  <div
                    className="w-[80px] h-[50px] rounded-[6px] mb-6"
                    style={{
                      // @ts-ignore
                      backgroundColor: colors[color].DEFAULT,
                    }}
                  />
                  <div className="text-10 font-semibold">DEFAULT</div>
                  <div className="text-10 text-grey-4">
                    {
                      // @ts-ignore
                      colors[color].DEFAULT
                    }
                  </div>{' '}
                </div>
              ) : (
                <div className="w-[80px] h-[50px]" />
              )
            }

            {
              // @ts-ignore
              Object.keys(colors[color]).map((key) => {
                return (
                  key !== 'DEFAULT' && (
                    <div key={key} className="text-center">
                      <div
                        className="w-[80px] h-[50px] rounded-[6px] mb-6"
                        style={{
                          // @ts-ignore
                          backgroundColor: colors[color][key],
                        }}
                      />
                      <div className="text-10">{key}</div>
                      <div className="text-10">
                        {
                          // @ts-ignore
                          colors[color][key]
                        }
                      </div>
                    </div>
                  )
                );
              })
            }
          </div>
        ))}
      </div>
    </div>
  );
};

Colors.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/fwADI9wqDrRAdlMX8EddCw/Bancor-v3?node-id=7879%3A257081',
  },
};
