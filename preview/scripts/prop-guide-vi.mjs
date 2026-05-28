/**
 * Hướng dẫn tiếng Việt cho docs/primitives — mô tả prop, use case, nhóm component.
 * Dùng bởi preview/scripts/sync-primitive-docs.mjs
 */

/** @typedef {{ moTa: string, useCase: string, category?: 'data' | 'action' | 'native' }} PropGuide */

/** @type {Record<string, { intro: string, useCases: string[] }>} */
export const GROUP_VI = {
  "data-display": {
    intro: "Primitive hiển thị dữ liệu — chỉ đọc, không nhập liệu.",
    useCases: [
      "Dùng để trình bày thông tin đã có (số liệu, trạng thái, bảng, danh sách).",
      "Không thay thế form input — kết hợp với Data Entry khi cần chỉnh sửa.",
    ],
  },
  "data-entry": {
    intro: "Primitive nhập liệu — form control và lựa chọn giá trị.",
    useCases: [
      "Luôn bọc trong FormField khi có label/validation.",
      "Dùng controlled (`value` + `onChange`) hoặc uncontrolled (`defaultValue`) tùy form library.",
    ],
  },
  feedback: {
    intro: "Primitive phản hồi — thông báo, xác nhận, trạng thái tải.",
    useCases: [
      "Alert/Toast cho thông báo không chặn luồng.",
      "Dialog/Sheet cho hành động cần xác nhận hoặc form modal.",
    ],
  },
  general: {
    intro: "Primitive tổng quát — nút bấm và control cơ bản.",
    useCases: ["Dùng Button cho mọi hành động chính/phụ trong UI admin."],
  },
  layout: {
    intro: "Primitive bố cục — khung trang, spacing, grid.",
    useCases: [
      "PageContainer bắt buộc cho mọi trang admin.",
      "Stack/Inline thay div + flex thủ công.",
    ],
  },
  navigation: {
    intro: "Primitive điều hướng — menu, tab, breadcrumb, phân trang.",
    useCases: ["PageHeader + Breadcrumb cho context trang.", "Tabs khi chia nội dung cùng entity."],
  },
  query: {
    intro: "Primitive trạng thái React Query — loading, lỗi, refetch.",
    useCases: [
      "DataState bọc nội dung phụ thuộc API.",
      "MutationFeedback sau create/update/delete.",
    ],
  },
};

