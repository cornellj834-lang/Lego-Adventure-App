import React from 'react';
import * as LucideIcons from 'lucide-react';

interface IconHelperProps {
  name: string;
  size?: number;
  className?: string;
}

export const IconHelper: React.FC<IconHelperProps> = ({ name, size = 24, className }) => {
  // Use indexed access to get the specific icon component from the library
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const IconComponent = (LucideIcons as any)[name];

  if (!IconComponent) {
    // Return a default fallback icon if the name is not found
    return <LucideIcons.HelpCircle size={size} className={className} />;
  }

  return <IconComponent size={size} className={className} />;
};