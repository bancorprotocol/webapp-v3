import { SecondarySubMenuItem } from 'elements/sidebar/menuSecondary/MenuSecondary';

export const MenuSecondaryItemSub = ({
  label,
  icon,
  to,
}: SecondarySubMenuItem) => {
  return (
    <a
      className="flex items-center text-14 hover:text-grey-3 transition duration-300"
      href={to}
      target="_blank"
      rel="noreferrer"
    >
      <div className="w-20 mr-20">{icon}</div>
      {label}
    </a>
  );
};
