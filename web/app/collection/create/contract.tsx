'use client';

import { forwardRef, Ref, useCallback, useImperativeHandle } from 'react';
import Link from 'next/link';
import { valibotResolver } from '@hookform/resolvers/valibot';
import { CalendarIcon } from '@radix-ui/react-icons';
import { PopoverTrigger } from '@radix-ui/react-popover';
import { format, subDays } from 'date-fns';
import { useForm } from 'react-hook-form';

import { cn, ONE_DAY_MS } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

import { useCreateCollectionContext } from './context';
import { ContractData, ContractSchema, DataContract, ParentSubmitForm } from './schema';

const ContractContent = forwardRef((_props, ref: Ref<ParentSubmitForm>) => {
  const { contract, setContract } = useCreateCollectionContext();

  const form = useForm<ContractData>({
    resolver: valibotResolver(ContractSchema),
    values: contract,
  });

  const { trigger, getValues } = form;

  // Want to use the async form instead of form.handleSubmit(onSuccess, onError) because the callbacks
  // are not as easy to work with in this case where we just want to know if validation failed
  const handleSubmit = useCallback(async () => {
    const isValid = await trigger();
    if (isValid) {
      setContract(getValues());
    }

    return isValid;
  }, [trigger, getValues, setContract]);

  useImperativeHandle(ref, () => ({ handleSubmit }));

  const onSubmit = useCallback((values: ContractData) => setContract(values), [setContract]);

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
                  <FormLabel>NFT Type</FormLabel>
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
                    The <span className="font-bold">Static</span> NFT cannot change.{' '}
                    <span className="font-bold">Permissive Evolution</span> allows you to change any data of an NFT
                    after minting. It is most common for NFTs to have static data.
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
                          <CalendarIcon className="ml-auto size-4 opacity-50" />
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
                        onSelect={(event) => {
                          if (event && !event?.to && event?.from) {
                            event.to = new Date(event.from.getTime() + ONE_DAY_MS * 2);
                          }
                          field.onChange(event);
                        }}
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
                    <Input placeholder="Optional" type="number" min={0} {...field} />
                  </FormControl>
                  <FormDescription>
                    The maximum number of NFTs that will be created under this collection.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </CardContent>
    </Card>
  );
});

function ContractHeader() {
  return (
    <CardHeader>
      <CardTitle className="pb-2">Configure your token rules</CardTitle>
      <CardDescription>Constraints on quantity and time add value to your collection.</CardDescription>
    </CardHeader>
  );
}

// function GroupPolicyItem() {
//   return (
//     <FormField
//       control={form.control}
//       name="group"
//       render={({ field }) => (
//         <FormItem>
//           <FormLabel>Collection Group Policy Id</FormLabel>
//           <FormControl>
//             <Input placeholder="Optional" {...field} />
//           </FormControl>
//           <FormDescription>
//             A collection group can be used to verify multiple collections are created by the same creator. This is done
//             by each collection referencing the group to which it belongs. The collection group also must be updated with
//             the policy id of this new collection to completley prove the collection is in the group. If you don&apos;t
//             have a collection group and would like one then you can{' '}
//             <Link className="font-bold" target="_blank" href="/">
//               {/* TODO: Rather than making them exit the flow let them check a box indicating they want to make a group policy as well.  Also, I need to actually write the contract for group policy */}
//               create a collection group by clicking here
//             </Link>
//           </FormDescription>
//           <FormMessage />
//         </FormItem>
//       )}
//     />
//   );
// }

ContractContent.displayName = 'ContractContent';

export default ContractContent;
