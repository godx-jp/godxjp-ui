import { Radio } from "@godxjp/ui/data-entry";

export default function Demo() {
  return (
    <Radio.Group defaultValue="air" name="ship-method">
      <label className="flex items-center gap-2 text-sm" htmlFor="ship-air">
        <Radio id="ship-air" value="air" />
        Air 3-5 ngày
      </label>
      <label className="flex items-center gap-2 text-sm" htmlFor="ship-sea">
        <Radio id="ship-sea" value="sea" />
        Sea 14-21 ngày
      </label>
    </Radio.Group>
  );
}
