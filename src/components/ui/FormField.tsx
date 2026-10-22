import { forwardRef, useId } from 'react';
import type { InputHTMLAttributes } from 'react';
import { AlertCircle } from '@icons';
import { cn } from '../../lib/utils';

export const FormField = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
  error?: string;
  suffix?: React.ReactNode;
}>(({ label, hint, error, suffix, className, id, ...props }, ref) => {
  const generatedId = useId();
  const controlId = id || generatedId;
  const descriptionId = `${controlId}-description`;
  return (
    <div className="ds-form-field space-y-2">
      <label htmlFor={controlId} className="block text-sm font-semibold text-[var(--text)]">{label}{props.required && <span aria-hidden="true"> *</span>}</label>
      <div className="relative">
        <input ref={ref} id={controlId} className={cn('field-control ds-field-control px-3', Boolean(suffix) && 'pr-16', Boolean(error) && 'border-danger-DEFAULT', className)} aria-invalid={Boolean(error)} aria-describedby={(hint || error) ? descriptionId : undefined} {...props} />
        {suffix && <div className="absolute inset-y-0 right-2 flex items-center">{suffix}</div>}
      </div>
      {(hint || error) && <p id={descriptionId} role={error ? 'alert' : undefined} className={cn('flex items-start gap-1.5 text-xs leading-relaxed', error ? 'text-danger-DEFAULT' : 'text-[var(--muted)]')}>{error && <AlertCircle size={13} className="mt-0.5 shrink-0" aria-hidden="true" />}{error || hint}</p>}
    </div>
  );
});
FormField.displayName = 'FormField';
