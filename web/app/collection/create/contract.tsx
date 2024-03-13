'use client';

import { forwardRef, Ref, useCallback, useImperativeHandle } from 'react';
import Link from 'next/link';
import { valibotResolver } from '@hookform/resolvers/valibot';
import { CalendarIcon } from '@radix-ui/react-icons';
import { PopoverTrigger } from '@radix-ui/react-popover';
import { format, subDays } from 'date-fns';
import { useForm } from 'react-hook-form';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

import { useCreateCollectionContext } from './context';
import { ConfigureContractData, ConfigureContractSchema, DataContract, ParentSubmitForm } from './schema';

const ContractContent = forwardRef((_props, ref: Ref<ParentSubmitForm>) => {
  const { setTab, configuration, setConfiguration } = useCreateCollectionContext();

  const form = useForm<ConfigureContractData>({
    resolver: valibotResolver(ConfigureContractSchema),
    defaultValues: configuration,
  });

  const { trigger, getValues } = form;

  // Want to use the async form instead of form.handleSubmit(onSuccess, onError) because the callbacks
  // are not as easy to work with in this case where we just want to know if validation failed
  const handleSubmit = useCallback(async () => {
    const isValid = await trigger();
    if (isValid) {
      setConfiguration(form.getValues());
    }

    return isValid;
  }, [trigger, getValues, setConfiguration]);

  useImperativeHandle(ref, () => ({ handleSubmit }));

  const onSubmit = useCallback((values: ConfigureContractData) => setConfiguration(values), [setConfiguration]);

  return (
    <Card>
      <ContractHeader />
      <CardContent>
        <Form {...form}>
          <form id="create-collection-configure" className="flex flex-col gap-4" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="contract"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data Contract</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a contract to declare how NFTs data can change after mint" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={DataContract.Immutable}>Static</SelectItem>
                      <SelectItem value={DataContract.Evolvable}>Permissive Evolution</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    The <span className="font-bold">Static</span> contract enforces data associated with the NFT cannot
                    change. The <span className="font-bold">Permissive Evolution</span> contract allows you to change
                    any data of an NFT after minting. It is most common for NFTs to have static data. There are other
                    possible approaches to evolving NFTs over time that are not yet supported. You can read more about
                    these metadata rules and other evolution appraches{' '}
                    <Link className="font-bold" href="/" target="_blank">
                      here
                    </Link>
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="window"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Minting Window</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={'outline'}
                          className={cn(
                            'w-[240px] pl-3 text-left font-normal',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          {field.value?.from ? (
                            field.value.to ? (
                              <>
                                {format(field.value.from, 'LLL dd, y')} - {format(field.value.to, 'LLL dd, y')}
                              </>
                            ) : (
                              format(field.value.from, 'LLL dd, y')
                            )
                          ) : (
                            <span>Optional</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="flex w-auto flex-col p-0" align="start">
                      <Calendar
                        mode="range"
                        fromMonth={new Date()}
                        numberOfMonths={2}
                        defaultMonth={field.value?.from}
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < subDays(new Date(), 1)}
                        initialFocus
                      />

                      <Button
                        type="reset"
                        variant="outline"
                        className="m-2"
                        onClick={() => form.reset({ window: undefined })}
                      >
                        Clear Selection
                      </Button>
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    The window of time where minting tokens for this collection is valid.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="maxTokens"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Max Tokens</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Optional"
                      type="number"
                      {...field}
                      onChange={(event) => {
                        const value = Number(event.target.value);
                        if (value === 0) {
                          field.onChange(undefined);
                        } else if (!Number.isNaN(value)) {
                          field.onChange(value);
                        }
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    The maximum number of NFTs that will be created under this collection.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="group"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Collection Group Policy Id</FormLabel>
                  <FormControl>
                    <Input placeholder="Optional" {...field} />
                  </FormControl>
                  <FormDescription>
                    A collection group can be used to verify multiple collections are created by the same creator. This
                    is done by each collection referencing the group to which it belongs. The collection group also must
                    be updated with the policy id of this new collection to completley prove the collection is in the
                    group. If you don't have a collection group and would like one then you can{' '}
                    <Link className="font-bold" target="_blank" href="/">
                      {/* TODO: Rather than making them exit the flow let them check a box indicating they want to make a group policy as well.  Also, I need to actually write the contract for group policy */}
                      create a collection group by clicking here
                    </Link>
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => setTab('describe')}>
          Previous
        </Button>

        <Button type="submit" form="create-collection-configure">
          Next
        </Button>
      </CardFooter>
    </Card>
  );
});

function ContractHeader() {
  return (
    <CardHeader>
      <CardTitle className="font-heading pb-2">Configure your contracts</CardTitle>
      <div className="font-heading">
        Contracts provide a way to guarantee some properties of your collection to your token holders.{' '}
        <Tooltip>
          <TooltipTrigger>
            <span className="font-bold">Minting Contracts</span>
          </TooltipTrigger>
          <TooltipContent className="bg-secondary text-foreground shadow-foreground/10 shadow-md">
            <div className="max-w-72 p-2">
              Minting contracts refer to a smart contract that implements a minting policy. There are four types of
              smart contracts though most NFT collections only deal with minting and spending contracts.
            </div>
          </TooltipContent>
        </Tooltip>{' '}
        constrain the creation of tokens while{' '}
        <Tooltip>
          <TooltipTrigger>
            <span className="font-bold">data contracts</span>
          </TooltipTrigger>
          <TooltipContent className="bg-secondary text-foreground shadow-foreground/10 shadow-md">
            <div className="max-w-72 p-2">
              The term data contracts is used for simplicity. The more technical definition is a spending validator
              contract which holds one or more reference assets along with datum associated with the user held NFT.
            </div>
          </TooltipContent>
        </Tooltip>{' '}
        constrain how the tokens data can be changed after minting. Common minting constraints include limiting the
        maximum NFTs or the time window when new NFTs can be minted. Metadata rules can be used to declare how the data
        on the NFTs in the collection will change over time. These rules are enforced by sending a token holding the
        data to a validator.
      </div>
    </CardHeader>
  );
}

export default ContractContent;
