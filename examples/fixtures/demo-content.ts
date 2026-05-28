/** Demo domain data for preview examples. */

export const customers = [
  {
    id: "cust_01k8m2x",
    name: "Nguyễn Thị Mai",
    email: "mai.nguyen@shop-vn.com",
    phone: "+84 90 812 3456",
    channel: "Website",
    orders: 47,
    lastOrder: "2026-05-20",
    status: "active",
    tags: ["VIP", "Wholesale"],
  },
  {
    id: "cust_01k8n7p",
    name: "Tanaka Yuki",
    email: "yuki.tanaka@example.co.jp",
    phone: "+81 90 1234 5678",
    channel: "Facebook",
    orders: 12,
    lastOrder: "2026-05-18",
    status: "pending",
    tags: ["Retail"],
  },
  {
    id: "cust_01k8q3a",
    name: "Lê Hoàng Nam",
    email: "nam.le@gmail.com",
    phone: "+84 91 555 8899",
    channel: "Website",
    orders: 3,
    lastOrder: "2026-05-02",
    status: "cancelled",
    tags: [],
  },
  {
    id: "cust_01k8r9f",
    name: "Phạm Minh Đức",
    email: "duc.pham@example.com",
    phone: "+84 93 210 9876",
    channel: "Website",
    orders: 128,
    lastOrder: "2026-05-22",
    status: "active",
    tags: ["VIP", "Bulk buyer"],
  },
  {
    id: "cust_01k8s1k",
    name: "佐藤 花子",
    email: "hanako.sato@yahoo.co.jp",
    phone: "+81 80 9876 5432",
    channel: "Line",
    orders: 8,
    lastOrder: "2026-05-15",
    status: "sending",
    tags: ["Corporate"],
  },
] as const;

export const shipments = [
  {
    id: "ORD-2026-8842",
    hawb: "REF-00991",
    customer: "Nguyễn Thị Mai",
    route: "Osaka → HCM",
    weight: "2.4 kg",
    pieces: 3,
    declared: "¥ 48,600",
    status: "sending",
    warehouse: "Acme Osaka",
  },
  {
    id: "ORD-2026-8831",
    hawb: "REF-00988",
    customer: "Tanaka Yuki",
    route: "Tokyo → Đà Nẵng",
    weight: "0.8 kg",
    pieces: 1,
    declared: "¥ 12,400",
    status: "pending",
    warehouse: "Acme Tokyo",
  },
  {
    id: "ORD-2026-8805",
    hawb: "REF-00972",
    customer: "Phạm Minh Đức",
    route: "Yokohama → Hà Nội",
    weight: "18.2 kg",
    pieces: 12,
    declared: "¥ 312,000",
    status: "delivered",
    warehouse: "Acme Yokohama",
  },
] as const;

export const customerDetail = {
  id: "cust_01k8m2x",
  name: "Nguyễn Thị Mai",
  email: "mai.nguyen@shop-vn.com",
  phone: "+84 90 812 3456",
  zaloId: "zalo_8847291",
  address: "Quận 1, TP. Hồ Chí Minh, Việt Nam",
  memberSince: "2024-03-12",
  totalSpent: "¥ 2,847,300",
  openOrders: 2,
  note: "Khách VIP — ưu tiên đặt hàng số lượng lớn. Thường đặt theo lô cuối tuần. Liên hệ trước 17h JST.",
} as const;

export const hawbDetail = {
  hawb: "REF-00991",
  mawb: "131-48291044",
  origin: "Osaka",
  destination: "HCM",
  carrier: "Acme Express · Route B",
  etd: "2026-05-24 09:30 JST",
  eta: "2026-05-25 14:00 ICT",
  customsStatus: "pending",
  items: "Quần áo (3), Phụ kiện (2), Sách (1)",
} as const;

export const crmNotes = [
  {
    at: "2026-05-22 15:40",
    author: "Hương (CS)",
    text: "Khách xác nhận địa chỉ giao hàng mới tại Q.1 — cập nhật trước khi xử lý đơn 8842.",
  },
  {
    at: "2026-05-20 11:05",
    author: "Ken (Ops)",
    text: "Đơn #3 cần xác nhận thêm thông tin sản phẩm — đã tạm giữ, chờ khách phản hồi.",
  },
  { at: "2026-05-18 09:22", author: "System", text: "Tự động gán tag VIP sau 40 đơn thành công." },
] as const;

export const campaignStats = {
  sent: 12_480,
  opened: 4_912,
  clicked: 892,
  bounced: 23,
} as const;
