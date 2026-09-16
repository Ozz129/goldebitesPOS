import TextField, { type TextFieldProps } from '@mui/material/TextField';
import { formatNumber } from '../../utils/format';

interface CurrencyFieldProps extends Omit<TextFieldProps, 'value' | 'onChange' | 'type'> {
  value: number | '';
  onChange: (value: number | '') => void;
}

/**
 * A money-amount input immune to locale/keyboard auto-formatting corrupting the value: every
 * keystroke is sanitized down to digits only before becoming the number, and the display shows
 * Colombian thousands separators for readability while typing.
 *
 * Never use a plain `type="number"` field for money here — on some devices the numeric keyboard
 * inserts "." as a thousands separator as the user types (regional keyboard formatting), and
 * `Number("329.000")` silently evaluates to 329 in JS (period = decimal point there), corrupting
 * the amount with no error at all. This field strips every non-digit character on every change,
 * so stray separators the keyboard injects can never reach the underlying numeric value.
 */
export default function CurrencyField({ value, onChange, ...textFieldProps }: CurrencyFieldProps) {
  const displayValue = value === '' || Number.isNaN(value) ? '' : formatNumber(value);

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const digitsOnly = event.target.value.replace(/\D/g, '');
    onChange(digitsOnly === '' ? '' : Number(digitsOnly));
  }

  return <TextField {...textFieldProps} type="text" inputMode="numeric" value={displayValue} onChange={handleChange} />;
}
