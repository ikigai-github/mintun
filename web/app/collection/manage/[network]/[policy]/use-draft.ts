import { useMemo } from 'react';

import { DefaultImageDetail } from '@/lib/image';

import { useManageCollectionContext } from './context';
import { DraftTokenData } from './types';

export default function useDraft(uid: string, initialTraits?: string[]) {
  const { drafts } = useManageCollectionContext();

  const draft = useMemo(() => {
    const draft = drafts.find((draft) => draft.uid == uid);

    if (!draft) {
      const traits = initialTraits ? initialTraits.map((label) => ({ label, trait: '', preexisting: true })) : [];
      return {
        uid,
        image: DefaultImageDetail,
        name: '',
        description: '',
        id: '',
        tags: [],
        traits
      };
    }

    return draft;
  }, [drafts, uid, initialTraits]);

  return draft;
}
