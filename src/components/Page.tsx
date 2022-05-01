interface Props {
  title?: string;
  subtitle?: string;
  children: JSX.Element[] | JSX.Element;
  trailing?: JSX.Element;
}

export const Page = ({ title, subtitle, children, trailing }: Props) => {
  return (
    <div className="page">
      {title && <h1>{title}</h1>}
      {subtitle && (
        <p className="max-w-[700px] text-secondary my-30">
          {subtitle} {trailing}
        </p>
      )}
      {children}
    </div>
  );
};
