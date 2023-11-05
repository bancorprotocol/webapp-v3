import { Children, ReactElement, cloneElement } from 'react';

export interface VoteCardDividedProps {
  children: ReactElement[];
}

export const VoteCardDivided: React.FC<VoteCardDividedProps> = ({
  children,
}) => {
  if (Children.count(children) !== 2) {
    console.error('VoteCardDivided component expects exactly two children.');
    return null; // Or render a fallback UI
  }

  // Extract children to an array for direct access
  const childrenArray = Children.toArray(children) as ReactElement[];

  // Append TailwindCSS classes to the first child's existing classes
  const firstChildClasses = childrenArray[0].props.className || '';
  const firstChildWithClasses = cloneElement(childrenArray[0], {
    className: `flex-1 lg:h-full lt-lg:w-full p-24 ${firstChildClasses}`.trim(),
  });

  // Append TailwindCSS classes to the second child's existing classes
  const secondChildClasses = childrenArray[1].props.className || '';
  const secondChildWithClasses = cloneElement(childrenArray[1], {
    className:
      `flex-none lg:h-full lg:w-[350px] lt-lg:w-full p-24 ${secondChildClasses}`.trim(),
  });

  return (
    <div
      className={`content-block flex flex-col lg:flex-row lg:col-span-2 items-center
      lg:min-h-[170px] lg:hover:shadow-lg lg:divide-x lt-lg:divide-y divide-silver dark:divide-grey`}
    >
      {firstChildWithClasses}
      {secondChildWithClasses}
    </div>
  );
};
