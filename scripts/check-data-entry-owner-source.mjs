#!/usr/bin/env node
import { readFile } from "node:fs/promises";

const contracts = {
  "checkbox.tsx": ["Checkbox", "CheckboxGroup"],
  "command.tsx": [
    "Command",
    "CommandInput",
    "CommandList",
    "CommandEmpty",
    "CommandGroup",
    "CommandItem",
  ],
  "input-otp.tsx": ["InputOTP", "InputOTPGroup", "InputOTPSlot", "InputOTPSeparator"],
  "radio-group.tsx": ["RadioGroup"],
  "select.tsx": ["Select", "SelectTrigger", "SelectValue", "SelectContent", "SelectItem"],
  "toggle-group.tsx": ["ToggleGroup", "ToggleGroupItem"],
};

for (const [file, exports] of Object.entries(contracts)) {
  const source = await readFile(new URL(`../docs/data-entry/${file}`, import.meta.url), "utf8");
  for (const name of exports) {
    const jsx = name.includes(".") ? name.replace(".", "\\.") : name;
    if (!new RegExp(`<${jsx}(?:[\\s>])`).test(source))
      throw new Error(`${file}: public compound export ${name} is not rendered`);
  }
}
console.log("✓ data-entry owner source contracts");
