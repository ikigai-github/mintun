import { PropsWithChildren } from 'react';

import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

export type StepMarkerProps = {
  className?: string | undefined;
  active?: boolean | undefined;
};

export type StepProgressProps = {
  className?: string | undefined;
  step: number;
  numSteps: number;
};

export function StepMarker(props: PropsWithChildren<StepMarkerProps>) {
  const focusClasses = props.active
    ? 'bg-primary text-primary-foreground size-7 min-h-7 min-w-7'
    : 'border-2 border-primary size-6 min-h-6 min-w-6';

  return (
    <span
      className={cn(
        'font-heading flex items-center justify-center rounded-full text-sm font-bold leading-none',
        focusClasses,
        props.className
      )}
    >
      {props.children}
    </span>
  );
}

export function StepProgress(props: StepProgressProps) {
  return (
    <div className={cn('flex items-center justify-center gap-2', props.className)}>
      {Array.from(Array(props.numSteps * 2)).map((_, key) => {
        const step = key / 2 + 1;
        if (key % 2 === 0) {
          return (
            <StepMarker active={step === props.step} key={key}>
              {step}
            </StepMarker>
          );
        } else {
          return <Separator className="w-10 flex-1 last:hidden" />;
        }
      })}
    </div>
  );
}
