import { useMemo } from 'react';
import { DiscordLogoIcon, GlobeIcon, InstagramLogoIcon, TwitterLogoIcon } from '@radix-ui/react-icons';
import { format } from 'date-fns';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

import { useCreateCollectionContext } from './context';
import { DataContract } from './schema';

export default function ReviewContent() {
  return (
    <Card>
      <ReviewHeader />
    </Card>
  );
}

function ReviewHeader() {
  return (
    <CardHeader>
      <CardTitle className="font-heading pb-2">Review and create your collection</CardTitle>
      <div className="font-heading">
        You can review the data you filled out below. At a minimum you need a collection name and a connected wallet to
        mint a collection. If you are ready to mint click the mint button on the cart.
      </div>
      <div>
        A management token will be sent to your connected wallet. This token is how we identify you as the owner of the
        collection so you can send it to any wallet you want to use to manage the collection. Once you have this token
        you can add NFTs to the collection using our NFT minting tool.
      </div>
    </CardHeader>
  );
}

export function ReviewAccordion() {
  return (
    <Accordion
      type="single"
      collapsible
      orientation="horizontal"
      className="text-muted-foreground w-full"
      defaultValue="describe"
    >
      <DescribeAccordionItem />
      <ContractAccordionItem />
      <ImagesAccordionItem />
      <RoyaltiesAccordionItem />
      <TraitsAccordionItem />
      <SocialAccordionItem />
    </Accordion>
  );
}

