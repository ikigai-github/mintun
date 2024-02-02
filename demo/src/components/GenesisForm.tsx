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
  Output,
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
import { createSignal, For } from 'solid-js';

const ImageSchema = object({
  purpose: picklist(['Thumbnail', 'Banner', 'Avatar', 'Gallery', 'General']),
  url: string([url('Until I add uploading the image must be a url rather than a file')]),
});

type Image = Partial<Output<typeof ImageSchema>>;

// TBA: Let them pick the validator for the reference tokens for now it is just always the immutable validator
// TBA:
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

export function GenesisForm() {
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

  const handleSubmit: SubmitHandler<GenesisForm> = (values, event) => {
    // Runs on client
  };
  return (
    <div class='bg-base-300 p-4 m-4 rounded-box'>
      <h1 class='w-full flex items-center justify-center text-3xl font-logo text-secondary pb-8'>New Collection</h1>
      <Form onSubmit={handleSubmit} class='form-control'>
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

        <div class='py-6'>
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
        </div>
        <div class='divider'>Images</div>
        <div class='grid grid-cols-[1fr_2fr_64px] gap-4 items-end'>
          <For each={images()}>
            {(index) => (
              <>
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
                      onChange={() => console.log('chango')}
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
                      type='text'
                      placeholder='ipfs://'
                      value={field.value}
                      error={field.error}
                    />
                  )}
                </Field>

                <Button.Root class='btn btn-square' onClick={() => removeImage(index)}>
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
              </>
            )}
          </For>
        </div>

        <Button.Root class='btn my-6 min-w-48 self-center' onClick={addImage}>
          Add Another Image
        </Button.Root>

        <div class='divider'>Add Contract Constraints</div>
        <div class='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-6'>
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

        <Button.Root type='submit' class='btn btn-secondary mt-6 text-lg font-bold'>Create</Button.Root>
      </Form>
    </div>
  );
}
