# formatDate — mandatory datetime display

Package: `@godxjp/ui/datetime`

## Import

```tsx
import { formatDate } from "@godxjp/ui/datetime";
import { useDateTime } from "@godxjp/ui/app";
```

## Rules

1. **Never** use `date-fns/format`, `toLocaleString`, or raw ISO slices for UI.
2. **Always** wrap apps in `<AppProvider>` so defaults apply.
3. **Optional** per-call `timezone` override — global prefs unchanged.

## Defaults

Omit `locale`, `timezone`, `timeFormat`, `dateFormat` → synced from AppProvider.

## dateFormat presets

| value | Pattern      | Default locale |
| ----- | ------------ | -------------- |
| `iso` | `yyyy-MM-dd` | ja             |
| `dmy` | `dd/MM/yyyy` | vi             |
| `mdy` | `MM/dd/yyyy` | en             |

Sent to backend as `x-date-format`. Pick with `<DateFormatPicker />`.

## kind presets

| kind       | Use                                      |
| ---------- | ---------------------------------------- |
| `auto`     | Default — detects date / time / datetime |
| `datetime` | Audit logs, `created_at`                 |
| `date`     | `"2026-05-01"` fields                    |
| `calendar` | `Date` from DatePicker                   |
| `time`     | `"14:30"` HH:mm                          |
| `long`     | Detail headings (PPP)                    |
| `relative` | Activity feeds                           |

## ISO 8601 patterns

Date order follows `dateFormat` from AppProvider (`iso` | `dmy` | `mdy`):

- `iso`: `yyyy-MM-dd` + `yyyy-MM-dd HH:mm`
- `dmy`: `dd/MM/yyyy` + `dd/MM/yyyy HH:mm`
- `mdy`: `MM/dd/yyyy` + `MM/dd/yyyy HH:mm`

Time portion still follows `timeFormat` (24h vs 12h).

## Examples

```tsx
formatDate("2026-05-01T14:30:00Z");
formatDate("2026-05-01");
formatDate("17:30", { kind: "time" });
formatDate(pickedDate, { kind: "calendar" });
formatDate(iso, { timezone: "Asia/Tokyo" });
```

## React

```tsx
const { format } = useDateTime();
return <td>{format(row.createdAt)}</td>;
```
