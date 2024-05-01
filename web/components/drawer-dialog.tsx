import { ReactNode, useCallback } from 'react';
import { useMediaQuery } from 'usehooks-ts';

import { Button } from './ui/button';
import { Dialog, DialogContent, DialogTrigger } from './ui/dialog';
import { Drawer, DrawerClose, DrawerContent, DrawerFooter, DrawerTrigger } from './ui/drawer';

// Fixme: The way this renders the child component is fully rerender when is swaps from dialog <-> drawer
//       This causes form data to be cleared which sucks.
export default function DrawerDialog({
  open,
  onOpenChange,
  closeDisabled,
  trigger,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  closeDisabled: boolean;
  trigger: ReactNode;
} & React.PropsWithChildren) {
  const isDesktop = useMediaQuery('(min-width: 768px)', {
    defaultValue: true,
    initializeWithValue: false,
  });

  const handleClose = useCallback(
    (e: Event) => {
      if (closeDisabled) {
        e.preventDefault();
      }
    },
    [closeDisabled]
  );

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogTrigger asChild>{trigger}</DialogTrigger>
        <DialogContent
          className="p-4"
          onInteractOutside={handleClose}
          onEscapeKeyDown={handleClose}
          hideCloseIcon={closeDisabled}
        >
          {children}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerTrigger asChild>{trigger}</DrawerTrigger>
      <DrawerContent onInteractOutside={handleClose} onEscapeKeyDown={handleClose}>
        {children}
        <DrawerFooter className="pt-0">
          <DrawerClose asChild disabled={closeDisabled}>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