/** @type {Record<string, PropGuide>} */
export const PROP_VI = {
  children: {
    moTa: "Nội dung con render bên trong component.",
    useCase: "Text, icon, hoặc component con — ví dụ label Badge, body Alert.",
    category: "data",
  },
  label: {
    moTa: "Nhãn mô tả — thường là dòng phụ, font nhỏ.",
    useCase: "CardStat: tên chỉ số KPI; FormField: tên field.",
    category: "data",
  },
  banded: {
    moTa: "Header/footer có nền muted + viền band.",
    useCase: "CardHeader/CardFooter — tách section rõ ràng.",
    category: "data",
  },
  flush: {
    moTa: "Full-bleed — bỏ padding ngang.",
    useCase: "CardContent: table; CardFooter: action bar sát mép.",
    category: "data",
  },
  tight: {
    moTa: "Không gap sau header.",
    useCase: "CardContent sát tabs/toolbar.",
    category: "data",
  },
  solo: {
    moTa: "Không có header phía trên — padding top đầy đủ.",
    useCase: "CardStat, KPI tile chỉ có body.",
    category: "data",
  },
  separated: {
    moTa: "Viền tách section (thường border-top).",
    useCase: "CardFooter action band Save/Cancel.",
    category: "data",
  },
  value: {
    moTa: "Giá trị hiển thị chính.",
    useCase: "CardStat: số KPI; Select controlled: option đang chọn.",
    category: "data",
  },
  hint: {
    moTa: "Gợi ý phụ dưới giá trị chính.",
    useCase: "CardStat: so sánh kỳ trước, đơn vị, context thêm.",
    category: "data",
  },
  delta: {
    moTa: "Thay đổi tương đối (±%) hiển thị cạnh value.",
    useCase: "KPI tăng/giảm — ví dụ `+12%` màu success.",
    category: "data",
  },
  title: {
    moTa: "Tiêu đề chính.",
    useCase: "Dialog/PageHeader/EmptyState — dòng heading nổi bật nhất.",
    category: "data",
  },
  subtitle: {
    moTa: "Dòng phụ dưới title trang.",
    useCase: "PageContainer: mô tả ngắn trang list/detail.",
    category: "data",
  },
  description: {
    moTa: "Nội dung mô tả chi tiết.",
    useCase: "Dialog/EmptyState/Alert — body text giải thích.",
    category: "data",
  },
  icon: {
    moTa: "Icon Lucide hoặc `false` để ẩn icon mặc định.",
    useCase: "EmptyState, Alert — tăng nhận diện trạng thái.",
    category: "data",
  },
  action: {
    moTa: "Slot CTA (thường là Button).",
    useCase: "EmptyState: nút tạo mới / thử lại.",
    category: "data",
  },
  extra: {
    moTa: "Khu vực action góc phải header trang (Ant Design `extra`).",
    useCase: "PageContainer: nút Create, Export cạnh title.",
    category: "data",
  },
  footer: {
    moTa: "Thanh action dưới cùng trang hoặc card.",
    useCase: "PageContainer: Save/Cancel; Dialog: nút xác nhận.",
    category: "data",
  },
  breadcrumb: {
    moTa: "Đường dẫn breadcrumb.",
    useCase: "PageContainer/AppShell: vị trí hiện tại trong IA.",
    category: "data",
  },
  sidebar: {
    moTa: "Slot sidebar — menu điều hướng chính.",
    useCase: "AppShell: `<Sidebar sections={...} />`.",
    category: "data",
  },
  topbar: {
    moTa: "Slot topbar — product bar, user menu.",
    useCase: "AppShell: logo, search, profile.",
    category: "data",
  },
  logo: { moTa: "Logo product trong shell.", useCase: "AppShell topbar trái.", category: "data" },
  items: {
    moTa: "Mảng item để render.",
    useCase: "KeyValueGrid, Steps, Breadcrumb.",
    category: "data",
  },
  columns: {
    moTa: "Số cột layout.",
    useCase: "KeyValueGrid: 1–3 cột; DataTable column defs.",
    category: "data",
  },
  data: { moTa: "Mảng dữ liệu nguồn.", useCase: "DataTable: rows từ API.", category: "data" },
  rows: { moTa: "Số hàng skeleton.", useCase: "Skeleton loading placeholder.", category: "data" },
  options: {
    moTa: "Danh sách lựa chọn `{ label, value }`.",
    useCase: "Select, Radio.Group, Checkbox.Group.",
    category: "data",
  },
  placeholder: {
    moTa: "Placeholder khi chưa có giá trị.",
    useCase: "Input/Select: gợi ý format hoặc hành động.",
    category: "data",
  },
  helper: {
    moTa: "Text gợi ý dưới field.",
    useCase: "FormField: format mã, giới hạn ký tự.",
    category: "data",
  },
  error: {
    moTa: "Thông báo lỗi validation.",
    useCase: "FormField: hiển thị khi Zod/RHF báo lỗi.",
    category: "data",
  },
  name: {
    moTa: "Tên field form (`name` HTML / RHF register).",
    useCase: "Input trong form controlled.",
    category: "data",
  },
  defaultValue: {
    moTa: "Giá trị khởi tạo (uncontrolled).",
    useCase: "Input/RadioGroup khi không cần controlled state.",
    category: "data",
  },
  confirmLabel: {
    moTa: "Nhãn nút xác nhận.",
    useCase: 'DialogConfirm: đổi "OK" → "Xóa vĩnh viễn".',
    category: "data",
  },
  cancelLabel: {
    moTa: "Nhãn nút hủy.",
    useCase: 'DialogConfirm: "Hủy" / "Quay lại".',
    category: "data",
  },
  confirmPhrase: {
    moTa: "Chuỗi user phải gõ để xác nhận hành động nguy hiểm.",
    useCase: "Xóa tenant, xóa dữ liệu production — friction kiểu GitHub.",
    category: "data",
  },
  status: {
    moTa: "Mã trạng thái domain (string).",
    useCase: "StatusBadge: map sang tone màu.",
    category: "data",
  },
  tone: {
    moTa: "Tông màu semantic.",
    useCase: "StatusBadge: success/warning/destructive theo business status.",
    category: "data",
  },
  density: {
    moTa: "Mật độ spacing (page hoặc table).",
    useCase: "PageContainer compact trên mobile; DataTable row height.",
    category: "data",
  },
  variant: {
    moTa: "Biến thể giao diện semantic.",
    useCase: "Button/Badge/Alert — chọn tone phù hợp ngữ cảnh (primary, destructive…).",
    category: "data",
  },
  size: {
    moTa: "Kích thước preset.",
    useCase: "Button sm trong table; Card compact cho KPI row.",
    category: "data",
  },
  gap: {
    moTa: "Khoảng cách giữa items (token spacing).",
    useCase: "Stack vertical gap; Inline horizontal gap.",
    category: "data",
  },
  open: {
    moTa: "Trạng thái mở (controlled).",
    useCase: "Dialog/Sheet/Popover — bind với state `useState`.",
    category: "data",
  },
  disabled: {
    moTa: "Vô hiệu hóa tương tác.",
    useCase: "Chưa đủ điều kiện submit; đang pending API.",
    category: "data",
  },
  pending: {
    moTa: "Đang xử lý — disable nút, hiện spinner.",
    useCase: "DialogConfirm onConfirm async; MutationFeedback.",
    category: "data",
  },
  required: {
    moTa: "Field bắt buộc.",
    useCase: "FormField: hiện dấu * và validate Zod.",
    category: "data",
  },
  loading: {
    moTa: "Trạng thái đang tải dữ liệu.",
    useCase: "DataTable skeleton rows; disable interaction.",
    category: "data",
  },
  selectable: {
    moTa: "Bật chọn nhiều dòng.",
    useCase: "DataTable bulk action (delete, export).",
    category: "data",
  },
  selected: {
    moTa: "Tập ID dòng đang chọn.",
    useCase: "DataTable controlled selection.",
    category: "data",
  },
  sort: {
    moTa: "Trạng thái sort `{ key, direction }`.",
    useCase: "DataTable server-side hoặc client sort.",
    category: "data",
  },
  empty: {
    moTa: "UI khi không có dữ liệu.",
    useCase: "DataTable: EmptyState custom thay table trống.",
    category: "data",
  },
  asChild: {
    moTa: "Radix polymorphism — merge props vào child thay wrapper.",
    useCase: "Button asChild + Link router — giữ semantics `<a>`.",
    category: "data",
  },
  className: {
    moTa: "CSS class bổ sung trên root.",
    useCase: "Fine-tune layout; tránh override token trừ khi cần.",
    category: "native",
  },
  id: {
    moTa: "DOM id — liên kết label/input.",
    useCase: "FormField `htmlFor` + Input `id`.",
    category: "native",
  },
  style: {
    moTa: "Inline style (tránh trừ trường hợp đặc biệt).",
    useCase: "Preview/demo — production nên dùng token.",
    category: "native",
  },
  role: {
    moTa: "ARIA role.",
    useCase: "Accessibility khi semantic HTML không đủ.",
    category: "native",
  },
  tabIndex: {
    moTa: "Thứ tự focus keyboard.",
    useCase: "Custom interactive div.",
    category: "native",
  },
  "aria-label": {
    moTa: "Nhãn cho screen reader.",
    useCase: "Icon-only button không có text visible.",
    category: "native",
  },
  type: {
    moTa: "Loại input/button HTML.",
    useCase: "Button `submit` trong form; Input `email`, `password`.",
    category: "native",
  },
  readOnly: {
    moTa: "Chỉ đọc, vẫn submit được.",
    useCase: "Hiển thị mã đơn đã tạo — khác disabled.",
    category: "native",
  },
  keepOpenOnConfirm: {
    moTa: "Giữ dialog mở sau khi confirm.",
    useCase: "Multi-step confirm hoặc chờ parent đóng.",
    category: "data",
  },
  stickyFooter: {
    moTa: "Pin footer trang xuống viewport khi scroll.",
    useCase: "Form dài — luôn thấy nút Save.",
    category: "data",
  },
  sidebarCollapsed: {
    moTa: "Sidebar thu gọn.",
    useCase: "Responsive / user toggle menu.",
    category: "data",
  },
  mode: { moTa: "Chế độ hoạt động.", useCase: "Dialog form vs confirm.", category: "data" },

  onClick: {
    moTa: "Xử lý khi user click.",
    useCase: "Button submit; row click; dismiss icon.",
    category: "action",
  },
  onChange: {
    moTa: "Xử lý khi giá trị input thay đổi.",
    useCase: "Controlled Input/Select — sync state form.",
    category: "action",
  },
  onOpenChange: {
    moTa: "Callback khi panel mở/đóng thay đổi.",
    useCase: "Dialog/Sheet/Popover — sync `open` state; reset form khi đóng.",
    category: "action",
  },
  onConfirm: {
    moTa: "Xử lý khi user xác nhận.",
    useCase: "DialogConfirm — gọi API delete/submit; có thể async + `pending`.",
    category: "action",
  },
  onDismiss: {
    moTa: "Xử lý khi user đóng alert/banner.",
    useCase: "Alert có nút X — lưu dismissed state.",
    category: "action",
  },
  onRetry: {
    moTa: "Thử lại khi lỗi query.",
    useCase: "AlertQueryError, DataState error — gọi `refetch()`.",
    category: "action",
  },
  onSubmit: {
    moTa: "Submit form.",
    useCase: "Form native — preventDefault + validate.",
    category: "action",
  },
  onFocus: {
    moTa: "Input/button nhận focus.",
    useCase: "Validate on blur; analytics.",
    category: "action",
  },
  onBlur: {
    moTa: "Rời focus — thường trigger validate.",
    useCase: "RHF `mode: onBlur`.",
    category: "action",
  },
  onKeyDown: {
    moTa: "Phím bấm.",
    useCase: "Enter submit; Escape đóng dialog.",
    category: "action",
  },
  onSelectChange: {
    moTa: "Thay đổi selection table.",
    useCase: "DataTable bulk — cập nhật `selected` IDs.",
    category: "action",
  },
  onRowClick: {
    moTa: "Click một dòng table.",
    useCase: "Navigate detail `/orders/:id`.",
    category: "action",
  },
  onSortChange: {
    moTa: "Thay đổi sort column.",
    useCase: "Server sort — API query params mới.",
    category: "action",
  },
  onDensityChange: {
    moTa: "User đổi mật độ table.",
    useCase: "Persist UI density preference.",
    category: "action",
  },
  onDebouncedChange: {
    moTa: "Search sau debounce.",
    useCase: "SearchInput — tránh gọi API mỗi keystroke.",
    category: "action",
  },
  onClearFilters: {
    moTa: "Xóa tất cả filter.",
    useCase: "FilterBar reset URL params + form.",
    category: "action",
  },
  onValueChange: {
    moTa: "Radix value thay đổi (Select, Tabs, Switch…).",
    useCase: "Controlled tabs — sync URL hoặc state.",
    category: "action",
  },
  onCheckedChange: {
    moTa: "Checkbox/Switch toggle.",
    useCase: "Boolean setting — sync form state.",
    category: "action",
  },
};