function DescribeAccordionItem() {
  const { describe } = useCreateCollectionContext();

  return (
    <AccordionItem value="describe">
      <AccordionTrigger className="font-heading text-foreground text-lg font-light leading-none">
        {describe.collection}
      </AccordionTrigger>
      <AccordionContent>
        <div className="bg-accent grid grid-cols-[auto_1fr] items-end gap-x-4 gap-y-2 rounded-[0.5rem] p-2">
          {describe.artist && (
            <>
              <div className="text-xs font-bold">Artist</div>
              <div className="font-heading text-foreground font-light">{describe.artist}</div>
            </>
          )}
          {describe.project && (
            <>
              <div className="text-xs font-bold">Brand</div>
              <div className="font-heading text-foreground font-light">{describe.project}</div>
            </>
          )}

          {describe.description && (
            <>
              <div className="text-xs font-bold">Description</div>
              <div className="font-heading text-foreground truncate font-light">
                <Tooltip>
                  <TooltipTrigger asChild className="cursor-pointer">
                    <span>{describe.description}</span>
                  </TooltipTrigger>
                  <TooltipContent className="bg-accent text-foreground shadow-foreground/10  overflow-auto whitespace-normal shadow-md">
                    <div className="max-w-72 p-2">{describe.description}</div>
                  </TooltipContent>
                </Tooltip>
              </div>
            </>
          )}
          <div className="text-xs font-bold">Not Safe for work</div>
          <div className="font-heading text-foreground font-light">{describe.nsfw ? 'Yes' : 'No'}</div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

function ContractAccordionItem() {
  const { contract: configuration } = useCreateCollectionContext();

  const displayContractName = useMemo(
    () =>
      configuration.contract === DataContract.Evolvable ? 'Permissive Evolution Data Contract' : 'Static Data Contract',
    [configuration.contract]
  );

  const enabled = configuration.group || configuration.maxTokens || configuration.window;

  return (
    <AccordionItem value="configure">
      <AccordionTrigger disabled={!enabled} className="font-heading text-foreground font-light leading-none">
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
              <div className="font-heading text-foreground truncate font-light">{configuration.group}</div>
            </>
          )}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

function ImagesAccordionItem() {
  const { images } = useCreateCollectionContext();

  const imageArray = useMemo(() => {
    const { desktop, tablet, mobile } = images;
    let imageArray = [];

    if (desktop.avatar.src) imageArray.push(desktop.avatar);
    if (desktop.banner.src) imageArray.push(desktop.banner);
    if (desktop.thumbnail.src) imageArray.push(desktop.thumbnail);

    if (tablet.avatar.src) imageArray.push(tablet.avatar);
    if (tablet.banner.src) imageArray.push(tablet.banner);
    if (tablet.thumbnail.src) imageArray.push(tablet.thumbnail);

    if (mobile.avatar.src) imageArray.push(mobile.avatar);
    if (mobile.banner.src) imageArray.push(mobile.banner);
    if (mobile.thumbnail.src) imageArray.push(mobile.thumbnail);

    return imageArray;
  }, [images]);

  return (
    <AccordionItem value="images">
      <AccordionTrigger
        disabled={imageArray.length === 0}
        className="font-heading text-foreground font-light leading-none"
      >{`${imageArray.length} Images`}</AccordionTrigger>
      <AccordionContent>
        <div className="bg-accent flex flex-wrap items-end gap-2 rounded-[0.5rem] p-2">
          {imageArray.map((image, index) => (
            <img
              key={`review-image-${index}`}
              className="size-10 object-cover"
              src={'data:image/jpeg;base64, ' + image.src}
              alt={`Review Image ${index}`}
            />
          ))}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

function RoyaltiesAccordionItem() {
  const { royalties } = useCreateCollectionContext();

  const label = useMemo(() => {
    if (royalties.royalties.length === 0) {
      return 'No Royalties';
    } else if (royalties.royalties.length === 1) {
      return 'One Royalty Beneficiary';
    } else {
      return `${royalties.royalties.length} Royalty Beneficiaries`;
    }
  }, [royalties]);

  return (
    <AccordionItem value="royalties">
      <AccordionTrigger
        disabled={royalties.royalties.length === 0}
        className="font-heading text-foreground font-light leading-none"
      >
        {label}
      </AccordionTrigger>
      <AccordionContent>
        <div className="bg-accent grid grid-cols-[auto_1fr] gap-x-10 gap-y-2 rounded-[0.5rem] p-4">
          {royalties.royalties.map((royalty, index) => (
            <>
              <div key={`royalty-address-${index}`} className="font-heading text-primary cursor-pointer truncate">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span>{royalty.address}</span>
                  </TooltipTrigger>
                  <TooltipContent
                    align="start"
                    className="bg-accent text-foreground shadow-foreground/10 whitespace-normal text-xs shadow-md"
                  >
                    <div className="p-2">{royalty.address}</div>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="text-foreground" key={`royalty-percent-${index}`}>
                {royalty.percentage}%
              </div>
            </>
          ))}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

function TraitsAccordionItem() {
  const { traits } = useCreateCollectionContext();

  const label = useMemo(() => {
    if (traits.length === 0) {
      return 'No Traits';
    } else if (traits.length === 1) {
      return 'One Trait';
    } else {
      return `${traits.length} Traits`;
    }
  }, [traits]);

  return (
    <AccordionItem value="traits">
      <AccordionTrigger disabled={traits.length === 0} className="font-heading text-foreground font-light leading-none">
        {label}
      </AccordionTrigger>
      <AccordionContent>
        <div className="bg-accent flex gap-2 rounded-[0.5rem] p-2">
          {traits.map((trait, index) => (
            <Badge variant="outline" className="bg-background capitalize" key={`review-trait-${index}`}>
              {trait}
            </Badge>
          ))}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

function SocialAccordionItem() {
  const { social } = useCreateCollectionContext();

  const label = useMemo(() => {
    let count = 0;
    if (social.website) count++;
    if (social.twitter) count++;
    if (social.instagram) count++;
    if (social.discord) count++;

    if (count === 0) {
      return 'No Social Links';
    } else if (count === 1) {
      return 'One Social Link';
    } else {
      return `${count} Social Links`;
    }
  }, [social]);

  return (
    <AccordionItem value="social">
      <AccordionTrigger
        disabled={label === 'No Social Links'}
        className="font-heading text-foreground font-light leading-none"
      >
        {label}
      </AccordionTrigger>
      <AccordionContent>
        <div className="bg-accent text-foreground grid grid-cols-[auto_1fr] items-end items-center gap-4 rounded-[0.5rem] p-2">
          {social.website ? (
            <>
              <GlobeIcon className="size-5" />
              <span>{social.website}</span>
            </>
          ) : undefined}
          {social.twitter ? (
            <>
              <TwitterLogoIcon className="size-5" />
              <span>{social.twitter}</span>
            </>
          ) : undefined}
          {social.discord ? (
            <>
              <DiscordLogoIcon className="size-5" />
              <span>{social.discord}</span>
            </>
          ) : undefined}
          {social.instagram ? (
            <>
              <InstagramLogoIcon className="size-5" />
              <span>{social.instagram}</span>
            </>
          ) : undefined}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
