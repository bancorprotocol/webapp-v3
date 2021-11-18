import { SecondaryMenuItem } from 'elements/sidebar/menuSecondary/MenuSecondary';
import { ReactComponent as IconChevron } from 'assets/icons/chevronRight.svg';
import { ReactComponent as IconLink } from 'assets/icons/link.svg';

export const MenuSecondaryItem = ({ label, icon, to }: SecondaryMenuItem) => {
  return (
    <div
      className="flex w-full items-center justify-between overflow-hidden"
      onClick={() => to && window.open(to, '_blank', 'noopener')}
    >
      <span className="flex items-center">
        <span className="ml-2 mr-20 w-20 h-20">{icon}</span>
        {label}
      </span>
      <span>
        {to && to.startsWith('http') ? (
          <IconLink className="w-14 ml-6" />
        ) : (
          <IconChevron className="w-16" />
        )}
      </span>
    </div>
  );
};
