import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Avatar } from "../components/primitives/Avatar";
import { Badge } from "../components/primitives/Badge";
import {
  AgendaView,
  CalendarSidebar,
  CalendarTopbar,
  CreateEventDialog,
  DayView,
  EventDetailPanel,
  FindATimePanel,
  MonthView,
  WeekView,
} from "../components/composites/calendar";
import { ymd, type CalendarEvent } from "../components/primitives/calendar";
import {
  ASAGI_ACCENT,
  ASAGI_ACCENT_SOFT,
  AVAILABILITY,
  CALENDARS,
  EVENTS,
  PEOPLE,
  TODAY,
} from "./calendar-fixtures";

const meta: Meta = {
  title: "Screens/Calendar",
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Full-page calendar artboards composed from the calendar primitive + composite layers. The accent color is the consumer-set `--accent-color` (here `浅葱` asagi teal); per cardinal rule #19 the SDK ships no service-specific token.",
      },
    },
  },
};
export default meta;
type Story = StoryObj;

const VIEW_OPTIONS = [
  { value: "month", label: "Tháng" },
  { value: "week", label: "Tuần" },
  { value: "day", label: "Ngày" },
  { value: "agenda", label: "Lịch trình" },
] as const;
type ViewKey = (typeof VIEW_OPTIONS)[number]["value"];

const SIDEBAR_LABELS = {
  createEvent: "Tạo sự kiện",
  searchPeople: "Tìm người để xem lịch",
  monthLabel: "5月 2026",
  addCalendar: "Thêm lịch của người khác",
  sections: {
    mine: "Lịch của tôi",
    org: "Tổ chức",
    shared: "Chia sẻ & ngày lễ",
  },
};

const CALENDAR_FRAME_STYLE: React.CSSProperties = {
  ["--accent-color" as never]: ASAGI_ACCENT,
  ["--accent-color-soft" as never]: ASAGI_ACCENT_SOFT,
  width: 1440,
  height: 900,
  background: "var(--background)",
  color: "var(--foreground)",
};

function CalendarFrame({
  view,
  selectedEventId,
  withDetail,
  initialView,
}: {
  view: ViewKey;
  selectedEventId?: string;
  withDetail?: boolean;
  initialView?: ViewKey;
}) {
  const [currentView, setCurrentView] = useState<ViewKey>(initialView ?? view);
  const [selected, setSelected] = useState<{ y: number; m: number; d: number }>({
    ...TODAY,
  });
  const [calendars, setCalendars] = useState(CALENDARS);
  const [eventOpen, setEventOpen] = useState<string | null>(selectedEventId ?? null);

  const toggleCal = (id: string) =>
    setCalendars((cs) => cs.map((c) => (c.id === id ? { ...c, shown: !c.shown } : c)));

  const eventDots: Record<string, boolean> = {};
  for (const e of EVENTS) eventDots[e.date] = true;

  const title = (() => {
    if (currentView === "month") return "Tháng 5, 2026";
    if (currentView === "week") return "18 – 24 tháng 5";
    if (currentView === "day") return `${selected.d}/5/2026 · Thứ tư`;
    return "Sắp tới";
  })();

  const ev = eventOpen ? EVENTS.find((e) => e.id === eventOpen) : null;

  return (
    <div className="cal-frame" style={CALENDAR_FRAME_STYLE}>
      <CalendarTopbar<ViewKey>
        sticker="暦"
        productName="Koyomi"
        tenant="Famgia"
        titleMain={title}
        views={[...VIEW_OPTIONS]}
        view={currentView}
        onChangeView={setCurrentView}
        todayLabel="Hôm nay"
        searchPlaceholder="Tìm sự kiện…"
        searchKbd="⌘K"
        onToday={() => setSelected({ ...TODAY })}
        avatar={
          <Avatar size={32} color="var(--wa-ruri)" textColor="white">
            YT
          </Avatar>
        }
      />
      <div className="cal-body">
        <CalendarSidebar
          today={TODAY}
          selected={selected}
          miniMonthYear={2026}
          miniMonthMonth={5}
          calendars={calendars}
          eventDots={eventDots}
          labels={SIDEBAR_LABELS}
          groupOrder={["mine", "org", "shared"]}
          onSelectDate={setSelected}
          onToggleCalendar={toggleCal}
          onAddCalendar={() => undefined}
        />

        {currentView === "month" && (
          <MonthView
            today={TODAY}
            selected={selected}
            events={EVENTS}
            calendars={calendars}
            locale="vi"
            onPickEvent={(e) => setEventOpen(e.id)}
          />
        )}
        {currentView === "week" && (
          <WeekView
            today={TODAY}
            selected={selected}
            events={EVENTS}
            calendars={calendars}
            locale="vi"
            selectedEventId={eventOpen}
            onPickEvent={(e) => setEventOpen(e.id)}
            tzLabel="GMT+09 · Tokyo"
            nowOverride={new Date(2026, 4, 20, 16, 7)}
          />
        )}
        {currentView === "day" && (
          <DayView
            today={TODAY}
            selected={selected}
            events={EVENTS}
            calendars={calendars}
            locale="vi"
            selectedEventId={eventOpen}
            onPickEvent={(e) => setEventOpen(e.id)}
            todayLabel="Hôm nay"
            formatEventCount={(n) => `${n} sự kiện`}
            nowOverride={new Date(2026, 4, 20, 16, 7)}
          />
        )}
        {currentView === "agenda" && (
          <AgendaView
            today={TODAY}
            selected={selected}
            events={EVENTS}
            calendars={calendars}
            people={PEOPLE}
            locale="vi"
            onPickEvent={(e) => setEventOpen(e.id)}
          />
        )}

        {withDetail && ev && (
          <EventDetailPanel
            event={ev}
            calendar={calendars.find((c) => c.id === ev.calId)}
            people={PEOPLE}
            labels={{
              joinMeeting: "Tham gia cuộc họp",
              attendeesSummary: (count, acc) =>
                `${count} người tham dự · ${acc} đã xác nhận`,
              addPerson: "Thêm người",
              rsvpQuestion: "Bạn sẽ tham dự?",
              rsvpYes: "Có",
              rsvpMaybe: "Có thể",
              rsvpNo: "Không",
              selfLabel: "(bạn)",
              organizerLabel: "Người tổ chức",
              whenSubtitle: "Thứ tư, 20 tháng 5, 2026 · GMT+09",
              allDay: "Cả ngày",
              statusLabels: {
                accepted: "Đã nhận",
                tentative: "Tạm thời",
                declined: "Từ chối",
                organizer: "Người tổ chức",
              },
            }}
            description={
              <div style={{ fontSize: 12.5, lineHeight: 1.6 }}>
                <p style={{ margin: 0 }}>Demo onboarding flow mới cho Tempo VN:</p>
                <ul style={{ margin: "6px 0 0 18px", padding: 0 }}>
                  <li>SSO setup &amp; SAML cert handover</li>
                  <li>勤怠 import từ Misoca CSV</li>
                  <li>Multi-tenant billing — câu hỏi của Kenji</li>
                </ul>
                <p style={{ margin: "10px 0 0", color: "var(--muted-foreground)", fontSize: 11.5 }}>
                  📎 onboarding-tempo-v3.pdf · 1.2 MB
                </p>
              </div>
            }
            notifications={
              <div className="col" style={{ gap: 4, fontSize: 12.5 }}>
                <div>30 phút trước · Push + Email</div>
                <div>10 phút trước · Push</div>
              </div>
            }
            onClose={() => setEventOpen(null)}
          />
        )}
      </div>
    </div>
  );
}

