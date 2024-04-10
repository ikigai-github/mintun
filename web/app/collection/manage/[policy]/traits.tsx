import { MintunNftTraits } from '@ikigai-github/mintun-offchain';

import { Badge } from '@/components/ui/badge';

type RarirtyLookup = Record<string, Record<string, number>>;

const frequencies: RarirtyLookup = {
  action: {
    smoking: 0.343,
    pooping: 0.01,
    thinking: 0.2,
    sneaking: 0.33,
    flipping: 0.5,
    pretending: 0.14,
    derping: 0.2,
  },
  type: {
    guy: 1,
  },
  background: {
    blue: 0.286,
    'light blue': 0.286,
    yellow: 0.286,
    eggshell: 0.143,
  },
};

function toDisplayPercent(decimalPercent: number) {
  return decimalPercent.toLocaleString(undefined, { style: 'percent', maximumFractionDigits: 1 });
}

function Trait({ name, value, frequency }: { name: string; value: string | number; frequency?: number }) {
  return (
    <Badge variant="outline" className="grid grid-cols-2 gap-1 py-1">
      <span className="text-muted-foreground capitalize">{name}</span>
      <span className="text-muted-foreground justify-self-end text-xs">Frequency</span>
      <span className="text-sm capitalize">{value}</span>
      <span className="justify-self-end">{frequency ? toDisplayPercent(frequency) : '-'}</span>
    </Badge>
  );
}

export function Traits(props: { traits?: MintunNftTraits }) {
  const traits = props.traits ? Object.entries(props.traits) : [];

  if (traits.length) {
    return (
      <div className="grid grid-cols-2 gap-2">
        {traits.map(([name, value]) => (
          <Trait key={name} name={name} value={value} frequency={frequencies[name][value]} />
        ))}
      </div>
    );
  }
}
