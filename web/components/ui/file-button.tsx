'use client';

import React, { useCallback, useRef } from 'react';
import { Slot } from '@radix-ui/react-slot';

import { cn } from '@/lib/utils';

import { Button, ButtonProps, buttonVariants } from './button';
import { InputProps } from './input';

export const FileButton = React.forwardRef<HTMLButtonElement, Omit<ButtonProps, 'onChange'> & InputProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const { onChange, onClick, ...rest } = props;
    const inputRef = useRef<HTMLInputElement>(null);

    const handleClick = useCallback(() => inputRef.current?.click(), [inputRef.current]);
    const Comp = asChild ? Slot : 'button';
    return (
      <>
        <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...rest} onClick={handleClick} />
        <input type="file" ref={inputRef} className="hidden" onChange={onChange} />
      </>
    );
  }
);

Button.displayName = 'FileButton';