/** @type {Record<string, Array<{ name: string, type: string, optional?: boolean } & PropGuide>>} */
export const NATIVE_EXPAND_VI = {
  div: [
    {
      name: "className",
      type: "string",
      optional: true,
      moTa: PROP_VI.className.moTa,
      useCase: PROP_VI.className.useCase,
      category: "native",
    },
    {
      name: "id",
      type: "string",
      optional: true,
      moTa: PROP_VI.id.moTa,
      useCase: PROP_VI.id.useCase,
      category: "native",
    },
    {
      name: "onClick",
      type: "(e: MouseEvent) => void",
      optional: true,
      moTa: PROP_VI.onClick.moTa,
      useCase: PROP_VI.onClick.useCase,
      category: "action",
    },
    {
      name: "onKeyDown",
      type: "(e: KeyboardEvent) => void",
      optional: true,
      moTa: PROP_VI.onKeyDown.moTa,
      useCase: PROP_VI.onKeyDown.useCase,
      category: "action",
    },
    {
      name: "role",
      type: "string",
      optional: true,
      moTa: PROP_VI.role.moTa,
      useCase: PROP_VI.role.useCase,
      category: "native",
    },
    {
      name: "tabIndex",
      type: "number",
      optional: true,
      moTa: PROP_VI.tabIndex.moTa,
      useCase: PROP_VI.tabIndex.useCase,
      category: "native",
    },
    {
      name: "aria-label",
      type: "string",
      optional: true,
      moTa: PROP_VI["aria-label"].moTa,
      useCase: PROP_VI["aria-label"].useCase,
      category: "native",
    },
  ],
  button: [
    {
      name: "type",
      type: "`button` | `submit` | `reset`",
      optional: true,
      moTa: PROP_VI.type.moTa,
      useCase: PROP_VI.type.useCase,
      category: "native",
    },
    {
      name: "disabled",
      type: "boolean",
      optional: true,
      moTa: PROP_VI.disabled.moTa,
      useCase: PROP_VI.disabled.useCase,
      category: "data",
    },
    {
      name: "onClick",
      type: "(e: MouseEvent) => void",
      optional: true,
      moTa: PROP_VI.onClick.moTa,
      useCase: PROP_VI.onClick.useCase,
      category: "action",
    },
    {
      name: "onFocus",
      type: "(e: FocusEvent) => void",
      optional: true,
      moTa: PROP_VI.onFocus.moTa,
      useCase: PROP_VI.onFocus.useCase,
      category: "action",
    },
    {
      name: "onBlur",
      type: "(e: FocusEvent) => void",
      optional: true,
      moTa: PROP_VI.onBlur.moTa,
      useCase: PROP_VI.onBlur.useCase,
      category: "action",
    },
    {
      name: "className",
      type: "string",
      optional: true,
      moTa: PROP_VI.className.moTa,
      useCase: PROP_VI.className.useCase,
      category: "native",
    },
    {
      name: "aria-label",
      type: "string",
      optional: true,
      moTa: PROP_VI["aria-label"].moTa,
      useCase: PROP_VI["aria-label"].useCase,
      category: "native",
    },
  ],
  input: [
    {
      name: "value",
      type: "string",
      optional: true,
      moTa: "Giá trị controlled.",
      useCase: "Form sync — bắt buộc kèm `onChange`.",
      category: "data",
    },
    {
      name: "defaultValue",
      type: "string",
      optional: true,
      moTa: PROP_VI.defaultValue.moTa,
      useCase: PROP_VI.defaultValue.useCase,
      category: "data",
    },
    {
      name: "placeholder",
      type: "string",
      optional: true,
      moTa: PROP_VI.placeholder.moTa,
      useCase: PROP_VI.placeholder.useCase,
      category: "data",
    },
    {
      name: "name",
      type: "string",
      optional: true,
      moTa: PROP_VI.name.moTa,
      useCase: PROP_VI.name.useCase,
      category: "data",
    },
    {
      name: "disabled",
      type: "boolean",
      optional: true,
      moTa: PROP_VI.disabled.moTa,
      useCase: PROP_VI.disabled.useCase,
      category: "data",
    },
    {
      name: "readOnly",
      type: "boolean",
      optional: true,
      moTa: PROP_VI.readOnly.moTa,
      useCase: PROP_VI.readOnly.useCase,
      category: "native",
    },
    {
      name: "onChange",
      type: "(e: ChangeEvent) => void",
      optional: true,
      moTa: PROP_VI.onChange.moTa,
      useCase: PROP_VI.onChange.useCase,
      category: "action",
    },
    {
      name: "onFocus",
      type: "(e: FocusEvent) => void",
      optional: true,
      moTa: PROP_VI.onFocus.moTa,
      useCase: PROP_VI.onFocus.useCase,
      category: "action",
    },
    {
      name: "onBlur",
      type: "(e: FocusEvent) => void",
      optional: true,
      moTa: PROP_VI.onBlur.moTa,
      useCase: PROP_VI.onBlur.useCase,
      category: "action",
    },
    {
      name: "onKeyDown",
      type: "(e: KeyboardEvent) => void",
      optional: true,
      moTa: PROP_VI.onKeyDown.moTa,
      useCase: PROP_VI.onKeyDown.useCase,
      category: "action",
    },
    {
      name: "className",
      type: "string",
      optional: true,
      moTa: PROP_VI.className.moTa,
      useCase: PROP_VI.className.useCase,
      category: "native",
    },
  ],
  textarea: [
    {
      name: "value",
      type: "string",
      optional: true,
      moTa: "Giá trị controlled.",
      useCase: "Textarea form dài — sync RHF.",
      category: "data",
    },
    {
      name: "placeholder",
      type: "string",
      optional: true,
      moTa: PROP_VI.placeholder.moTa,
      useCase: PROP_VI.placeholder.useCase,
      category: "data",
    },
    {
      name: "rows",
      type: "number",
      optional: true,
      moTa: "Số dòng hiển thị.",
      useCase: "Ghi chú ngắn vs mô tả dài.",
      category: "data",
    },
    {
      name: "disabled",
      type: "boolean",
      optional: true,
      moTa: PROP_VI.disabled.moTa,
      useCase: PROP_VI.disabled.useCase,
      category: "data",
    },
    {
      name: "onChange",
      type: "(e: ChangeEvent) => void",
      optional: true,
      moTa: PROP_VI.onChange.moTa,
      useCase: PROP_VI.onChange.useCase,
      category: "action",
    },
    {
      name: "className",
      type: "string",
      optional: true,
      moTa: PROP_VI.className.moTa,
      useCase: PROP_VI.className.useCase,
      category: "native",
    },
  ],
};

