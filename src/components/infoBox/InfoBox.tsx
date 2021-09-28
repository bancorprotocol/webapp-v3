interface Props {
  type?: 'info' | 'warning' | 'error';
  title?: string;
  children: JSX.Element | JSX.Element[];
}
export const InfoBox = ({ type, title, children }: Props) => {
  const styles = () => {
    switch (type) {
      case 'error':
        return 'bg-error-200';
      case 'warning':
        return 'bg-warning-200';
      default:
        return 'bg-blue-0 text-primary-dark';
    }
  };
  return (
    <div className={styles()}>
      {title && <h3 className="font-semibold">{title}</h3>}
      {children}
    </div>
  );
};
