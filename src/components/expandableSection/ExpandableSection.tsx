import { useState } from 'react';

interface Props {
  className?: string;
  btnClassName?: string;
  initiallyExpanded?: boolean;
  renderButtonChildren: (isExpanded: boolean) => JSX.Element;
  children: JSX.Element;
}

export const ExpandableSection = ({
  className = 'p-10 mt-20 rounded bg-secondary mb-30',
  btnClassName = 'flex justify-between items-center px-20 h-[40px] w-full',
  initiallyExpanded = false,
  renderButtonChildren,
  children,
}: Props) => {
  const [expanded, setExpanded] = useState(initiallyExpanded);
  const toggle = () => setExpanded(!expanded);
  return (
    <div className={className}>
      <div onClick={toggle} className={`cursor-pointer ${btnClassName}`}>
        {renderButtonChildren(expanded)}
      </div>
      {expanded && children}
    </div>
  );
};