/** @type {Record<string, { intro: string, useCases: string[] }>} */
export const COMPONENT_VI = {
  Badge: {
    intro: "Nhãn nhỏ (pill) hiển thị trạng thái, phân loại hoặc số lượng.",
    useCases: [
      "`default` / `secondary`: phân loại trung tính.",
      "`success`: hoàn thành, active, approved.",
      "`destructive`: lỗi, rejected, cancelled.",
      "`outline`: trên nền đậm hoặc trong table cell.",
    ],
  },
  Button: {
    intro: "Nút hành động chính — submit form, mở dialog, navigate.",
    useCases: [
      "Một primary action rõ ràng mỗi vùng (PageContainer `extra`).",
      "`destructive` chỉ cho hành động không hoàn tác — kèm DialogConfirm.",
      "`ghost`/`link` cho action phụ trong table row.",
    ],
  },
  CardStat: {
    intro: "Tile KPI compact — label + value + hint/delta.",
    useCases: [
      "Dashboard ops: đơn hôm nay, SLA, backlog.",
      "`delta` cho xu hướng (+/-) so kỳ trước.",
      '`size="compact"` mặc định — xếp hàng KPI.',
    ],
  },
  DialogConfirm: {
    intro: "Dialog xác nhận có sẵn footer Cancel/Confirm.",
    useCases: [
      "Controlled `open` + `onOpenChange` — mở từ Button parent.",
      "`onConfirm` async + `pending` — chặn double submit.",
      "`confirmPhrase` cho delete tenant / dữ liệu nhạy cảm.",
    ],
  },
  Input: {
    intro: "Text input một dòng — extends native `<input>`.",
    useCases: [
      "Luôn qua FormField khi có label/validation.",
      "Controlled: `value` + `onChange` với react-hook-form.",
    ],
  },
  PageContainer: {
    intro: "Wrapper bắt buộc mọi trang admin — title, extra, footer.",
    useCases: [
      "List page: title + nút Create trong `extra`.",
      "Detail page: `footer` Save/Cancel sticky.",
    ],
  },
  DataTable: {
    intro: "Bảng dữ liệu với sort, select, density.",
    useCases: [
      "Server pagination: parent giữ page state, truyền `data`.",
      "`onRowClick` navigate detail; `selectable` cho bulk delete.",
    ],
  },
  EmptyState: {
    intro: "Placeholder khi chưa có dữ liệu.",
    useCases: [
      "List rỗng lần đầu — CTA tạo mới trong `action`.",
      "Filter không match — copy khác default empty.",
    ],
  },
};

