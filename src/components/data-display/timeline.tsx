import type { ReactNode } from "react";
import { CheckCircle2, Plane } from "lucide-react";

export type TimelineItem = {
  title: ReactNode;
  location?: ReactNode;
  time?: ReactNode;
  note?: ReactNode;
  current?: boolean;
};

export type TimelineProps = {
  items: TimelineItem[];
};

export function Timeline({ items }: TimelineProps) {
  return (
    <ol className="ui-timeline">
      {items.map((item, index) => {
        const Icon = item.current ? Plane : CheckCircle2;
        return (
          <li
            className="ui-timeline-item"
            key={index}
            aria-current={item.current ? "step" : undefined}
          >
            <div className="ui-timeline-rail">
              <span className="ui-timeline-dot" data-current={item.current ? "true" : undefined}>
                <Icon aria-hidden="true" />
              </span>
              {index !== items.length - 1 ? <span className="ui-timeline-line" /> : null}
            </div>
            <div className="ui-timeline-body">
              <div className="ui-timeline-head">
                <span className="ui-timeline-title">
                  <span className="sr-only">{item.current ? "Current: " : "Completed: "}</span>
                  {item.title}
                </span>
                {item.time ? <span className="ui-timeline-time">{item.time}</span> : null}
              </div>
              {item.location ? <div className="ui-timeline-location">{item.location}</div> : null}
              {item.note ? <p className="ui-timeline-note">{item.note}</p> : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
