"use client";

import React from "react";

type EventType =
  | "Earnings Calls"
  | "Conference"
  | "Shareholder Meeting"
  | "Other";

const tagColors: Record<EventType, string> = {
  "Earnings Calls": "bg-blue-100 text-blue-800",
  Conference: "bg-yellow-100 text-yellow-800",
  "Shareholder Meeting": "bg-teal-100 text-teal-800",
  Other: "bg-pink-100 text-pink-800",
};

export function EventTypeTag({ type }: { type: EventType }) {
  return (
    <span
      className={`inline-flex items-center text-ellipsis text-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ${tagColors[type]}`}
    >
      {type}
    </span>
  );
}
