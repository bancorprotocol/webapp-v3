import { ReactComponent as IconSync } from 'assets/icons/dottedSync.svg';
import { ReactComponent as IconBancor } from 'assets/icons/bancorOutline.svg';
import { ReactComponent as IconProtect } from 'assets/icons/protectLight.svg';
import { Button } from 'components/button/Button';

const whatsNewList = [
  {
    icon: <IconSync />,
    title: 'Auto compounding rewards',
    description:
      'Intrest and rewards are automaticly reinvested, compounding your gains.',
  },
  {
    icon: <IconBancor />,
    title: 'BNT omnipool',
    description:
      'Deposit into a single BNT pool to earn instest and rewards across the entire network.',
  },
];

export const WhatsNew = () => {
  return (
    <section className="content-block p-20 p-40">
      <div className="text-2xl mb-10">What's new?</div>
      <span className="text-black-low">
        Bancor 3 was rebuilt from the ground up to help your earn more while
        doing less, with features like single hop trades, infinity pools, and so
        much more.
        <button className="ml-4 underline">Learn more</button>
      </span>
      <div className="flex flex-col gap-48 mt-40">
        {whatsNewList.map((item) => {
          return (
            <div className="flex gap-16" key={item.title}>
              <div className="text-primary w-[23px] h-[23px]">{item.icon}</div>
              <div>
                <div className="text-20">{item.title}</div>
                <div className="text-black-low">{item.description}</div>
              </div>
            </div>
          );
        })}
      </div>
      <Button className="mt-40 h-40 w-[217px]">
        Buy tokens to get started
      </Button>
    </section>
  );
};
