import { Button, ButtonSize } from 'components/button/Button';
import { ReactNode } from 'react';

export interface VoteCardProps {
  step: number;
  title: string;
  description: string;
  buttonText: string;
  onButtonClick: () => void;
  children?: ReactNode;
}

export const VoteCard = ({
  step,
  children,
  title,
  description,
  buttonText,
  onButtonClick,
}: VoteCardProps) => {
  return (
    <div className="content-block p-20">
      <div className="font-normal text-20">
        <span className="text-primary mr-16">Step {step}</span>
        {title}
      </div>

      <div className="py-10" />

      <p className="text-secondary min-h-[70px]">{description}</p>

      <div className="py-10" />

      <Button size={ButtonSize.Meduim} onClick={onButtonClick}>
        {buttonText}
      </Button>

      <div className="py-10" />

      <div>{children}</div>
    </div>
  );
};
