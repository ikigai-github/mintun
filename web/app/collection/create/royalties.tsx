import { forwardRef, Ref, useCallback, useImperativeHandle } from 'react';
import { valibotResolver } from '@hookform/resolvers/valibot';
import { Cross1Icon, PlusIcon } from '@radix-ui/react-icons';
import { TooltipContent } from '@radix-ui/react-tooltip';
import { useFieldArray, useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Tooltip } from '@/components/ui/tooltip';

import { useCreateCollectionContext } from './context';
import { ParentSubmitForm, RoyaltiesData, RoyaltiesSchema } from './schema';

const RoyaltiesContent = forwardRef((_props, ref: Ref<ParentSubmitForm>) => {
  const { royalties, setRoyalties } = useCreateCollectionContext();

  const form = useForm<RoyaltiesData>({
    resolver: valibotResolver(RoyaltiesSchema),
    defaultValues: royalties,
  });

  const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name: 'royalties',
  });

  const { trigger, getValues } = form;

  const handleSubmit = useCallback(async () => {
    const isValid = await trigger();
    if (isValid) {
      setRoyalties(form.getValues());
    }

    return isValid;
  }, [trigger, getValues, setRoyalties]);

  useImperativeHandle(ref, () => ({ handleSubmit }));

  const onSubmit = useCallback((values: RoyaltiesData) => setRoyalties(values), [setRoyalties]);

  function handleAddRoyalty(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    // If the preventDefault is not called the form will submit. I am not sure why as the buttons are not submit type
    e.preventDefault();
    append({ address: '', percentage: 0 });
  }

  const handleRemoveRoyalty = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, index: number) => {
    e.preventDefault();
    remove(index);
  };

  return (
    <Card>
      <RoyaltiesHeader />
      <Form {...form}>
        <form className="px-6" id="create-collection-royalties-form" onSubmit={form.handleSubmit(onSubmit)}>
          {fields?.map((field, index) => {
            return (
              <div key={`royalty-${index}`} className={`mb-3 gap-8 pb-3 md:flex ${index !== 0 && 'border-t py-3'}`}>
                <FormField
                  name={`royalties.${index}.address`}
                  render={() => (
                    <FormItem className="mb-1 w-full md:mb-0">
                      <FormLabel>Address {index > 0 && `#${index + 1}`}</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          value={field.address}
                          onChange={(e) => {
                            update(index, { ...field, address: e.target.value });
                          }}
                        />
                      </FormControl>
                      {/* Show the small info text only under the last royalty input because it looks weird being repeated */}
                      {index === fields.length - 1 && (
                        <FormDescription className="!md:mb-0 !mb-1">
                          The wallet address or policy id of the royalty recipient.
                        </FormDescription>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`royalties.${index}.percentage`}
                  render={(_) => (
                    <FormItem className="w-full md:w-[160px]">
                      <FormLabel>Percent {index > 0 && `#${index + 1}`}</FormLabel>
                      <FormControl>
                        <div className="flex items-center gap-6">
                          <Input
                            type="number"
                            min={0}
                            max={100}
                            value={field.percentage}
                            onChange={(e) => {
                              update(index, { ...field, percentage: Number(e.target.value) });
                            }}
                          />
                          <Tooltip>
                            <TooltipContent>Delete Royalty</TooltipContent>
                            <Button onClick={(e) => handleRemoveRoyalty(e, index)} variant="ghost">
                              <Cross1Icon color="red" />
                            </Button>
                          </Tooltip>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            );
          })}
          <div className="flex w-full justify-center p-6">
            <Button onClick={handleAddRoyalty} variant="ghost" className="py-6">
              <PlusIcon width={36} height={36} />
            </Button>
          </div>
        </form>
      </Form>
    </Card>
  );
});

function RoyaltiesHeader() {
  return (
    <CardHeader>
      <CardTitle className="font-heading pb-2">Add collection royalties</CardTitle>
      <div className="font-heading">
        If your collection is intended to be bought and sold you may want to add in royalties for each resale. Royalties
        require a percentage of any sale of NFTs in the collection go to the specified beneficiaries. Beneficiaries can
        be any address which may be a charity script address or personal wallet. Keep in mind large royalties can
        discourage buying and selling. For this reason it is advisable to keep the total royalties to a small
        percentage. Royalties are enforced at the discretion of the each marketplace. Most marketplaces support
        royalties but it is not guaranteed to be enforced.
      </div>
    </CardHeader>
  );
}

RoyaltiesContent.displayName = 'RoyaltiesContent';

export default RoyaltiesContent;
