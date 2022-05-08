import { Link } from 'react-router-dom';

export const Navigate = ({ to, children }: { to: string; children: any }) => {
  const href = to.startsWith('http');
  return (
    <Link
      to={{ pathname: to }}
      target={href ? '_blank' : undefined}
      rel={href ? 'noopener' : undefined}
    >
      {children}
    </Link>
  );
};
