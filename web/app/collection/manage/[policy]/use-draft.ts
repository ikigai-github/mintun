import { useMemo } from 'react';
import { uid as createUid } from 'uid';

import { DefaultImageDetail } from '@/lib/image';

import { useManageCollectionContext } from './context';

export default function useDraft(presetUid?: string) {
  const { drafts } = useManageCollectionContext();
  const uid = useMemo(() => presetUid || createUid(), [presetUid]);

  const draft = useMemo(() => {
    const draft = drafts.find((draft) => draft.uid == uid);

    if (!draft) {
      return {
        uid,
        image: DefaultImageDetail,
        name: '',
        description: '',
        id: '',
        tags: [],
        traits: [],
      };
    }

    return draft;
  }, [drafts, uid]);

  return draft;
}
