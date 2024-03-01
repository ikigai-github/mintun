import eternlIcon from '@/public/eternl.png';
import flintIcon from '@/public/flint.svg';
import geroIcon from '@/public/gero.png';
import laceIcon from '@/public/lace.svg';
import namiIcon from '@/public/nami.svg';
import nufiIcon from '@/public/nufi.svg';
import typhonIcon from '@/public/typhon.svg';
import yoroiIcon from '@/public/yoroi.png';

export const chromeStoreUrl = 'https://chrome.google.com/webstore/detail/';

export const knownWalletExtensions = {
  nami: {
    id: 'lpfcbjknijpeeillifnkikgncikgfhdo',
    name: 'nami',
    display: 'Nami',
    icon: namiIcon,
  },
  flint: {
    id: 'hnhobjmcibchnmglfbldbfabcgaknlkj',
    name: 'flint',
    display: 'Flint',
    icon: flintIcon,
  },
  typhon: {
    id: 'kfdniefadaanbjodldohaedphafoffoh',
    name: 'typhoncip30',
    display: 'Typhon',
    icon: typhonIcon,
  },
  yoroi: {
    id: 'ffnbelfdoeiohenkjibnmadjiehjhajb',
    name: 'yoroi',
    display: 'Yoroi',
    icon: yoroiIcon,
  },
  eternl: {
    id: 'kmhcihpebfmpgmihbkipmjlmmioameka',
    name: 'eternl',
    display: 'Eternl',
    icon: eternlIcon,
  },
  gerowallet: {
    id: 'bgpipimickeadkjlklgciifhnalhdjhe',
    name: 'gerowallet',
    display: 'GeroWallet',
    icon: geroIcon,
  },
  nufi: {
    id: 'gpnihlnnodeiiaakbikldcihojploeca',
    name: 'nufi',
    display: 'NuFi',
    icon: nufiIcon,
  },
  lace: {
    id: 'gafhhkghbfjjkeiendhlofajokpaflmk',
    name: 'lace',
    display: 'Lace',
    icon: laceIcon,
  },
};

export type KnownWalletName = keyof typeof knownWalletExtensions;

export const getWalletIcon = (walletName: KnownWalletName) => {
  const name = knownWalletExtensions[walletName].name;
  if (
    typeof window === 'undefined' ||
    typeof window.cardano === 'undefined' ||
    typeof window.cardano[name] === 'undefined'
  ) {
    return knownWalletExtensions[walletName].icon;
  }

  return window.cardano[name].icon;
};
