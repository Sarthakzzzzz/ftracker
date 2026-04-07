import { useEffect, useRef } from 'react';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.css';
import Label from './Label';
import { CalenderIcon } from '../../icons';
import Hook = flatpickr.Options.Hook;
import DateOption = flatpickr.Options.DateOption;

type PropsType = {
  id: string;
  mode?: "single" | "multiple" | "range" | "time";
  onChange?: Hook | Hook[];
  onValueChange?: (value: string) => void;
  defaultDate?: DateOption;
  value?: DateOption;
  label?: string;
  placeholder?: string;
};

export default function DatePicker({
  id,
  mode,
  onChange,
  onValueChange,
  label,
  defaultDate,
  value,
  placeholder,
}: PropsType) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const pickerRef = useRef<flatpickr.Instance | null>(null);

  useEffect(() => {
    if (!inputRef.current) return;

    pickerRef.current = flatpickr(inputRef.current, {
      mode: mode || "single",
      static: true,
      monthSelectorType: "static",
      dateFormat: "m/d/Y",
      defaultDate,
      onChange: (selectedDates, dateStr, instance) => {
        if (Array.isArray(onChange)) {
          onChange.forEach((hook) => hook(selectedDates, dateStr, instance));
        } else {
          onChange?.(selectedDates, dateStr, instance);
        }
        const selected = selectedDates[0];
        if (selected && onValueChange) {
          const year = selected.getFullYear();
          const month = String(selected.getMonth() + 1).padStart(2, "0");
          const day = String(selected.getDate()).padStart(2, "0");
          onValueChange(`${year}-${month}-${day}`);
        }
      },
    });

    return () => {
      if (pickerRef.current && !Array.isArray(pickerRef.current)) {
        pickerRef.current.destroy();
        pickerRef.current = null;
      }
    };
  }, [mode, onChange, onValueChange, defaultDate, id]);

  useEffect(() => {
    if (!pickerRef.current) return;
    pickerRef.current.setDate(value ?? "", false, "Y-m-d");
  }, [value]);

  return (
    <div>
      {label && <Label htmlFor={id}>{label}</Label>}

      <div className="relative">
        <input
          ref={inputRef}
          id={id}
          placeholder={placeholder}
          readOnly
          className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3  dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30  bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700  dark:focus:border-brand-800"
        />

        <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
          <CalenderIcon className="size-6" />
        </span>
      </div>
    </div>
  );
}
