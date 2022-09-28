interface Props {
  title?: string;
  subtitle?: string;
  children: JSX.Element[] | JSX.Element;
  trailingSubtitle?: JSX.Element;
  trailingTitle?: JSX.Element;
}

export const Page = ({
  title,
  subtitle,
  children,
  trailingSubtitle,
  trailingTitle,
}: Props) => {
  return (
    <div className="page">
      {title && (
        <div className="flex gap-10">
          <h1 className={'leading-10'}>{title}</h1>
          {trailingTitle}
        </div>
      )}
      {subtitle && (
        <p className="max-w-[700px] text-secondary my-30">
          {subtitle} {trailingSubtitle}
        </p>
      )}
      {children}
    </div>
  );
};
