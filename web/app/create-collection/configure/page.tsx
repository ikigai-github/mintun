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

import { ConfigureContractData, ConfigureContractSchema, useCreateCollectionContext } from '../context';

export default function Configure() {
  const { configuration, setConfiguration } = useCreateCollectionContext();
  const router = useRouter();

  const form = useForm<ConfigureContractData>({
    resolver: valibotResolver(ConfigureContractSchema),
    defaultValues: configuration,
  });

  function onSubmit(values: ConfigureContractData) {
    setConfiguration(values);
    router.push('/create-collection/images');
  }

  return (
    <Card className="w-full max-w-[1024px] p-4">
      <StepProgress step={2} numSteps={4} className="p-6" />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="grid grid-cols-1 gap-6"></CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => router.back()}>
              Back
            </Button>

            <Button type="submit">Next</Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