/** Mô tả sub-component (compound primitive) — tiếng Việt */
/** @type {Record<string, { intro: string, useCase: string }>} */
export const SUBCOMPONENT_VI = {
  // Card family
  CardCover: {
    intro: "Media full-bleed phía trên card — ảnh cover, banner.",
    useCase: "Luôn là **child đầu tiên** của `Card`; header nằm dưới cover.",
  },
  CardHeader: {
    intro: "Vùng header card — title, description, actions.",
    useCase: "`banded={true}`: nền muted + border-bottom như section band.",
  },
  CardTitle: {
    intro: "Heading `<h3>` trong card.",
    useCase: "Tiêu đề card; CardStat dùng cho số KPI (`text-2xl`).",
  },
  CardDescription: {
    intro: "Dòng mô tả phụ trong header.",
    useCase: "CardStat: render `label` KPI; card thường: subtitle ngắn.",
  },
  CardAction: {
    intro: "Slot action góc header (menu, nút).",
    useCase: 'Pair với `CardHeader className="flex flex-row items-start justify-between"`.',
  },
  CardContent: {
    intro: "Body chính của card.",
    useCase: "`flush`: table full-bleed; `solo`: không header phía trên; `tight`: sát header/tabs.",
  },
  CardFooter: {
    intro: "Footer card — actions hoặc summary.",
    useCase: "`separated`: border-top + band actions; `flush`: full-bleed action bar.",
  },
  // Alert family
  AlertTitle: { intro: "Tiêu đề alert.", useCase: "Dòng đậm đầu banner — tóm tắt lỗi/thông báo." },
  AlertContent: { intro: "Wrapper nội dung alert.", useCase: "Bọc Description + Actions." },
  AlertDescription: { intro: "Body text alert.", useCase: "Chi tiết lỗi, hướng dẫn khắc phục." },
  AlertActions: { intro: "Slot nút/link trong alert.", useCase: "Retry, Dismiss, link docs." },
  // Dialog family
  DialogTrigger: {
    intro: "Nút/element mở dialog.",
    useCase: "`asChild` + Button — Radix trigger pattern.",
  },
  DialogContent: { intro: "Panel modal — focus trap.", useCase: "Bọc Header + body + Footer." },
  DialogHeader: { intro: "Vùng title + description.", useCase: "Luôn đặt đầu `DialogContent`." },
  DialogTitle: { intro: "Tiêu đề dialog (accessible).", useCase: "Radix Title — screen reader." },
  DialogDescription: { intro: "Mô tả dialog.", useCase: "Giải thích hậu quả action confirm." },
  DialogFooter: {
    intro: "Footer nút Cancel/Confirm.",
    useCase: "Mode confirm: `DialogCancel` + `DialogAction`.",
  },
  DialogCancel: { intro: "Nút hủy preset.", useCase: "Đóng dialog không submit." },
  DialogAction: { intro: "Nút xác nhận preset.", useCase: "Submit form hoặc confirm destructive." },
  // Table family
  TableHeader: { intro: "`<thead>` wrapper.", useCase: "Chứa một `TableRow` header." },
  TableBody: { intro: "`<tbody>` wrapper.", useCase: "Các dòng dữ liệu." },
  TableRow: { intro: "Một dòng table.", useCase: "Header row hoặc data row." },
  TableHead: { intro: "`<th>` cell.", useCase: "Tiêu đề cột — sortable nếu parent hỗ trợ." },
  TableCell: { intro: "`<td>` cell.", useCase: "Nội dung ô dữ liệu." },
  // Tabs
  TabsList: { intro: "Thanh tab triggers.", useCase: "Chứa các `TabsTrigger`." },
  TabsTrigger: { intro: "Nút chọn tab.", useCase: "`value` khớp `TabsContent value`." },
  TabsContent: { intro: "Panel nội dung tab.", useCase: "Mount khi tab active." },
  // Select / Command / Sheet / Dropdown — generic
  SelectTrigger: { intro: "Nút mở dropdown select.", useCase: "Hiển thị giá trị đang chọn." },
  SelectContent: { intro: "Panel options.", useCase: "Portal — z-index cao." },
  SelectGroup: { intro: "Nhóm options trong Select.", useCase: "Label nhóm — optional separator." },
  SelectValue: { intro: "Hiển thị label đã chọn.", useCase: "Placeholder khi chưa chọn." },
  CommandInput: { intro: "Search trong command palette.", useCase: "Filter options realtime." },
  CommandList: { intro: "Danh sách kết quả.", useCase: "Scroll area options." },
  CommandItem: { intro: "Một item selectable.", useCase: "onSelect callback." },
  CommandEmpty: { intro: "Empty state command.", useCase: "Không match filter." },
  SheetTrigger: { intro: "Mở sheet panel.", useCase: "Tương tự DialogTrigger." },
  SheetContent: {
    intro: "Panel trượt từ cạnh màn hình.",
    useCase: "Filter mobile, detail drawer.",
  },
  SheetHeader: { intro: "Header sheet.", useCase: "Title + description." },
  SheetTitle: { intro: "Tiêu đề sheet.", useCase: "Accessibility title." },
  SheetDescription: { intro: "Mô tả sheet.", useCase: "Context ngắn." },
  SheetFooter: { intro: "Footer actions sheet.", useCase: "Submit/Cancel." },
  DropdownMenuTrigger: { intro: "Nút mở menu.", useCase: "Icon ⋮ overflow actions." },
  DropdownMenuContent: { intro: "Panel menu items.", useCase: "Align start/end tùy context." },
  DropdownMenuItem: { intro: "Một menu item.", useCase: "onSelect — navigate hoặc action." },
  FilterGroup: { intro: "Nhóm filter trong FilterBar.", useCase: "Label + slot controls con." },
  RadioGroupRoot: {
    intro: "Root radio group — single select.",
    useCase: "`defaultValue` hoặc controlled `value`.",
  },
  RadioItem: { intro: "Một radio option.", useCase: "`value` bắt buộc; đặt trong RadioGroupRoot." },
  SkeletonCard: { intro: "Skeleton layout card.", useCase: "Loading thay Card thật." },
  SkeletonTable: { intro: "Skeleton bảng.", useCase: "Loading DataTable." },
  SkeletonRows: { intro: "Skeleton nhiều dòng.", useCase: "List loading." },
  SkeletonDetail: { intro: "Skeleton trang detail.", useCase: "KeyValue + sections loading." },
  Toaster: { intro: "Mount point Sonner toast.", useCase: "Đặt một lần ở App root." },
};

