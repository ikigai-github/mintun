'use client';

import { useCallback } from 'react';
import { valibotResolver } from '@hookform/resolvers/valibot';
import { useForm } from 'react-hook-form';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

import { useCreateCollectionContext } from './context';
import { AddTraitData, AddTraitSchema } from './schema';

export default function TraitsContent() {
  const { traits, setTraits } = useCreateCollectionContext();

  const form = useForm<AddTraitData>({
    resolver: valibotResolver(AddTraitSchema),
  });

  function onSubmit({ trait }: AddTraitData) {
    const traitLower = trait.toLowerCase();
    if (traitLower && !traits.includes(traitLower)) {
      setTraits([...traits, traitLower]);
      form.reset({ trait: '' });
      form.setFocus('trait');
    }
  }

  return (
    <Card>
      <TraitsHeader />
      <CardContent className="flex flex-col gap-5">
        <Form {...form}>
          <form className="flex gap-4" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="trait"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input placeholder="Enter a trait name here" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Add Trait</Button>
          </form>
        </Form>

        {traits.length ? (
          <div>
            <div className="font-heading font-bold">
              Collection Traits
              <span className="font-base text-foreground/70 pl-2 text-sm font-light italic">
                click on a trait to remove it
              </span>
            </div>
            <div className="mt-3 flex gap-2 rounded-md border p-3">
              {traits.map((trait) => (
                <Badge
                  variant="secondary"
                  className="cursor-pointer capitalize"
                  onClick={() => setTraits(traits.filter((t) => t !== trait))}
                  key={trait}
                >
                  {trait}
                </Badge>
              ))}
            </div>
          </div>
        ) : undefined}
      </CardContent>
    </Card>
  );
}

function TraitsHeader() {
  return (
    <CardHeader>
      <CardTitle className="font-heading pb-2">Add some traits</CardTitle>
      <CardDescription>
        <div className="font-heading">
          Sometimes collections include data for each NFT that describes it's image or other attributes. This data is
          interchangeably referred to as attributes, properties, or traits. We will refer to them as traits. As an
          example an NFT might have a background color trait that simply indicates the background color used for the
          image.
        </div>
        <br />
        <div className="font-heading">
          Technically different sets of traits can be added to each NFT in a collection but generally every NFT inside a
          collection has the same set of traits with varying values for each trait. For example two NFTs might have the
          traits hat and shirt. But the hat and shirt of each NFT could be different. In other words, you can declare
          what traits every NFT in the collection will have at the collection level. This helps marketplaces to more
          easily extract data about your collection without inspecting each individual NFT.
        </div>
      </CardDescription>
    </CardHeader>
  );
}
