'use client';

import { valibotResolver } from '@hookform/resolvers/valibot';
import { useForm } from 'react-hook-form';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

import { useCreateCollectionContext } from './context';
import { AddTraitData, AddTraitSchema } from './schema';

export default function TraitsContent() {
  const { traits, setTraits } = useCreateCollectionContext();

  const form = useForm<AddTraitData>({
    resolver: valibotResolver(AddTraitSchema),
    defaultValues: {
      trait: '',
    },
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
        <div className="font-heading font-bold">Collection Traits</div>
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
            <span className="font-base text-foreground/70 text-sm font-light italic">
              Click on a trait to remove it
            </span>
            <div className="mt-3 flex gap-2 rounded-xl border p-3">
              {traits.map((trait) => (
                <Badge
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
      <CardTitle className="pb-2">Why add traits</CardTitle>
      <CardDescription>
        <div>
          Sometimes collections include data for each NFT that describe its components. This data is interchangeably
          referred to as attributes, properties, or traits. As an example an NFT might have a background color trait
          that simply indicates the background color used for the image. This helps marketplaces to more easily extract
          data about your collection.
        </div>
        <br />
        <div>
          For example, if you have different background colors you could add a <Badge>Background</Badge> trait. Trait
          values are assigned when you draft tokens after minting your collection. This is when you would set the
          backgroud value to something like <span className="text-md font-bold italic">red</span> or{' '}
          <span className="text-md font-bold italic">blue</span>
        </div>
        <br />
      </CardDescription>
    </CardHeader>
  );
}