/** @param {string} subName @param {string} [jsdoc] @returns {{ intro: string, useCase: string }} */
export function guideForSubComponent(subName, jsdoc = "") {
  if (SUBCOMPONENT_VI[subName]) return SUBCOMPONENT_VI[subName];
  if (jsdoc) {
    return {
      intro: jsdoc,
      useCase: `Dùng cùng component cha — xem demo và cấu trúc JSX bên dưới.`,
    };
  }
  return {
    intro: `${subName} — phần con của compound primitive.`,
    useCase: "Import cùng package với component cha; compose theo thứ tự trong demo.",
  };
}

/** @param {string} propName @param {string} [englishDesc] @returns {PropGuide} */
export function guideForProp(propName, englishDesc = "") {
  if (PROP_VI[propName]) return PROP_VI[propName];
  if (propName.startsWith("on") && propName.length > 2) {
    return {
      moTa: `Callback khi sự kiện \`${propName}\` xảy ra.`,
      useCase: "Gắn handler để phản hồi tương tác user — xem demo live bên dưới.",
      category: "action",
    };
  }
  if (englishDesc) {
    return {
      moTa: englishDesc,
      useCase: "Xem demo và source component để biết ngữ cảnh cụ thể.",
      category: "data",
    };
  }
  return {
    moTa: `Prop \`${propName}\`.`,
    useCase: "Tham chiếu type trong source `src/props/` hoặc component.",
    category: "data",
  };
}

/** @param {string} componentName @param {string} groupKey @returns {{ intro: string, useCases: string[] }} */
export function guideForComponent(componentName, groupKey) {
  if (COMPONENT_VI[componentName]) return COMPONENT_VI[componentName];
  const group = GROUP_VI[groupKey];
  if (group) {
    return { intro: `${componentName} — ${group.intro}`, useCases: group.useCases };
  }
  return {
    intro: `${componentName} — primitive UI từ @godxjp/ui.`,
    useCases: ["Xem demo live bên dưới để biết variants và states hỗ trợ."],
  };
}
