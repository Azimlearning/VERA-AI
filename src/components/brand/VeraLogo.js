// src/components/brand/VeraLogo.js
// Code-based VERA brand logo component with SVG icon
//
// NOTE: When displaying VERA text (not just the icon), use the gradient style:
// className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-500"
// This applies the brand gradient from teal-600 to emerald-500 for all VERA text.

'use client';

import { useRouter } from 'next/navigation';

const VeraIcon = ({ size = 18, className = '' }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path 
        d="M4 6L12 20L20 6H16L12 14L8 6H4Z" 
        fill="white" 
        stroke="white" 
        strokeWidth="1.5" 
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default function VeraLogo({ 
  size = 'medium', 
  showText = true, 
  variant = 'sidebar',
  onClick,
  className = ''
}) {
  const router = useRouter();
  
  // Size mappings - Square/rounded square icon
  const sizeMap = {
    small: { icon: 18, container: 'w-8 h-8', text: 'text-lg', rounded: 'rounded-[8px]' },
    medium: { icon: 20, container: 'w-10 h-10', text: 'text-2xl', rounded: 'rounded-[10px]' },
    large: { icon: 48, container: 'w-24 h-24', text: 'text-5xl', rounded: 'rounded-[24px]' }
  };
  
  const currentSize = sizeMap[size] || sizeMap.medium;
  
  // Variant-specific styling
  const variantStyles = {
    sidebar: {
      container: 'flex items-center gap-3',
      textColor: 'text-white',
      iconBg: '#009688' // Solid teal to match branding
    },
    hero: {
      container: 'flex items-center gap-3',
      textColor: 'text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-500', // Gradient branding
      iconBg: '#009688' // Solid teal to match branding
    },
    avatar: {
      container: 'flex items-center justify-center',
      textColor: 'text-white',
      iconBg: '#009688' // Solid teal to match branding
    }
  };
  
  const styles = variantStyles[variant] || variantStyles.sidebar;
  
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (variant === 'sidebar' || variant === 'hero') {
      router.push('/');
    }
  };
  
  const isClickable = onClick || (variant === 'sidebar' || variant === 'hero');
  
  const Component = isClickable ? 'button' : 'div';
  
  return (
    <Component
      onClick={isClickable ? handleClick : undefined}
      className={`${styles.container} ${className} ${isClickable ? 'cursor-pointer' : ''}`}
    >
      {/* Icon Container with Gradient */}
      <div 
        className={`${currentSize.container} ${currentSize.rounded} flex items-center justify-center shadow-sm`}
        style={{
          background: styles.iconBg
        }}
      >
        <VeraIcon size={currentSize.icon} />
      </div>
      
      {/* Text */}
      {showText && (
        <span className={`${currentSize.text} font-brand font-extrabold ${styles.textColor} tracking-tight`}>
          VERA
        </span>
      )}
    </Component>
  );
}

