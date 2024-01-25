import { TextField as Kobalte } from '@kobalte/core';
import { type JSX, Show, splitProps } from 'solid-js';
import { minValue } from 'valibot';

type TextFieldProps = {
  name: string;
  label?: string | undefined;
  placeholder?: string | undefined;
  minValue?: number | undefined;
  maxValue?: number | undefined;
  value: number | undefined;
  error: string;
  multiline?: boolean | undefined;
  required?: boolean | undefined;
  disabled?: boolean | undefined;
  ref: (element: HTMLInputElement | HTMLTextAreaElement) => void;
  onInput: JSX.EventHandler<HTMLInputElement | HTMLTextAreaElement, InputEvent>;
  onChange: JSX.EventHandler<HTMLInputElement | HTMLTextAreaElement, Event>;
  onBlur: JSX.EventHandler<HTMLInputElement | HTMLTextAreaElement, FocusEvent>;
};

export default function NumberField(props: TextFieldProps) {
  const [rootProps, inputProps] = splitProps(
    props,
    ['name', 'required', 'disabled'],
    ['placeholder', 'ref', 'onInput', 'onChange', 'onBlur'],
  );

  return (
    <Kobalte.Root
      {...rootProps}
      value={props.value?.toString()}
      validationState={props.error ? 'invalid' : 'valid'}
    >
      <Show when={props.label}>
        <Kobalte.Label class='label'>
          <span class='label-text'>{props.label}</span>
        </Kobalte.Label>
      </Show>
      <Kobalte.Input class='input w-full' {...inputProps} type='number' />
      <Kobalte.ErrorMessage>{props.error}</Kobalte.ErrorMessage>
    </Kobalte.Root>
  );
}
