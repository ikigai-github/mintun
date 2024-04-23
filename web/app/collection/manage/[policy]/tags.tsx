import { Badge } from '@/components/ui/badge';

function Tag({ tag }: { tag: string }) {
  return (
    <Badge variant="secondary" className="capitalize">
      {tag}
    </Badge>
  );
}

export default function Tags({ tags }: { tags?: string[] }) {
  if (tags && tags.length) {
    return (
      <div className="flex gap-2">
        {tags.map((tag) => (
          <Tag key={tag} tag={tag} />
        ))}
      </div>
    );
  }
}
