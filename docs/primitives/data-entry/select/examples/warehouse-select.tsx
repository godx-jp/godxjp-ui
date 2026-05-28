import {
  FormField,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@godxjp/ui/data-entry";

export default function Demo() {
  return (
    <FormField id="warehouse" label="Chi nhánh giao hàng" className="w-72">
      <Select defaultValue="osaka">
        <SelectTrigger id="warehouse">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value="osaka">Acme Osaka</SelectItem>
            <SelectItem value="tokyo">Acme Tokyo</SelectItem>
            <SelectItem value="yokohama">Acme Yokohama</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </FormField>
  );
}
