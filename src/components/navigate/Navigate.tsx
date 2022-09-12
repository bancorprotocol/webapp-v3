import { Link } from 'react-router-dom';

export const Navigate = ({
  to,
  children,
  className,
}: {
  to: string;
  children: any;
  className?: string;
}) => {
  const href = to.startsWith('http');
  return href ? (
    <a
      className={className}
      href={to}
      target="_blank"
      rel="noreferrer"
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </a>
  ) : (
    <Link className={className} to={{ pathname: to }}>
      {children}
    </Link>
  );
};