export const Week: Story = {
  name: "Week",
  render: () => <CalendarFrame view="week" selectedEventId="e-124" />,
};

export const Month: Story = {
  name: "Month",
  render: () => <CalendarFrame view="month" />,
};

export const Day: Story = {
  name: "Day",
  render: () => <CalendarFrame view="day" />,
};

export const DayWithDetail: Story = {
  name: "DayWithDetail",
  render: () => <CalendarFrame view="day" withDetail selectedEventId="e-124" />,
};

export const Agenda: Story = {
  name: "Agenda",
  render: () => <CalendarFrame view="agenda" />,
};

export const CreateEvent: Story = {
  name: "CreateEvent",
  render: () => {
    const [attendees, setAttendees] = useState(
      ["yuki", "kenji", "satoshi"]
        .map((id) => PEOPLE.find((p) => p.id === id))
        .filter((p): p is (typeof PEOPLE)[number] => Boolean(p)),
    );
    const fadedBackdrop: React.CSSProperties = {
      filter: "blur(2px) saturate(.6)",
      opacity: 0.7,
      pointerEvents: "none",
    };
    return (
      <div
        style={{
          ...CALENDAR_FRAME_STYLE,
          position: "relative",
          width: 1280,
          height: 840,
        }}
      >
        <CalendarTopbar<ViewKey>
          sticker="暦"
          productName="Koyomi"
          tenant="Famgia"
          titleMain="Tháng 5, 2026"
          views={[...VIEW_OPTIONS]}
          view="week"
          onChangeView={() => undefined}
          todayLabel="Hôm nay"
          searchPlaceholder="Tìm sự kiện…"
          searchKbd="⌘K"
          avatar={
            <Avatar size={32} color="var(--wa-ruri)" textColor="white">
              YT
            </Avatar>
          }
        />
        <div className="cal-body" style={fadedBackdrop}>
          <CalendarSidebar
            today={TODAY}
            selected={TODAY}
            miniMonthYear={2026}
            miniMonthMonth={5}
            calendars={CALENDARS}
            labels={SIDEBAR_LABELS}
            groupOrder={["mine", "org", "shared"]}
          />
          <WeekView
            today={TODAY}
            selected={TODAY}
            events={EVENTS}
            calendars={CALENDARS}
            locale="vi"
            nowOverride={new Date(2026, 4, 20, 16, 7)}
          />
        </div>
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "color-mix(in oklch, oklch(20% 0.006 60) 25%, transparent)",
            display: "grid",
            placeItems: "center",
            padding: 24,
          }}
        >
          <CreateEventDialog
            initialTitle="Demo onboarding · Tempo Vietnam"
            initialCalendarId="godx-prod"
            tabs={[
              { id: "event", label: "Sự kiện" },
              { id: "task", label: "Việc cần làm" },
              { id: "focus", label: "Focus time" },
              { id: "ooo", label: "Vắng mặt" },
            ]}
            calendars={CALENDARS}
            attendees={attendees}
            whenDate="Thứ tư, 20/5/2026"
            whenStart="15:00"
            whenEnd="16:00"
            descriptionDefault="Onboarding kick-off cho Tempo Vietnam — SSO + 勤怠 import + billing setup."
            notificationsList={
              <>
                <div className="row gap-2">
                  <Badge variant="info">
                    <span className="dot" />
                    10p
                  </Badge>
                  <span>Push + Email</span>
                </div>
                <div className="row gap-2">
                  <Badge variant="info">
                    <span className="dot" />
                    1h
                  </Badge>
                  <span>Push</span>
                </div>
              </>
            }
            labels={{
              repeatOptions: [
                { value: "none", label: "Không lặp lại" },
                { value: "daily", label: "Hàng ngày" },
                { value: "weekly", label: "Hàng tuần · thứ 4" },
                { value: "biweekly", label: "Mỗi 2 tuần" },
                { value: "monthly", label: "Hàng tháng" },
              ],
              whenFromLabel: "từ",
              whenToLabel: "đến",
              allDay: "Cả ngày",
              locationPlaceholder: "Thêm địa điểm hoặc URL",
              createMeet: "Tạo Meet",
              attendeesPlaceholder: "Thêm người, tài nguyên…",
              findATime: "Tìm khung giờ",
              attendeesSummary: "3 người · tất cả đều rảnh",
              detailsButton: "Chi tiết khác…",
              cancel: "Huỷ",
              save: "Lưu sự kiện",
              rail: {
                saveTo: "Lưu vào lịch",
                showAs: "Hiển thị là",
                showAsBusy: "Bận",
                showAsFree: "Rảnh",
                notifications: "Thông báo",
                addNotification: "Thêm thông báo",
                guestPermissions: "Quyền của khách mời",
                permissionEdit: "Sửa sự kiện",
                permissionInvite: "Mời người khác",
                permissionGuestList: "Xem danh sách khách",
                helpTitle: "godx-admin · Product",
                helpBody: (name) => (
                  <>
                    Sự kiện này sẽ hiển thị cho tất cả thành viên trong{" "}
                    <b>{name}</b>. Đặt lịch ở "Cá nhân" nếu bạn muốn riêng tư.
                  </>
                ),
              },
            }}
            onRemoveAttendee={(id) =>
              setAttendees((arr) => arr.filter((p) => p.id !== id))
            }
          />
        </div>
      </div>
    );
  },
};

