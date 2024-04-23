import React, { useCallback, useRef } from 'react';
import { Cross1Icon } from '@radix-ui/react-icons';
import { useFieldArray, useFormContext } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { FormControl, FormDescription, FormField, FormItem } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

import { DraftTokenData } from './types';

export default function DraftTraitContent() {
  const inputRef = useRef<HTMLInputElement>(null);
  const { control } = useFormContext<DraftTokenData>();
  const { fields, append, remove } = useFieldArray<DraftTokenData, 'traits'>({ name: 'traits', control });

  const onAddTraitLabel = useCallback(
    (label: string) => {
      const lowerCaseLabel = label.toLowerCase();
      if (!fields.map((field) => field.label).includes(lowerCaseLabel)) {
        append({ label: lowerCaseLabel, trait: '', preexisting: false });
      }
    },
    [append, fields]
  );

  return (
    <div className="flex flex-col gap-4 px-2 py-1">
      <FormDescription className="inline-flex w-full justify-between">
        Traits can give marketplaces a way to determine the rarity of a particular token in a collection. To this end
        you usually want all your tokens the have the same set of traits with different values. If you declared traits
        when creating your collection then this form requires you fill in those traits to draft the token.
      </FormDescription>

      <div className="flex items-center gap-2">
        <Input placeholder="Add a NFT specific trait (not recommended)" ref={inputRef} />
        <Button
          type="button"
          onClick={() => {
            if (inputRef.current) {
              const label = inputRef.current.value;
              if (label) {
                onAddTraitLabel(label);
                inputRef.current.value = '';
              }
            }
          }}
        >
          Add Trait
        </Button>
      </div>
      <div className="grid grid-cols-[auto_1fr_auto] items-center gap-2 px-2">
        {fields.map(({ label, trait, preexisting, id }, index) => {
          return (
            <React.Fragment key={id}>
              <div className="font-heading capitalize">{label}</div>
              <FormField
                control={control}
                name={`traits.${index}.trait` as const}
                render={({ field }) => (
                  <FormItem className={preexisting ? 'col-span-2' : ''}>
                    <FormControl>
                      <Input {...field} className="!bg-secondary" />
                    </FormControl>
                  </FormItem>
                )}
              />
              {preexisting ? undefined : (
                <Button onClick={() => remove(index)} size="icon">
                  <Cross1Icon />
                </Button>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
