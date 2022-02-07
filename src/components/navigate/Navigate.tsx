import { NavLink } from 'react-router-dom';

export const Navigate = ({ to, children }: { to: string; children: any }) => {
  const href = to.startsWith('http');
  return (
    <NavLink
      exact
      strict
      to={{ pathname: to }}
      target={href ? '_blank' : undefined}
      rel={href ? 'noopener' : undefined}
    >
      {children}
    </NavLink>
  );
};
