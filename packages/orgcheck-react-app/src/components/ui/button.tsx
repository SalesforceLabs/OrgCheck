import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Slot } from 'radix-ui';

import { cn } from '../../lib/utils';

const buttonVariants = cva('slds-button', {
  variants: {
    variant: {
      default: 'slds-button_brand',
      outline: 'slds-button_outline-brand',
      secondary: 'slds-button_neutral',
      ghost: 'slds-button_neutral',
      destructive: 'slds-button_destructive',
      link: 'slds-button_reset',
    },
    size: {
      default: '',
      xs: 'slds-button_small',
      sm: 'slds-button_small',
      lg: '',
      icon: 'slds-button_icon slds-button_icon-border-filled',
      'icon-xs': 'slds-button_icon slds-button_icon-x-small slds-button_icon-border-filled',
      'icon-sm': 'slds-button_icon slds-button_icon-small slds-button_icon-border-filled',
      'icon-lg': 'slds-button_icon slds-button_icon-large slds-button_icon-border-filled',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'default',
  },
});

function Button({
  className,
  variant = 'default',
  size = 'default',
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot.Root : 'button';

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...(props as any)}
    />
  );
}

export { Button, buttonVariants };
