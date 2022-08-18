import { ReactComponent as WarningIcon } from 'assets/icons/warning.svg';
import { Button, ButtonSize, ButtonVariant } from 'components/button/Button';
import { Navigate } from 'components/navigate/Navigate';

type Props = {
  title: string;
  description: string;
  buttonText?: string;
  buttonHref?: string;
};

export const DisabledWarning = ({
  title,
  description,
  buttonHref,
  buttonText = 'Learn more',
}: Props) => {
  return (
    <div className="flex justify-center items-center h-screen">
      <div className="content-block rounded-40 p-20 pt-40 w-[400px] flex flex-col items-center text-center">
        <WarningIcon className="w-40 h-40 text-error" />
        <h1 className="mt-20 mb-10">{title}</h1>
        <p className="text-secondary mb-20">{description}</p>
        {!!buttonHref && (
          <Navigate to={buttonHref} className={'w-full mt-20'}>
            <Button variant={ButtonVariant.Tertiary} size={ButtonSize.Full}>
              {buttonText}
            </Button>
          </Navigate>
        )}
      </div>
    </div>
  );
};
