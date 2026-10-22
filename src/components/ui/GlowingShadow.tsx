import type { HTMLAttributes, ReactNode } from 'react';

interface GlowingShadowProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
}

export function GlowingShadow({ children, className = '', ...props }: GlowingShadowProps) {
  return <section className={`glowing-shadow ${className}`.trim()} {...props}>
    <span className="glowing-shadow__light" aria-hidden="true"/>
    <div className="glowing-shadow__content">{children}</div>
  </section>;
}
