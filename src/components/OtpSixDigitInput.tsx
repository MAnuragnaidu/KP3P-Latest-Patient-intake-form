'use client';

import { useRef, useEffect, type KeyboardEvent, type ClipboardEvent } from 'react';

type Props = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  hasError?: boolean;
  idPrefix?: string;
};

const LENGTH = 6;

export default function OtpSixDigitInput({
  value,
  onChange,
  disabled = false,
  hasError = false,
  idPrefix = 'otp',
}: Props) {
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const digits = Array.from({ length: LENGTH }, (_, i) => value[i] ?? '');

  useEffect(() => {
    if (value.length === 0) {
      inputRefs.current[0]?.focus();
    }
  }, [value]);

  const updateAtIndex = (index: number, char: string) => {
    const next = digits.slice();
    next[index] = char;
    onChange(next.join('').replace(/\s/g, ''));
  };

  const handleChange = (index: number, raw: string) => {
    const digit = raw.replace(/\D/g, '').slice(-1);
    updateAtIndex(index, digit);
    if (digit && index < LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace') {
      if (digits[index]) {
        updateAtIndex(index, '');
        return;
      }
      if (index > 0) {
        inputRefs.current[index - 1]?.focus();
        updateAtIndex(index - 1, '');
      }
      return;
    }
    if (event.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (event.key === 'ArrowRight' && index < LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const pasted = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, LENGTH);
    if (!pasted) return;
    onChange(pasted);
    const focusIndex = Math.min(pasted.length, LENGTH - 1);
    inputRefs.current[focusIndex]?.focus();
  };

  return (
    <div className={`otp-boxes${hasError ? ' otp-boxes-err' : ''}`} role="group" aria-label="Verification code">
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(el) => {
            inputRefs.current[index] = el;
          }}
          id={`${idPrefix}-${index}`}
          type="text"
          inputMode="numeric"
          autoComplete={index === 0 ? 'one-time-code' : 'off'}
          className="otp-box"
          value={digit}
          disabled={disabled}
          maxLength={1}
          aria-label={`Digit ${index + 1} of ${LENGTH}`}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
        />
      ))}
    </div>
  );
}
