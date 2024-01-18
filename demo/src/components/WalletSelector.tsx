import { createEffect, createSignal, For, Show } from 'solid-js';
import { SupportedWallets, useWallet } from './WalletContext';
import { DropdownMenu } from '@kobalte/core';

export default function WalletSelector() {
  const { state, setWallet } = useWallet();
  const [label, setLabel] = createSignal('Select Wallet');
  const [icon, setIcon] = createSignal('');
  const [enabled, setEnabled] = createSignal(true);

  createEffect(() => {
    console.log(JSON.stringify(state, undefined, 2));
    if (state.state === 'pending' || state.state === 'refreshing') {
      setLabel('Connecting...');
      setIcon('');
      setEnabled(false);
    } else if (state.state === 'ready') {
      const info = state().info;
      console.log(info);
      setLabel(info.display);
      setIcon(info.icon);
    } else {
      setLabel('Select Wallet');
      setIcon('');
    }
  });

  return (
    <DropdownMenu.Root gutter={3} sameWidth={true}>
      <DropdownMenu.Trigger class='btn btn-wide text-lg' class:btn-disabled={!enabled()}>
        <Show when={icon() !== ''}>
          <img class='-ml-4 w-4 h-4' src={icon()} />
        </Show>
        {label()}
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content as='ul' class='menu menu-lg bg-base-200 rounded-box'>
          <For each={Object.values(SupportedWallets)}>
            {(item) => (
              <DropdownMenu.Item
                as='li'
                onSelect={() => setWallet(item.name)}
              >
                <a>
                  <img class='w-4 h-4' src={item.icon} />
                  {item.display}
                </a>
              </DropdownMenu.Item>
            )}
          </For>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
