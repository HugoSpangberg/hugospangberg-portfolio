import type { CSSProperties } from 'react';
import type { BrandLogo as BrandLogoDefinition } from '../data/brandLogos';

type BrandLogoProps = {
  brand: BrandLogoDefinition;
  className?: string;
};

type BrandLogoStyle = CSSProperties & {
  '--brand-accent': string;
  '--brand-accent-rgb': string;
};

function BrandLogo({ brand, className }: BrandLogoProps) {
  const style: BrandLogoStyle = {
    '--brand-accent': brand.accent,
    '--brand-accent-rgb': brand.accentRgb,
  };

  const classes = [
    'brand-logo',
    `brand-logo--${brand.layout ?? 'wide'}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <span className={classes} style={style} aria-hidden="true">
      <img src={brand.src} alt="" loading="lazy" decoding="async" />
    </span>
  );
}

export default BrandLogo;
