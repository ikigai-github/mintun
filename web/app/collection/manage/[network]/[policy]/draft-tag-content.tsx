import { useCallback, useRef } from 'react';
import { useFieldArray, useFormContext, useFormState } from 'react-hook-form';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

import { DraftTokenData } from './types';

export default function DraftTagContent() {
  const inputRef = useRef<HTMLInputElement>(null);
  const { control } = useFormContext<DraftTokenData>();
  const { fields, append, remove } = useFieldArray<DraftTokenData, 'tags'>({ name: 'tags', control });

  const onAddTag = useCallback(
    (tag: string) => {
      const lowerCaseTag = tag.toLowerCase();
      if (!fields.map((field) => field.tag).includes(lowerCaseTag) && fields.length < 8) {
        append({ tag: lowerCaseTag });
      }
    },
    [append, fields]
  );

  return (
    <div className="flex flex-col gap-2 px-2 py-1">
      <FormDescription className="inline-flex w-full justify-between">
        Tags are optional. They can help indicate rarity of a particular token. Tags can also be used as filters by
        token search tools.
      </FormDescription>

      <div className="flex items-center gap-2">
        <Input placeholder="ex. Prismatic " maxLength={20} ref={inputRef} />
        <Button
          type="button"
          size="sm"
          onClick={() => {
            if (inputRef.current) {
              const tag = inputRef.current.value;
              if (tag) {
                onAddTag(tag);
                inputRef.current.value = '';
              }
            }
          }}
        >
          Add Tag
        </Button>
      </div>
      <div className="flex flex-wrap gap-1">
        {fields.map(({ tag, id }, index) => (
          <Badge
            key={id}
            className="dark:bg-secondary dark:text-foreground cursor-pointer capitalize"
            onClick={() => remove(index)}
          >
            {tag}
          </Badge>
        ))}
      </div>
    </div>
  );
}
