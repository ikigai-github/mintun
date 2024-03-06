'use client';

import { useRouter } from 'next/navigation';
import { valibotResolver } from '@hookform/resolvers/valibot';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { StepProgress } from '@/components/stepper';

import { DescribeCollectionData, DescribeCollectionSchema, useCreateCollectionContext } from '../context';

export default function Describe() {
  const { description, setDescription } = useCreateCollectionContext();
  const router = useRouter();

  const form = useForm<DescribeCollectionData>({
    resolver: valibotResolver(DescribeCollectionSchema),
    defaultValues: description,
  });

  function onSubmit(values: DescribeCollectionData) {
    setDescription(values);
    router.push('/create-collection/configure');
  }

  return (
    <Card className="w-full max-w-[1024px] p-4">
      <StepProgress step={1} numSteps={4} className="p-6" />
      <DescribeCollectionHeader />
      <Form {...form}>
        <form id="create-collection-describe-form" onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="grid grid-cols-1 gap-6">
            <FormField
              control={form.control}
              name="collection"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Collection Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Required" {...field} />
                  </FormControl>
                  <FormDescription>
                    The primary name associated with the collection. If this is a small collection of many collections
                    sometimes the artist or project name can be a good choice.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="artist"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Artist Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Optional" {...field} />
                  </FormControl>
                  <FormDescription>
                    The name of the artist that created the collection. Feel free to leave this blank if you don't want
                    to associate an artist with the collection for any reason.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="project"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Optional" {...field} />
                  </FormControl>
                  <FormDescription>
                    A project can be the team or group that made the collection. It usually spans more than one
                    collection or has some evolution over time.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="nsfw"
              render={({ field }) => (
                <FormItem>
                  <div className="flex h-fit flex-row items-start space-x-3 space-y-0 self-center">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel>Not safe for work</FormLabel>
                  </div>
                  <FormDescription>
                    This optional flag lets markets and tools know some assets in your collection may not be safe for
                    viewing at work.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="">
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Optional" {...field} />
                  </FormControl>
                  <FormDescription>
                    A brief description of the collection might include the collection purpose, backstory, or utility of
                    the collection.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </form>
      </Form>
      <CardFooter className="flex justify-end">
        <Button type="submit" form="create-collection-describe-form">
          Next
        </Button>
      </CardFooter>
    </Card>
  );
}

function DescribeCollectionHeader() {
  return (
    <CardHeader>
      <CardTitle className="font-heading pb-2">Describe your collection</CardTitle>
      <div className="font-heading">
        A collection is one or more NFTs (non-fungible tokens) minted under the same{' '}
        <Tooltip>
          <TooltipTrigger>
            <span className="font-bold">policy id</span>
          </TooltipTrigger>
          <TooltipContent className="bg-secondary text-foreground shadow-foreground/10 shadow-md">
            <div className="max-w-72 p-2">
              A policy id is a unique cryptographic fingerprint or hash generated from the minting script. It serves as
              a way to uniquely identify the minting script that created the token.
            </div>
          </TooltipContent>
        </Tooltip>
        . Below you can fill out some basic information that markets and other tools can use for displaying information
        about your collection.
      </div>
    </CardHeader>
  );
}
