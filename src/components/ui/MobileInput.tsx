import { Input, type InputProps } from "@/components/ui/Input";
import { sanitizeMobile } from "@/lib/validation";

type MobileInputProps = Omit<InputProps, "value" | "onChange" | "type" | "leftIcon"> & {
  value: string;
  onValueChange: (value: string) => void;
};

/**
 * Indian mobile number field: a fixed "+91" prefix and a box that only ever holds up to 10 digits (pasted
 * "+91 98765-43210" becomes "9876543210"), so the value is always in the shape the API accepts.
 */
export function MobileInput({ value, onValueChange, ...rest }: MobileInputProps) {
  return (
    <Input
      type="tel"
      inputMode="numeric"
      autoComplete="tel-national"
      // No maxLength: the browser would cut a pasted "+91 98765 43210" before sanitizeMobile could fix it.
      pattern="[6-9][0-9]{9}"
      title="10-digit mobile number starting with 6, 7, 8 or 9"
      leftIcon={<span className="text-sm font-medium text-text-secondary">+91</span>}
      value={value}
      onChange={(e) => onValueChange(sanitizeMobile(e.target.value))}
      {...rest}
    />
  );
}
