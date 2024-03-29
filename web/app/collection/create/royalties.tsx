'use client';

import { useCallback, useState } from 'react';
import { valibotResolver } from '@hookform/resolvers/valibot';
import { useForm } from 'react-hook-form';

import { useWallet } from '@/lib/wallet';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
  FormRootMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

import { useCreateCollectionContext } from './context';
import { RoyaltyData, RoyaltySchema } from './schema';

export default function RoyaltiesContent() {
  const { royalties, setRoyalties } = useCreateCollectionContext();
  const [total, setTotal] = useState(0);
  const { changeAddress } = useWallet();

  const form = useForm<RoyaltyData>({
    resolver: valibotResolver(RoyaltySchema),
    defaultValues: {
      address: '',
      percent: '',
      minFee: '',
      maxFee: '',
    },
  });

  const { setFocus, setValue, setError, reset } = form;

  const onSubmit = useCallback(
    (royalty: RoyaltyData) => {
      const address = royalty.address.toLowerCase();
      const royaltyIndex = royalties.findIndex((royalty) => royalty.address === address);
      const newTotal =
        royaltyIndex >= 0
          ? total - Number(royalties[royaltyIndex].percent) + Number(royalty.percent)
          : total + Number(royalty.percent);

      if (newTotal > 100) {
        setError('root', {
          message: 'Total beneficiary percent cannot exceed 100%',
        });
        return;
      }

      const newRoyalties = [...royalties];
      const newRoyalty = { ...royalty, address };
      if (royaltyIndex >= 0) {
        newRoyalties.splice(royaltyIndex, 1, newRoyalty);
      } else {
        newRoyalties.push(newRoyalty);
      }

      setRoyalties(newRoyalties);
      setTotal(newTotal);
      reset({ address: '', percent: undefined, minFee: undefined, maxFee: undefined });
      setFocus('address');
    },
    [setTotal, setRoyalties, royalties, setFocus, setError, reset, total]
  );

  return (
    <Card>
      <RoyaltiesHeader />
      <CardContent className="flex flex-col gap-5">
        <Form {...form}>
          <form className="flex flex-col gap-3" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input placeholder="Required" {...field} />
                  </FormControl>
                  <FormDescription className="inline-flex w-full justify-between">
                    <span>The address of the royalty beneficiary.</span>
                    {changeAddress ? (
                      <span>
                        <Button
                          type="button"
                          variant="link"
                          onClick={() => {
                            setValue('address', changeAddress);
                            setFocus('percent');
                          }}
                          className="h-fit py-0 pl-4 text-[0.8rem]"
                        >
                          Click here to use connected wallet address
                        </Button>
                      </span>
                    ) : undefined}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="percent"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input type="number" min={0} max={100} placeholder="Required" {...field} />
                  </FormControl>
                  <FormDescription>
                    A number between 0 and 100 representing the percent of a sale that should go to the beneficiary.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="minFee"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input type="number" min={0} placeholder="Optional Minimum Fee Ada" {...field} />
                  </FormControl>
                  <FormDescription>
                    An optional minimum fee that will be paid to the beneficiary on sale of any NFT in the collection.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="maxFee"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input type="number" min={0} placeholder="Optional Maximum Fee Ada" {...field} />
                  </FormControl>
                  <FormDescription>
                    An optional maximum fee that will be paid to the beneficiary on sale of any NFT in the collection.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Add Royalty</Button>
            <FormRootMessage className="text-center" />
          </form>
        </Form>

        {royalties.length ? (
          <div>
            <div className="font-heading pl-2 font-bold">
              Royalties
              <span className="font-base text-foreground/70 pl-2 text-sm font-light italic">
                click on a royalty row to remove it
              </span>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Address</TableHead>
                  <TableHead className="text-center">Percent Fee</TableHead>
                  <TableHead className="text-center">Minimum Fee</TableHead>
                  <TableHead className="text-center">Maximum Fee</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {royalties.map((royalty, index) => (
                  <Tooltip key={`royalty-address-review-${royalty.address}`}>
                    <TooltipTrigger asChild>
                      <TableRow
                        className="font-heading cursor-pointer text-[0.8rem] font-light"
                        onClick={() => {
                          console.log('removin index ' + index);
                          setTotal((prev) => prev - Number(royalties[index].percent));
                          const newRoyalties = [...royalties];
                          newRoyalties.splice(index, 1);
                          setRoyalties(newRoyalties);
                        }}
                        key={`royalty-address-reveiew-${royalty.address}`}
                      >
                        <TableCell className="max-w-64 truncate">{royalty.address}</TableCell>
                        <TableCell className="text-center">{royalty.percent + '%'}</TableCell>
                        <TableCell className="text-center">{royalty.minFee ? royalty.minFee + ' ₳' : '-'}</TableCell>
                        <TableCell className="text-center">{royalty.maxFee ? royalty.maxFee + ' ₳' : '-'}</TableCell>
                      </TableRow>
                    </TooltipTrigger>
                    <TooltipContent
                      align="start"
                      className="bg-accent text-foreground shadow-foreground/10 whitespace-normal text-xs shadow-md"
                    >
                      <span className="p-2">{royalty.address}</span>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : undefined}
      </CardContent>
    </Card>
  );
}

function RoyaltiesHeader() {
  return (
    <CardHeader>
      <CardTitle className="font-heading pb-2">Add collection royalties</CardTitle>
      <CardDescription className="font-heading">
        If your collection is intended to be bought and sold you may want to add in royalties for each resale. Royalties
        require a percentage of any sale of NFTs in the collection go to the specified beneficiaries. Beneficiaries can
        be any address which may be a charity script address or personal wallet. Keep in mind large royalties can
        discourage buying and selling. For this reason it is advisable to keep the total royalties to a small
        percentage. Royalties are enforced at the discretion of the each marketplace. Most marketplaces support
        royalties but it is not guaranteed to be enforced.
      </CardDescription>
    </CardHeader>
  );
}
