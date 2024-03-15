import { useMemo } from 'react';
import { format } from 'date-fns';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

import { useCreateCollectionContext } from './context';
import { DataContract, UploadImageData } from './schema';

export function AccordionDemo() {
  return (
    <Accordion type="single" collapsible orientation="horizontal" className="w-full" defaultValue="describe">
      <DescribeAccordionItem />
      <ContractAccordionItem />
      <AccordionItem value="item-3">
        <AccordionTrigger>3 Images</AccordionTrigger>
        <AccordionContent>Yes. It's animated by default, but you can disable it if you prefer.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-4">
        <AccordionTrigger disabled={true}>No Royalties</AccordionTrigger>
        <AccordionContent>Yes. It's animated by default, but you can disable it if you prefer.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-5">
        <AccordionTrigger>5 Traits</AccordionTrigger>
        <AccordionContent>Yes. It's animated by default, but you can disable it if you prefer.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-6">
        <AccordionTrigger>3 Social Links</AccordionTrigger>
        <AccordionContent>Yes. It's animated by default, but you can disable it if you prefer.</AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

function toImageArray(images: UploadImageData) {
  const { desktop, tablet, mobile } = images;
  let imageArray = [];
  if (desktop.avatar) imageArray.push(desktop.avatar);
  if (desktop.banner) imageArray.push(desktop.banner);
  if (desktop.thumbnail) imageArray.push(desktop.thumbnail);

  if (tablet.avatar) imageArray.push(tablet.avatar);
  if (tablet.banner) imageArray.push(tablet.banner);
  if (tablet.thumbnail) imageArray.push(tablet.thumbnail);

  if (mobile.avatar) imageArray.push(mobile.avatar);
  if (mobile.banner) imageArray.push(mobile.banner);
  if (mobile.thumbnail) imageArray.push(mobile.thumbnail);

  return imageArray;
}

function ImagesAccordionItem() {
  const { images } = useCreateCollectionContext();

  //   <img
  //   className={cn('h-[200px] w-[200px] object-cover ', imageClassName)}
  //   height={200}
  //   width={200}
  //   src={'data:image/jpeg;base64, ' + img || undefined}
  //   alt="Thumbnail"
  // />
  return <div>TOD</div>;
}

function DescribeAccordionItem() {
  const { description } = useCreateCollectionContext();

  return (
    <AccordionItem value="describe">
      <AccordionTrigger className="font-heading text-foreground font-light">{description.collection}</AccordionTrigger>
      <AccordionContent>
        <div className="bg-accent grid grid-cols-[auto_1fr] items-end gap-x-4 gap-y-2 rounded-[0.5rem] p-2">
          {description.artist && (
            <>
              <div className="text-xs font-bold">Artist</div>
              <div className="font-heading text-foreground font-light">{description.artist}</div>
            </>
          )}
          {description.project && (
            <>
              <div className="text-xs font-bold">Brand</div>
              <div className="font-heading text-foreground font-light">{description.project}</div>
            </>
          )}

          {description.description && (
            <>
              <div className="text-xs font-bold">Description</div>
              <div className="font-heading text-foreground truncate font-light">
                <Tooltip>
                  <TooltipTrigger>{description.description}</TooltipTrigger>
                  <TooltipContent
                    align="start"
                    className="bg-accent text-foreground shadow-foreground/10  overflow-auto whitespace-normal shadow-md"
                  >
                    <div className="max-w-72 p-2">{description.description}</div>
                  </TooltipContent>
                </Tooltip>
              </div>
            </>
          )}
          <div className="text-xs font-bold">Not Safe for work</div>
          <div className="font-heading text-foreground font-light">{description.nsfw ? 'Yes' : 'No'}</div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

function ContractAccordionItem() {
  const { configuration } = useCreateCollectionContext();

  const displayContractName = useMemo(
    () =>
      configuration.contract === DataContract.Evolvable ? 'Permissive Evolution Data Contract' : 'Static Data Contract',
    [configuration.contract]
  );

  const enabled = configuration.group || configuration.maxTokens || configuration.window;

  return (
    <AccordionItem value="configure">
      <AccordionTrigger disabled={!enabled} className="font-heading text-foreground font-ligt">
        {displayContractName}
      </AccordionTrigger>
      <AccordionContent>
        <div className="bg-accent grid grid-cols-[auto_1fr] items-end gap-x-4 gap-y-2 rounded-[0.5rem] p-2">
          {configuration.window && (
            <>
              <div className="text-xs font-bold">Minting Window</div>
              <div className="font-heading text-foreground font-light">
                {`${format(configuration.window.from, 'LLL dd, y')} - ${format(configuration.window.to, 'LLL dd, y')}`}
              </div>
            </>
          )}
          {configuration.maxTokens && (
            <>
              <div className="text-xs font-bold">Max NFTs</div>
              <div className="font-heading text-foreground font-light">{configuration.maxTokens}</div>
            </>
          )}
          {configuration.group && (
            <>
              <div className="text-xs font-bold">Group</div>
              <div className="font-heading text-foreground font-light">{configuration.group}</div>
            </>
          )}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
