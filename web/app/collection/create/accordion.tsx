import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

import { useCreateCollectionContext } from './context';

export function AccordionDemo() {
  return (
    <Accordion type="single" collapsible orientation="horizontal" className="w-full" defaultValue="describe">
      <DescribeAccordionItem />
      <AccordionItem value="item-2">
        <AccordionTrigger>Permissive Evolution Contract</AccordionTrigger>
        <AccordionContent>The date range you picked. The max Tokens.</AccordionContent>
      </AccordionItem>
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
          <div className="col-span-2">Flagged as {description.nsfw && <b>NOT</b>} safe for work</div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
