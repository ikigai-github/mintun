import { forwardRef, Ref, useCallback, useImperativeHandle } from 'react';
import { valibotResolver } from '@hookform/resolvers/valibot';
import { DiscordLogoIcon, GlobeIcon, InstagramLogoIcon, TwitterLogoIcon } from '@radix-ui/react-icons';
import { useForm } from 'react-hook-form';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

import { useCreateCollectionContext } from './context';
import { ParentSubmitForm, SocialData, SocialSchema } from './schema';

const SocialContent = forwardRef((_props, ref: Ref<ParentSubmitForm>) => {
  const { social, setSocial } = useCreateCollectionContext();

  const form = useForm<SocialData>({
    resolver: valibotResolver(SocialSchema),
    defaultValues: social,
  });

  const { trigger, getValues } = form;

  // Want to use the async form instead of form.handleSubmit(onSuccess, onError) because the callbacks
  // are not as easy to work with in this case where we just want to know if validation failed
  const handleSubmit = useCallback(async () => {
    const isValid = await trigger();
    if (isValid) {
      setSocial(form.getValues());
    }

    return isValid;
  }, [trigger, getValues, setSocial]);

  useImperativeHandle(ref, () => ({ handleSubmit }));

  const onSubmit = useCallback((values: SocialData) => setSocial(values), [setSocial]);

  return (
    <Card>
      <SocialHeader />
      <CardContent>
        <Form {...form}>
          <form
            className="grid grid-cols-[auto_1fr] items-center gap-4"
            id="create-collection-social-form"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <GlobeIcon className="size-6" />
            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input placeholder="https://www.website.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <TwitterLogoIcon className="size-6" />
            <FormField
              control={form.control}
              name="twitter"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input placeholder="https://x.com/username" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DiscordLogoIcon className="size-6" />
            <FormField
              control={form.control}
              name="discord"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input placeholder="https://discord.com/invite/<invitecode>" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <InstagramLogoIcon className="size-6" />
            <FormField
              control={form.control}
              name="instagram"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input placeholder="https://instagram.com/username" {...field} />
                  </FormControl>
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

function SocialHeader() {
  return (
    <CardHeader>
      <CardTitle className="font-heading pb-2">Links to social media</CardTitle>
      <div className="font-heading">
        Some marketplaces might provide ways of getting to know the creator. One easy approach is to provide links to
        the creators social media. It can be helpful to provide this information as part of the collection.
      </div>
    </CardHeader>
  );
}

SocialContent.displayName = 'SocialContent';

export default SocialContent;
