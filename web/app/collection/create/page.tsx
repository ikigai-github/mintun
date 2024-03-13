'use client';

import { useCallback, useRef } from 'react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { useCreateCollectionContext } from './context';
import ContractContent from './contract';
import DescribeContent from './describe';
import Images from './images';
import Mint from './mint';
import ReviewContent from './review';
import RoyaltiesContent from './royalties';
import { ParentSubmitForm } from './schema';
import SocialContent from './social';
import TraitsContent from './traits';

export default function CreateCollection() {
  const { tab, setTab } = useCreateCollectionContext();
  const describeRef = useRef<ParentSubmitForm>(null);
  const contractRef = useRef<ParentSubmitForm>(null);

  // We want to submit the part of the form they are currently viewing whenever they
  // change tabs.  So we have used a forward ref to get the submit function from each
  // form and we run it whenever a tab changes to trigger form validation.  If the
  // validation fails we don't allow the tab change.
  const handleTabChange = useCallback(
    async (newTab: string) => {
      const handleSubmit = async () => {
        switch (tab) {
          case 'describe':
            return await describeRef.current?.handleSubmit();
          case 'contract':
            return await contractRef.current?.handleSubmit();
          default:
            return true;
        }
      };

      const isValid = await handleSubmit();
      if (isValid) {
        setTab(newTab);
      }
    },
    [tab]
  );

  return (
    <div className="flex w-full max-w-[1024px] flex-col gap-2">
      <Mint />
      <Tabs defaultValue="describe" value={tab} onValueChange={handleTabChange} className="flex-1">
        {/* TODO: Maybe Put the Tab list inside a navigation menu on mobile  since it gets a bit unwieldy */}
        <TabsList className="grid h-fit w-full grid-cols-4 sm:grid-cols-7">
          <TabsTrigger value="describe">Descriptions</TabsTrigger>
          <TabsTrigger value="images">Images</TabsTrigger>
          <TabsTrigger value="contract">Contract</TabsTrigger>
          <TabsTrigger value="royalties">Royalties</TabsTrigger>
          <TabsTrigger value="traits">Traits</TabsTrigger>
          <TabsTrigger value="social">Social</TabsTrigger>
          <TabsTrigger value="review">Review</TabsTrigger>
        </TabsList>
        <TabsContent value="describe">
          <DescribeContent ref={describeRef} />
        </TabsContent>
        <TabsContent value="images">
          <Images />
        </TabsContent>
        <TabsContent value="contract">
          <ContractContent ref={contractRef} />
        </TabsContent>
        <TabsContent value="royalties">
          <RoyaltiesContent />
        </TabsContent>
        <TabsContent value="traits">
          <TraitsContent />
        </TabsContent>
        <TabsContent value="social">
          <SocialContent />
        </TabsContent>
        <TabsContent value="review">
          <ReviewContent />
        </TabsContent>
      </Tabs>
    </div>
  );
}