export const FindATime: Story = {
  name: "FindATime",
  render: () => {
    const [range, setRange] = useState<[number, number] | null>([10, 12]);
    return (
      <div
        style={{
          ...CALENDAR_FRAME_STYLE,
          padding: 24,
          width: 1100,
          height: 720,
          background: "#f0eee9",
          display: "grid",
          placeItems: "stretch",
        }}
      >
        <FindATimePanel
          people={PEOPLE}
          availability={AVAILABILITY}
          hours={Array.from({ length: 9 }, (_, i) => 9 + i)}
          selectedRange={range}
          onChangeRange={setRange}
          labels={{
            title: "Tìm khung giờ",
            subtitle: "Thứ tư · 20/5/2026 · GMT+09",
            peopleCol: "Người tham dự",
            peopleCount: (n) => `${n} người`,
            durationLabel: "30 phút",
            expandHours: "Mở rộng giờ làm việc",
            apply: "Áp dụng khung giờ",
            suggestionsLabel: "☆ Gợi ý — khung giờ tất cả đều rảnh",
            legendBusy: "Bận",
            legendTentative: "Tạm thời",
            legendFree: "Rảnh",
            workingHours: "9:00 → 18:00 · giờ làm việc",
          }}
          suggestions={[
            { id: "a", label: "14:00 – 14:30", meta: "7 người", range: [10, 11] },
            { id: "b", label: "14:00 – 15:00", meta: "7 người", best: true, range: [10, 12] },
            { id: "c", label: "16:30 – 17:00", meta: "7 người" },
            { id: "d", label: "Mai · 10:00", meta: "6 người" },
            { id: "e", label: "Mai · 13:00", meta: "7 người" },
            { id: "f", label: "Thứ 6 · 15:00", meta: "7 người" },
          ]}
        />
      </div>
    );
  },
};
