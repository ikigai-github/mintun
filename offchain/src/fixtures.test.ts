import { CollectionInfo } from './collection-info.ts';
import { IMAGE_PURPOSE } from './image.ts';

export const TEST_COLLECTION_INFO: CollectionInfo = {
  artist: 'Arty McArtface',
  nsfw: true,
  project: 'Mystical Mystic',
  description: 'S',
  images: [{
    src: 'https://picsum.photos/200/200',
    purpose: IMAGE_PURPOSE.Thumbnail,
    dimension: { width: 200, height: 200 },
    mediaType: 'image/jpeg',
  }],
  links: { website: 'https://www.website.com', x: 'https://www.x.com', instagram: 'https://www.instagram.com' },
};
