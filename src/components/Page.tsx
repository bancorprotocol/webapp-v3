interface Props {
  title?: string;
  subtitle?: string;
  children: JSX.Element[] | JSX.Element;
}

export const Page = ({ title, subtitle, children }: Props) => {
  return (
    <div className="page">
      {title && <h1>{title}</h1>}
      {subtitle && <p className="text-secondary my-30">{subtitle}</p>}
      {children}
    </div>
  );
};
