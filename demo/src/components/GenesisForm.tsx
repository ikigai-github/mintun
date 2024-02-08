import {
  array,
  boolean,
  date,
  Input,
  maxLength,
  minLength,
  number,
  object,
  optional,
  picklist,
  regex,
  string,
  url,
} from 'valibot';
import { createForm, SubmitHandler } from '@modular-forms/solid';
import { Button } from '@kobalte/core';
import TextField from './TextField';
import DateField from './DateField';
import NumberField from './NumberField';
import Select from './Select';
import { createSignal, For, Show } from 'solid-js';
import { useWallet } from './WalletContext';

const ImageSchema = object({
  purpose: picklist(['Thumbnail', 'Banner', 'Avatar', 'Gallery', 'General']),
  url: string([url('Until I add uploading the image must be a url rather than a file')]),
});

// TBA: Let them pick the validator for the reference tokens for now it is just always the immutable validator
const GenesisSchema = object({
  // Names of things
  collection: string([
    minLength(3, 'The collection must have a name of at least 3 characters'),
    maxLength(64, 'Collection name cannot be more than 64 characters'),
  ]),
  artist: optional(string()),
  project: optional(string()),

  // Extra information
  description: optional(string()),
  images: array(ImageSchema),
  nsfw: boolean(),

  // Contract Constraints
  validFrom: optional(date()),
  validTo: optional(date()),
  maxTokens: number(),
  group: optional(
    string('Policy ID of group must be a 28 byte (56 character) hex string', [
      minLength(56),
      maxLength(56),
      regex(/[a-fA-F0-9]+/),
    ]),
  ),
  // TBA: Social media links
  // Could add Discord Invite (https://discord.gg/invite/leonardo-ai), Facebook, Reddit, Tiktok but just some samples for now
  // website: optional(string([url(), startsWith('https://')])),
  // x: optional(
  //   string([
  //     maxLength(15, 'An x handle is max length of 15 characters'),
  //     regex(/[a-zA-Z0-9_]+/, 'A twitter handle must be alphanumeric with no spaces'),
  //   ]),
  // ),
  // instagram: optional(
  //   string([
  //     maxLength(30, 'An instagram username is max of 30 characters'),
  //     regex(/[a-zA-z0-9_\.]+/, 'A Instagram username can only contain letters, numbers, periods, and underscores'),
  //   ]),
  // ),
});

type GenesisForm = Input<typeof GenesisSchema>;

// TODO: Add preview of the images and support uploading local files
// TODO: Add royalties configuration section
// TODO: Add Social links section
export function GenesisForm() {
  const { wallet } = useWallet();
  const [genesisForm, { Form, Field, FieldArray }] = createForm<GenesisForm>();
  const [images, setImages] = createSignal<number[]>([]);
  const [counter, setCounter] = createSignal(0);

  const removeImage = (index: number) => {
    const newImages = images().filter((arrayIndex) => arrayIndex !== index);
    setImages(newImages);
  };

  const addImage = () => {
    const count = counter();
    setCounter(count + 1);
    setImages([...images(), count]);
  };

  const handleSubmit: SubmitHandler<GenesisForm> = async (values, event) => {

    // throw an error?
  };

  return (
    <div class='bg-base-300 p-4 m-4 rounded-box'>
      <h1 class='w-full flex items-center justify-center text-3xl font-logo text-secondary pb-8'>New Collection</h1>
      <Form onSubmit={handleSubmit} class='form-control flex flex-col gap-6'>
        <div class='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
          <Field name='collection'>
            {(field, props) => (
              <TextField
                {...props}
                type='text'
                label='Collection Name'
                value={field.value}
                error={field.error}
                required
              />
            )}
          </Field>
          <Field name='artist'>
            {(field, props) => (
              <TextField
                {...props}
                type='text'
                placeholder='optional'
                label='Artist Name'
                value={field.value}
                error={field.error}
              />
            )}
          </Field>
          <Field name='project'>
            {(field, props) => (
              <TextField
                {...props}
                type='text'
                placeholder='optional'
                label='Project Name'
                value={field.value}
                error={field.error}
              />
            )}
          </Field>
        </div>

        <Field name='description'>
          {(field, props) => (
            <TextField
              {...props}
              type='text'
              placeholder='optional'
              multiline={true}
              label='Describe your collection'
              value={field.value}
              error={field.error}
            />
          )}
        </Field>

        <Show when={images().length > 0}>
          <div class='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            <For each={images()}>
              {(index) => (
                <div class='grid grid-cols-[64px_1fr] items-end bg-base-100 rounded-md'>
                  <Button.Root class='btn btn-square btn-ghost' onClick={() => removeImage(index)}>
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      class='h-6 w-6'
                      fill='none'
                      viewBox='0 0 24 24'
                      stroke='currentColor'
                    >
                      <path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M6 18L18 6M6 6l12 12' />
                    </svg>
                  </Button.Root>
                  <Field name={`images.${index}.purpose`}>
                    {(field, props) => (
                      <Select
                        {...props}
                        placeholder='Image Purpose'
                        options={[
                          { label: 'Thumbnail', value: 'Thumbnail' },
                          { label: 'Banner', value: 'Banner' },
                          { label: 'Avatar', value: 'Avatar' },
                          { label: 'Gallery', value: 'Gallery' },
                          { label: 'General', value: 'General' },
                        ]}
                        value={field.value}
                        error={field.error}
                        required
                      />
                    )}
                  </Field>
                  <Field name={`images.${index}.url`}>
                    {(field, props) => (
                      <TextField
                        {...props}
                        class='col-span-2 bg-base-200 border-t-2 border-slate-100/20'
                        type='text'
                        placeholder='Enter IPFS Url'
                        value={field.value}
                        error={field.error}
                      />
                    )}
                  </Field>
                </div>
              )}
            </For>
          </div>
        </Show>

        <Button.Root class='btn min-w-80' onClick={addImage}>
          Add an Image
        </Button.Root>

        <div class='divider'>Contract Constraints</div>
        <div class='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
          <Field name='maxTokens' type='number'>
            {(field, props) => (
              <NumberField
                {...props}
                label='Max Tokens'
                placeholder='optional'
                value={field.value}
                error={field.error}
              />
            )}
          </Field>
          <Field name='validFrom' type='Date'>
            {(field, props) => (
              <DateField
                {...props}
                placeholder='optional'
                label='Valid From'
                value={field.value}
                error={field.error}
              />
            )}
          </Field>

          <Field name='validTo' type='Date'>
            {(field, props) => (
              <DateField
                {...props}
                label='Valid To'
                value={field.value}
                error={field.error}
              />
            )}
          </Field>
        </div>

        <Button.Root type='submit' disabled={wallet.state !== 'ready'} class='btn btn-secondary mt-6 text-lg font-bold'>
          Create Collection
        </Button.Root>
      </Form>
    </div>
  );
}
