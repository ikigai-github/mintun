'use client';

import React, { useCallback, useMemo, useState } from 'react';
import { valibotResolver } from '@hookform/resolvers/valibot';
import { PlusIcon } from '@radix-ui/react-icons';
import { useForm } from 'react-hook-form';
import { useMediaQuery } from 'usehooks-ts';

import { DefaultImageDetail, ImageDetail } from '@/lib/image';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer';
import { Form, FormControl, FormDescription, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import ImageDropzone from '@/components/image-dropzone';

import { useManageCollectionContext } from './context';
import DraftTagContent from './draft-tag-content';
import DraftTraitContent from './draft-trait-content';
import { DraftTokenData, DraftTokenSchema } from './types';
import useSaveDraft from './use-save-draft';

type DraftNftProps = { key?: string };
type DraftNftFormProps = DraftNftProps & { onSaving: () => void; onSaved: () => void };

function DraftNftCard({ key }: DraftNftProps) {
  return (
    <Card className="hover:bg-foreground/10 group flex h-56 min-w-36 max-w-60 cursor-pointer flex-col transition-colors">
      <div className="bg-primary group-hover:bg-primary/90 flex h-44 items-center justify-center rounded-t-xl border-b">
        <PlusIcon className="text-primary-foreground size-24" />
      </div>
      <div className="flex-1 rounded-b-xl transition-colors">
        <div className="font-heading p-4 font-medium leading-none">Draft a new token</div>
      </div>
    </Card>
  );
}

function DraftNftCardForm({ key, onSaving, onSaved }: DraftNftFormProps) {
  const [status, setStatus] = useState<'edit' | 'saving'>('edit');
  const { info } = useManageCollectionContext();
  const { draft, saveDraft } = useSaveDraft(key);
  const form = useForm<DraftTokenData>({
    resolver: valibotResolver(DraftTokenSchema),
    defaultValues: draft,
  });

  const { setValue, clearErrors, watch } = form;

  const name = watch('name');
  const id = watch('id');
  const description = watch('description');
  const tags = watch('tags');
  const traits = watch('traits');

  const watches = useMemo(() => traits.map((_, index) => `traits.${index}.trait` as const), [traits]);
  const traitValues = watch(watches);
  const missingTraitValueCount = useMemo(
    () => traitValues.reduce((prev, next) => (Boolean(next) ? prev : prev + 1), 0),
    [traitValues]
  );

  const onImageChange = useCallback(
    (image?: ImageDetail) => {
      clearErrors('image.data');
      if (image) {
        setValue('image', image);
      } else {
        setValue('image', DefaultImageDetail);
      }
    },
    [setValue, clearErrors]
  );

  const onSubmit = useCallback(
    async (draft: DraftTokenData) => {
      onSaving();
      setStatus('saving');
      await saveDraft(draft);
      onSaved();
      setStatus('edit');
    },
    [onSaving, onSaved]
  );

  const onError = useCallback((error: any) => {
    console.log(error);
  }, []);

  const label = useMemo(() => {
    if (status === 'saving') {
      return 'Saving...';
    } else if (key) {
      return 'Save Draft';
    } else {
      return 'Create Draft';
    }
  }, [status]);

  return (
    <Form {...form}>
      <form className="flex flex-col gap-3 p-4" onSubmit={form.handleSubmit(onSubmit, onError)}>
        <FormField
          control={form.control}
          name="image.data"
          render={() => (
            <FormItem>
              <FormControl>
                <ImageDropzone
                  shapeClassName="w-full h-72 rounded-xl"
                  showClearButton={true}
                  clearClassName="justify-end"
                  containerClassName={'w-full col-start-1 row-start-1'}
                  onImageChange={onImageChange}
                  className="w-full object-cover"
                  dropMessage={
                    <div className="flex w-full items-center justify-center">Drop a file or click to add an Image</div>
                  }
                />
              </FormControl>
              <FormDescription className="px-2">
                You can use a high resolution image here. A thumbnail image will be generated as needed during minting
                of the token.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Accordion type="single" collapsible orientation="horizontal" defaultValue="name">
          <AccordionItem value="name">
            <AccordionTrigger className="max-w-[454px] gap-2">
              <span className="min-w-24 text-left font-light">Name</span>
              {name ? (
                <span className="font-heading flex-1 overflow-hidden truncate text-left font-bold">{name}</span>
              ) : undefined}
            </AccordionTrigger>
            <AccordionContent>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="px-2 py-1">
                    <FormDescription>
                      It is common for a collection of tokens to have the same name with an incrementing number for
                      uniqueness. If this field is blank the collection name followed by a sequence number will be used
                      for the name.
                    </FormDescription>
                    <FormControl>
                      <Input placeholder={`ex. ${info?.name ?? 'Example'} #12345`} maxLength={64} {...field} />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="id">
            <AccordionTrigger className="max-w-[454px] gap-2">
              <span className="min-w-24 text-left font-light">Identifier</span>
              {id ? (
                <span className="font-heading font-semi-bold flex-1 overflow-hidden truncate text-left">{id}</span>
              ) : undefined}
            </AccordionTrigger>
            <AccordionContent>
              <FormField
                control={form.control}
                name="id"
                render={({ field }) => (
                  <FormItem className="px-2 py-1">
                    <FormDescription>
                      An identifier can be used as way to uniquely link to to an external system. For example a database
                      could hold extra data about your token and you could use this id to reference that data. If you
                      leave the name field blank and set an id it will also be used as the name.
                    </FormDescription>
                    <FormControl>
                      <Input placeholder={`ex. abc123`} {...field} />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="description">
            <AccordionTrigger className="max-w-[454px] gap-2">
              <span className="min-w-24 text-left font-light">Description</span>
              {description ? (
                <span className="flex flex-1 overflow-hidden  ">
                  <span className="text-muted-foreground overflow-hidden truncate pr-2 text-left ">{description}</span>
                </span>
              ) : undefined}
            </AccordionTrigger>
            <AccordionContent>
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="px-2 py-1">
                    <FormDescription>
                      Usually a collection description is sufficient but it is sometimes desireable to add an token
                      specific description.
                    </FormDescription>
                    <FormControl>
                      <Input placeholder={`Optional`} {...field} />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="tags">
            <AccordionTrigger className="max-w-[454px] gap-2">
              <span className="min-w-24 text-left font-light">Tags</span>
              {tags.length ? (
                <span className="flex-1 text-left">
                  {tags.length} Tag{tags.length !== 1 ? 's' : undefined}
                </span>
              ) : undefined}
            </AccordionTrigger>
            <AccordionContent>
              <DraftTagContent />
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="traits">
            <AccordionTrigger className="max-w-[454px] gap-2">
              <span className="min-w-24 text-left font-light">Traits </span>
              {traits.length ? (
                <span className="flex-1 text-left">
                  {traits.length} Trait{traits.length !== 1 ? 's' : undefined}
                  {missingTraitValueCount ? (
                    <span className="text-destructive font-heading pl-2 text-xs">
                      ({missingTraitValueCount} Missing values)
                    </span>
                  ) : undefined}
                </span>
              ) : undefined}
            </AccordionTrigger>
            <AccordionContent>
              <DraftTraitContent />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        <Button disabled={missingTraitValueCount > 0} type="submit" className="mt-3">
          {label}
        </Button>
      </form>
    </Form>
  );
}

export default function DraftNft({ key }: DraftNftProps) {
  const [status, setStatus] = useState<'closed' | 'view' | 'saving'>('closed');

  const isDesktop = useMediaQuery('(min-width: 600px)', {
    defaultValue: true,
    initializeWithValue: false,
  });

  const closeDisabled = useMemo(() => status === 'saving', [status]);
  const handleSaving = useCallback(() => setStatus('saving'), [setStatus]);
  const handleSaved = useCallback(() => setStatus('closed'), [setStatus]);

  const handleOpen = useCallback(
    (open: boolean) => {
      console.log(open);
      console.log(status);
      if (open && status === 'closed') {
        setStatus('view');
      } else if (!open && status !== 'saving') {
        setStatus('closed');
      }
    },
    [status]
  );

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
      <Dialog open={status !== 'closed'} onOpenChange={handleOpen}>
        <DialogTrigger>
          <DraftNftCard key={key} />
        </DialogTrigger>
        <DialogContent
          className="p-4"
          onInteractOutside={handleClose}
          onEscapeKeyDown={handleClose}
          hideCloseIcon={closeDisabled}
        >
          <DraftNftCardForm key={key} onSaved={handleSaved} onSaving={handleSaving} />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={status !== 'closed'} onOpenChange={handleOpen}>
      <DrawerTrigger>
        <DraftNftCard key={key} />
      </DrawerTrigger>
      <DrawerContent onInteractOutside={handleClose} onEscapeKeyDown={handleClose} hideCloseIcon={closeDisabled}>
        <DraftNftCardForm key={key} onSaved={handleSaved} onSaving={handleSaving} />
      </DrawerContent>
    </Drawer>
  );
}
