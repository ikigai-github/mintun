'use client';

import React, { ReactNode, useCallback, useMemo, useState } from 'react';
import Image from 'next/image';
import { valibotResolver } from '@hookform/resolvers/valibot';
import { HobbyKnifeIcon, PlusIcon } from '@radix-ui/react-icons';
import { useForm } from 'react-hook-form';
import { uid as createUid } from 'uid';
import { useMediaQuery } from 'usehooks-ts';

import { DefaultImageDetail, getWebImageUrl, ImageDetail } from '@/lib/image';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Drawer, DrawerClose, DrawerContent, DrawerFooter, DrawerTrigger } from '@/components/ui/drawer';
import { Form, FormControl, FormDescription, FormField, FormItem } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import DrawerDialog from '@/components/drawer-dialog';
import ImageDropzone from '@/components/image-dropzone';

import { useManageCollectionContext } from './context';
import DraftTagContent from './draft-tag-content';
import DraftTraitContent from './draft-trait-content';
import { DraftTokenData, DraftTokenSchema } from './types';
import useDraft from './use-draft';
import useSaveDraft from './use-save-draft';

function DraftNewNftCard() {
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

function DraftNftCard({ uid }: { uid: string }) {
  const { image, id, name } = useDraft(uid);
  const { info } = useManageCollectionContext();

  const url = useMemo(() => {
    if (typeof image.data !== 'string') {
      return URL.createObjectURL(image.data);
    } else {
      return getWebImageUrl(image.data);
    }
  }, [image.data]);

  const displayName = useMemo(() => {
    if (name) {
      return name;
    } else if (id) {
      return id;
    } else if (info?.name) {
      return `${info.name} #TBA`;
    } else {
      return 'Generated on Mint';
    }
  }, [name, id, info?.name]);

  return (
    <Card className="hover:bg-foreground/10 h-56 min-w-36 max-w-60 transition-colors">
      <div className="relative h-44 rounded-t-xl">
        <Image fill={true} sizes="228px" src={url} className="rounded-t-xl object-cover" alt={name} />
      </div>
      <div className="flex justify-between p-4">
        <div className="font-heading truncate text-left leading-none">{displayName}</div>
        <HobbyKnifeIcon className="self-end" />
      </div>
    </Card>
  );
}

function DraftNftCardForm({ uid, onSaving, onSaved }: { uid: string; onSaving: () => void; onSaved: () => void }) {
  const [status, setStatus] = useState<'edit' | 'saving'>('edit');
  const { info } = useManageCollectionContext();
  const draft = useDraft(uid);
  const { saveDraft } = useSaveDraft(draft.uid);

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
    [onSaving, onSaved, saveDraft]
  );

  const onError = useCallback((error: any) => {
    console.log(error);
  }, []);

  const label = useMemo(() => {
    if (status === 'saving') {
      return 'Saving...';
    } else if (uid) {
      return 'Save Draft';
    } else {
      return 'Create Draft';
    }
  }, [status, uid]);

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
                  selectedImage={draft.image}
                  dropMessage={
                    <div className="flex w-full items-center justify-center">Drop a file or click to add an Image</div>
                  }
                />
              </FormControl>
              <FormDescription className="px-2">
                You can use a high resolution image here. A thumbnail image will be generated as needed during minting
                of the token.
              </FormDescription>
            </FormItem>
          )}
        />
        <Accordion type="single" collapsible orientation="horizontal" defaultValue="name">
          <AccordionItem value="name">
            <AccordionTrigger className="gap-2">
              <span className="w-24 min-w-24 max-w-24 text-left font-light">Name</span>
              {name ? (
                <span className="font-heading max-w-[300px] overflow-hidden truncate text-left font-bold">{name}</span>
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
                  </FormItem>
                )}
              />
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="id">
            <AccordionTrigger className="gap-2">
              <span className="w-24 min-w-24 max-w-24 text-left font-light">Identifier</span>
              {id ? (
                <span className="font-heading font-semi-bold max-w-[300px] overflow-hidden truncate text-left">
                  {id}
                </span>
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
                      <Input placeholder={`ex. abc123`} maxLength={64} {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="description">
            <AccordionTrigger className="gap-2">
              <span className="w-24 min-w-24 max-w-24 text-left font-light">Description</span>
              {description ? (
                <span className="text-muted-foreground font-heading font-semi-bold max-w-[300px] overflow-hidden truncate text-left ">
                  {description}
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
                      <Input placeholder={`Optional`} maxLength={64} {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="tags">
            <AccordionTrigger className="gap-2">
              <span className="min-w-24 text-left font-light">Tags</span>
              {tags.length ? (
                <>
                  <span className="flex-1 text-left">
                    {tags.length} Tag{tags.length !== 1 ? 's' : undefined}
                  </span>
                  <span className="text-muted-foreground text-xs">Max of 8 Tags</span>
                </>
              ) : undefined}
            </AccordionTrigger>
            <AccordionContent>
              <DraftTagContent />
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="traits">
            <AccordionTrigger className="gap-2">
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

export default function DraftNft(props: { uid?: string }) {
  const [status, setStatus] = useState<'closed' | 'view' | 'saving'>('closed');

  const uid = useMemo(() => props.uid || createUid(), [props.uid]);
  const closeDisabled = useMemo(() => status === 'saving', [status]);
  const handleSaving = useCallback(() => setStatus('saving'), [setStatus]);
  const handleSaved = useCallback(() => setStatus('closed'), [setStatus]);

  const handleOpen = useCallback(
    (open: boolean) => {
      if (open && status === 'closed') {
        setStatus('view');
      } else if (!open && status !== 'saving') {
        setStatus('closed');
      }
    },
    [status]
  );

  return (
    <DrawerDialog
      open={status !== 'closed'}
      onOpenChange={handleOpen}
      closeDisabled={closeDisabled}
      trigger={<button>{props.uid ? <DraftNftCard uid={props.uid} /> : <DraftNewNftCard />}</button>}
    >
      <DraftNftCardForm uid={uid} onSaved={handleSaved} onSaving={handleSaving} />
    </DrawerDialog>
  );
}
