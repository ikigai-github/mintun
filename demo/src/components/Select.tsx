import { Select as Kobalte } from '@kobalte/core';
import { createEffect, createSignal, For, type JSX, Show, splitProps } from 'solid-js';

type Option = {
  label: string;
  value: string;
};

type SelectProps = {
  label?: string | undefined;
  placeholder?: string | undefined;
  options: Option[];
  value: string | undefined;
  error: string;
  required?: boolean | undefined;
  disabled?: boolean | undefined;
  ref: (element: HTMLSelectElement) => void;
  onInput: JSX.EventHandler<HTMLSelectElement, InputEvent>;
  onChange: JSX.EventHandler<HTMLSelectElement, Event>;
  onBlur: JSX.EventHandler<HTMLSelectElement, FocusEvent>;
};

export default function Select(props: SelectProps) {
  const [otherProps, selectProps] = splitProps(
    props,
    ['label', 'options', 'error', 'value', 'placeholder'],
    ['ref', 'onInput', 'onChange', 'onBlur', 'required', 'disabled'],
  );

  const selectClass = props.error ? 'select select-error' : 'select';

  return (
    <div class='form-control'>
      <Show when={props.label}>
        <label class='label'>
          <span class='label-text'>{props.label}</span>
        </label>
      </Show>
      <select {...selectProps} class={selectClass}>
        <Show when={props.placeholder}>
          <option disabled selected>{props.placeholder}</option>
        </Show>
        <For each={otherProps.options}>
          {(item) => <option selected={otherProps.value === item.value}>{item.label}</option>}
        </For>
      </select>
      <Show when={otherProps.error}>
        <span class='label-text'>{props.error}</span>
      </Show>
    </div>
  );
}
