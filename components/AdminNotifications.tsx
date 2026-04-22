"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import type { AdminNotification } from "@/lib/restaurant-data";

type AdminNotificationsProps = {
  adminId: string;
  notifications: AdminNotification[];
};

function getReadStorageKey(adminId: string) {
  return `admin-notifications-read:${adminId}`;
}

function getSoundStorageKey(adminId: string) {
  return `admin-notifications-sound:${adminId}`;
}

function readStoredNotificationIds(adminId: string) {
  if (typeof window === "undefined") {
    return new Set<string>();
  }

  try {
    const rawValue = window.localStorage.getItem(getReadStorageKey(adminId));

    if (!rawValue) {
      return new Set<string>();
    }

    const parsedValue = JSON.parse(rawValue);

    if (!Array.isArray(parsedValue)) {
      return new Set<string>();
    }

    return new Set(
      parsedValue.filter((value): value is string => typeof value === "string"),
    );
  } catch {
    return new Set<string>();
  }
}

function writeStoredNotificationIds(adminId: string, ids: string[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(getReadStorageKey(adminId), JSON.stringify(ids));
}

function readSoundPreference(adminId: string) {
  if (typeof window === "undefined") {
    return true;
  }

  const rawValue = window.localStorage.getItem(getSoundStorageKey(adminId));

  if (rawValue === "off") {
    return false;
  }

  return true;
}

function writeSoundPreference(adminId: string, enabled: boolean) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(getSoundStorageKey(adminId), enabled ? "on" : "off");
}

function playNotificationSound() {
  if (typeof window === "undefined") {
    return;
  }

  const AudioContextClass = window.AudioContext || window.webkitAudioContext;

  if (!AudioContextClass) {
    return;
  }

  const audioContext = new AudioContextClass();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(660, audioContext.currentTime + 0.18);

  gainNode.gain.setValueAtTime(0.0001, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.08, audioContext.currentTime + 0.02);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.22);

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.24);

  oscillator.onended = () => {
    void audioContext.close();
  };
}

export default function AdminNotifications({
  adminId,
  notifications,
}: AdminNotificationsProps) {
  const [open, setOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(() => readSoundPreference(adminId));
  const [readIds, setReadIds] = useState<string[]>(() => {
    const storedIds = readStoredNotificationIds(adminId);

    return notifications
      .map((notification) => notification.id)
      .filter((id) => storedIds.has(id));
  });
  const containerRef = useRef<HTMLDivElement>(null);
  const previousUnreadCountRef = useRef<number | null>(null);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const readIdsSet = useMemo(
    () =>
      new Set(
        readIds.filter((id) =>
          notifications.some((notification) => notification.id === id),
        ),
      ),
    [notifications, readIds],
  );

  const items = useMemo(
    () =>
      notifications.map((notification) => ({
        ...notification,
        unread: !readIdsSet.has(notification.id),
      })),
    [notifications, readIdsSet],
  );

  const unreadCount = items.filter((notification) => notification.unread).length;

  useEffect(() => {
    if (previousUnreadCountRef.current === null) {
      previousUnreadCountRef.current = unreadCount;
      return;
    }

    if (soundEnabled && unreadCount > previousUnreadCountRef.current) {
      playNotificationSound();
    }

    previousUnreadCountRef.current = unreadCount;
  }, [soundEnabled, unreadCount]);

  function markAsRead(notificationId: string) {
    setReadIds((currentIds) => {
      if (currentIds.includes(notificationId)) {
        return currentIds;
      }

      const nextIds = [...currentIds, notificationId];
      writeStoredNotificationIds(adminId, nextIds);

      return nextIds;
    });
  }

  function toggleSound() {
    setSoundEnabled((currentValue) => {
      const nextValue = !currentValue;
      writeSoundPreference(adminId, nextValue);

      return nextValue;
    });
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label="Ouvrir les notifications"
        className="relative flex h-11 w-11 items-center justify-center rounded-full border border-slate-800 bg-slate-900 text-slate-200 transition hover:border-slate-700 hover:text-white"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M15 17h5l-1.4-1.4a2 2 0 0 1-.6-1.4V11a6 6 0 1 0-12 0v3.2a2 2 0 0 1-.6 1.4L4 17h5" />
          <path d="M10 20a2 2 0 0 0 4 0" />
        </svg>

        {unreadCount > 0 ? (
          <span className="absolute -right-1 -top-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-amber-400 px-1.5 text-[11px] font-bold text-slate-950">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 top-full z-30 mt-3 w-[22rem] overflow-hidden rounded-3xl border border-slate-800 bg-slate-950/95 shadow-2xl shadow-black/40 backdrop-blur">
          <div className="border-b border-slate-800 px-5 py-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-white">Notifications</p>
                <p className="mt-1 text-xs text-slate-400">
                  {unreadCount > 0
                    ? `${unreadCount} notification(s) non lue(s)`
                    : "Aucune nouvelle alerte"}
                </p>
              </div>
              <Link
                href="/admin/orders"
                onClick={() => setOpen(false)}
                className="text-xs font-semibold text-amber-300 transition hover:text-amber-200"
              >
                Voir tout
              </Link>
            </div>

            <button
              type="button"
              onClick={toggleSound}
              className="mt-4 inline-flex items-center gap-2 rounded-full border border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:border-slate-600 hover:text-white"
            >
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  soundEnabled ? "bg-emerald-400" : "bg-slate-500"
                }`}
              />
              {soundEnabled ? "Son active" : "Son coupe"}
            </button>
          </div>

          {items.length === 0 ? (
            <div className="px-5 py-8 text-sm text-slate-400">
              Aucune nouvelle commande pour le moment.
            </div>
          ) : (
            <div className="max-h-[24rem] overflow-y-auto p-2">
              {items.map((notification) => (
                <Link
                  key={notification.id}
                  href={notification.href}
                  onClick={() => {
                    markAsRead(notification.id);
                    setOpen(false);
                  }}
                  className="flex gap-3 rounded-2xl px-3 py-3 transition hover:bg-slate-900"
                >
                  <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-300">
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 3v18" />
                      <path d="M3 12h18" />
                    </svg>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm font-semibold text-white">{notification.title}</p>
                      {notification.unread ? (
                        <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-sky-400" />
                      ) : null}
                    </div>
                    <p className="mt-1 text-sm leading-6 text-slate-300">
                      {notification.description}
                    </p>
                    <p className="mt-2 text-xs text-slate-500">
                      {notification.createdAtLabel}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
