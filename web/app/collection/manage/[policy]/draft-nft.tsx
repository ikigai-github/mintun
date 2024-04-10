'use client';

import { useCallback, useEffect, useRef } from 'react';
import { valibotResolver } from '@hookform/resolvers/valibot';
import type { CollectionInfo } from '@ikigai-github/mintun-offchain';
import { Cross1Icon, Cross2Icon, PlusIcon } from '@radix-ui/react-icons';
import { useFieldArray, useForm, useFormContext } from 'react-hook-form';
import { array, boolean, maxLength, minLength, object, record, string, union, Input as ValibotInput } from 'valibot';

import { DefaultImageDetail, ImageDetail, ImageDetailSchema } from '@/lib/image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import ImageDropzone from '@/components/image-dropzone';

export const CreateTokenSchema = object({
  thumbnail: ImageDetailSchema,
  image: ImageDetailSchema,
  name: string('Name can be at most 64 characters in length', [minLength(0), maxLength(64)]),
  id: string('Id must be less than 64 characters', [minLength(0), maxLength(64)]),
  traits: array(object({ name: string(), value: string(), preset: boolean() })),
  tags: array(object({ tag: string() })),
});

export type CreateTokenData = ValibotInput<typeof CreateTokenSchema>;

function DraftNftCard() {
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

function TagFields() {
  const inputRef = useRef<HTMLInputElement>(null);
  const { fields, append, remove } = useFieldArray<CreateTokenData, 'tags'>({ name: 'tags' });

  const onAddTag = useCallback(
    (tag: string) => {
      // TODO: Prevent duplicates
      if (tag) {
        append({ tag });
      }
    },
    [append]
  );

  return (
    <>
      <div className="flex gap-2">
        <Input placeholder="Optional" ref={inputRef} />
        <Button
          type="button"
          size="icon"
          onClick={() => {
            const tag = inputRef.current?.value;
            if (tag !== undefined) {
              onAddTag(tag);
            }
          }}
        >
          <PlusIcon />
        </Button>
      </div>

      {fields.length > 0 ? (
        <div className="flex gap-1">
          {fields.map((field, index) => (
            <Badge key={`${field.id}-badge}`} onClick={() => remove(index)} variant="secondary" className="capitalize">
              {field.tag}
            </Badge>
          ))}
        </div>
      ) : undefined}
    </>
  );
}

function TraitsField({ traits }: { traits?: string[] }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { fields, append, remove } = useFieldArray<CreateTokenData, 'traits'>({ name: 'traits' });

  useEffect(() => {
    if (traits && traits.length) {
      for (const trait of traits) {
        console.log(trait);
        append({ name: trait, value: '', preset: true });
      }
    }
  }, [append, traits]);

  const onAddTrait = useCallback(
    (trait: string) => {
      // TODO: Prevent duplicates
      if (trait) {
        append({ name: trait, value: '', preset: false });
      }
    },
    [append]
  );

  return (
    <>
      {fields.length > 0 ? (
        <div className="grid grid-cols-[auto_1fr_auto] flex-col items-center gap-2">
          {fields.map((field, index) => (
            <>
              <span key={`${field.id}-trait-name}`} className="font-heading text-sm">
                {field.name}
              </span>
              <Input key={`${field.id}-trait-value}`} {...field} />
              <Button size="icon" className="size-5" onClick={() => remove(index)}>
                <Cross2Icon />
              </Button>
            </>
          ))}
        </div>
      ) : undefined}

      <div className="flex gap-2">
        <Input placeholder="Optional" ref={inputRef} />
        <Button
          type="button"
          size="icon"
          onClick={() => {
            const trait = inputRef.current?.value;
            if (trait !== undefined) {
              onAddTrait(trait);
            }
          }}
        >
          <PlusIcon />
        </Button>
      </div>
    </>
  );
}

function DraftNftCardForm({ info }: { info: CollectionInfo }) {
  const form = useForm<CreateTokenData>({
    resolver: valibotResolver(CreateTokenSchema),
    defaultValues: {
      tags: [],
    },
  });

  const { setValue } = form;

  const onImageChange = useCallback(
    (image?: ImageDetail) => {
      if (image) {
        setValue('image', image);
      } else {
        setValue('image', DefaultImageDetail);
      }
    },
    [setValue]
  );

  const onSubmit = useCallback((draft: CreateTokenData) => {}, []);

  return (
    <Form {...form}>
      <form className="flex flex-col gap-3" onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="image"
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
              <FormDescription>
                You can use a high resolution image here. A thumbnail image will be generated as needed during minting
                of the NFT
              </FormDescription>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormDescription>
                It is common for a collection of tokens to have the same name with an incrementing number for
                uniqueness. If this field is blank the collection name followed by a sequence number will be used for
                the name.
              </FormDescription>
              <FormControl>
                <Input placeholder={`ex. ${info.name} #12345`} {...field} />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Identifier</FormLabel>
              <FormDescription>
                An identifier can be used as way to uniquely link to to an external system. For example a database could
                hold extra data about your token and you could use this id to reference that data. If you leave the name
                field blank and set an id it will also be used as the name.
              </FormDescription>
              <FormControl>
                <Input placeholder={`ex. abc123`} {...field} />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="tags"
          render={() => (
            <FormItem>
              <FormLabel>Tags</FormLabel>
              <FormDescription className="inline-flex w-full justify-between">
                Tags can serve a similar purpose to traits. They can also be used as filters by token search tools to
                help find particular tokens in your collection.
              </FormDescription>
              <FormControl>
                <TagFields />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="traits"
          render={() => (
            <FormItem>
              <FormLabel>Traits</FormLabel>
              <FormDescription className="inline-flex w-full justify-between">
                <span>Tags to add to the token</span>
              </FormDescription>
              <FormControl>
                <TraitsField traits={info.traits} />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}

export default function DraftNft(props: { info: CollectionInfo }) {
  return (
    <Dialog>
      <DialogTrigger>
        <DraftNftCard />
      </DialogTrigger>
      <DialogContent hideCloseIcon={true}>
        <DraftNftCardForm info={props.info} />
      </DialogContent>
    </Dialog>
  );
}
