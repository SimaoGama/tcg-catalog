"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type CardImageModalProps = {
  frontSrc: string;
  backSrc: string;
  cardName: string;
};

const MIN_SCALE = 1.8;
const MAX_SCALE = 2.6;
const DEFAULT_SCALE = 2;
const WHEEL_STEP = 0.12;

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'area[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'iframe',
  'object',
  'embed',
  '[contenteditable="true"]',
  '[tabindex]:not([tabindex="-1"])',
].join(",");

export default function CardImageModal({
  frontSrc,
  backSrc,
  cardName,
}: CardImageModalProps) {
  const [open, setOpen] = useState(false);
  const [activeSide, setActiveSide] = useState<"front" | "back">("front");
  const [zoomed, setZoomed] = useState(false);
  const [scale, setScale] = useState(DEFAULT_SCALE);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);

  const viewportRef = useRef<HTMLDivElement | null>(null);
  const modalRef = useRef<HTMLDivElement | null>(null);
  const titleIdRef = useRef(`card-image-modal-title-${Math.random().toString(36).slice(2, 10)}`);
  const frontTriggerRef = useRef<HTMLButtonElement | null>(null);
  const backTriggerRef = useRef<HTMLButtonElement | null>(null);
  const lastTriggerRef = useRef<HTMLButtonElement | null>(null);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const offsetStartRef = useRef({ x: 0, y: 0 });
  const preloadDoneRef = useRef(false);

  const activeSrc = activeSide === "front" ? frontSrc : backSrc;

  function resetToNormalView() {
    setZoomed(false);
    setScale(DEFAULT_SCALE);
    setOffset({ x: 0, y: 0 });
    setDragging(false);
  }

  function enterZoomView() {
    setZoomed(true);
    setScale(DEFAULT_SCALE);
    setOffset({ x: 0, y: 0 });
    setDragging(false);
  }

  function toggleDoubleClickZoom() {
    if (zoomed) {
      resetToNormalView();
    } else {
      enterZoomView();
    }
  }

  function resetViewer() {
    resetToNormalView();
  }

  function preloadImages() {
    if (preloadDoneRef.current) return;
    preloadDoneRef.current = true;

    [frontSrc, backSrc].forEach((src) => {
      const img = new window.Image();
      img.src = src;
    });
  }

  function getFocusableElements() {
    if (!modalRef.current) return [];

    return Array.from(
      modalRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
    ).filter((element) => {
      return (
        !element.hasAttribute("disabled") &&
        element.getAttribute("aria-hidden") !== "true" &&
        element.tabIndex !== -1
      );
    });
  }

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (!open) return;

      if (event.key === "Escape") {
        event.preventDefault();
        closeViewer();
        return;
      }

      if (event.key.toLowerCase() === "z") {
        event.preventDefault();
        setZoomed((value) => {
          const next = !value;
          if (!next) {
            setOffset({ x: 0, y: 0 });
            setScale(DEFAULT_SCALE);
          } else {
            setOffset({ x: 0, y: 0 });
            setScale(DEFAULT_SCALE);
          }
          return next;
        });
        return;
      }

      if (event.key === "Tab") {
        const focusable = getFocusableElements();

        if (focusable.length === 0) {
          event.preventDefault();
          modalRef.current?.focus();
          return;
        }

        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        const activeElement = document.activeElement;

        if (event.shiftKey) {
          if (activeElement === first || activeElement === modalRef.current) {
            event.preventDefault();
            last.focus();
          }
        } else {
          if (activeElement === last) {
            event.preventDefault();
            first.focus();
          }
        }
      }
    }

    if (open) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const focusable = getFocusableElements();
    const preferredTarget = focusable[0] ?? modalRef.current;

    window.requestAnimationFrame(() => {
      preferredTarget?.focus();
    });
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const el = viewportRef.current;
    if (!el) return;

    function handleWheel(event: WheelEvent) {
      if (!zoomed) return;

      event.preventDefault();

      const direction = event.deltaY > 0 ? -1 : 1;

      setScale((current) => {
        const next = current + direction * WHEEL_STEP;
        return Math.max(MIN_SCALE, Math.min(MAX_SCALE, next));
      });
    }

    el.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      el.removeEventListener("wheel", handleWheel);
    };
  }, [open, zoomed]);

  function openViewer(side: "front" | "back", trigger: HTMLButtonElement | null) {
    lastTriggerRef.current = trigger;
    setActiveSide(side);
    setOpen(true);
    resetViewer();
  }

  function switchSide(side: "front" | "back") {
    setActiveSide(side);
    resetViewer();
  }

  function closeViewer() {
    setOpen(false);
    resetToNormalView();

    window.requestAnimationFrame(() => {
      lastTriggerRef.current?.focus();
    });
  }

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (!zoomed) return;

    setDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    offsetStartRef.current = { ...offset };
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!zoomed || !dragging) return;

    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;

    setOffset({
      x: offsetStartRef.current.x + dx,
      y: offsetStartRef.current.y + dy,
    });
  }

  function handlePointerUp(e: React.PointerEvent<HTMLDivElement>) {
    if (!zoomed) return;

    setDragging(false);

    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  }

  function toggleZoom() {
    setZoomed((value) => {
      const next = !value;
      if (!next) {
        setOffset({ x: 0, y: 0 });
        setScale(DEFAULT_SCALE);
      } else {
        setOffset({ x: 0, y: 0 });
        setScale(DEFAULT_SCALE);
      }
      return next;
    });
  }

  return (
    <>
      <div className="grid gap-6 md:grid-cols-2">
        <button
          ref={frontTriggerRef}
          type="button"
          onMouseEnter={preloadImages}
          onFocus={preloadImages}
          onClick={() => openViewer("front", frontTriggerRef.current)}
          className="rounded-3xl border border-stone-200 bg-white p-4 text-left shadow-sm transition hover:shadow-md dark:border-stone-800 dark:bg-stone-900"
        >
          <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-white dark:bg-stone-950">
            <Image
              src={frontSrc}
              alt={`${cardName} front`}
              fill
              quality={95}
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-contain"
            />
          </div>
          <p className="mt-3 text-sm text-stone-500 dark:text-stone-400">
            Front image • click to inspect
          </p>
        </button>

        <button
          ref={backTriggerRef}
          type="button"
          onMouseEnter={preloadImages}
          onFocus={preloadImages}
          onClick={() => openViewer("back", backTriggerRef.current)}
          className="rounded-3xl border border-stone-200 bg-white p-4 text-left shadow-sm transition hover:shadow-md dark:border-stone-800 dark:bg-stone-900"
        >
          <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-white dark:bg-stone-950">
            <Image
              src={backSrc}
              alt={`${cardName} back`}
              fill
              quality={95}
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-contain"
            />
          </div>
          <p className="mt-3 text-sm text-stone-500 dark:text-stone-400">
            Back image • click to inspect
          </p>
        </button>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm"
          onClick={closeViewer}
        >
          <div className="flex h-full w-full items-center justify-center p-4 md:p-8">
            <div
              ref={modalRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleIdRef.current}
              tabIndex={-1}
              className="relative w-full max-w-7xl rounded-3xl bg-white p-4 shadow-2xl outline-none dark:bg-stone-900"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2
                    id={titleIdRef.current}
                    className="text-lg font-semibold text-stone-900 dark:text-stone-100"
                  >
                    {cardName}
                  </h2>
                  <p className="text-sm text-stone-500 dark:text-stone-400">
                    {activeSide === "front" ? "Front image" : "Back image"}
                  </p>
                </div>

                <div className="flex items-center gap-2 rounded-full border border-stone-200 bg-stone-50 p-1 dark:border-stone-700 dark:bg-stone-800">
                  <button
                    type="button"
                    onClick={() => switchSide("front")}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                      activeSide === "front"
                        ? "bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900"
                        : "text-stone-600 dark:text-stone-300"
                    }`}
                  >
                    Front
                  </button>
                  <button
                    type="button"
                    onClick={() => switchSide("back")}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                      activeSide === "back"
                        ? "bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900"
                        : "text-stone-600 dark:text-stone-300"
                    }`}
                  >
                    Back
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={toggleZoom}
                    className="rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 hover:border-stone-400 hover:text-stone-950 dark:border-stone-700 dark:text-stone-200 dark:hover:border-stone-500 dark:hover:text-white"
                  >
                    {zoomed ? "Normal view" : "Zoom view"}
                  </button>

                  <button
                    type="button"
                    onClick={closeViewer}
                    className="rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 hover:border-stone-400 hover:text-stone-950 dark:border-stone-700 dark:text-stone-200 dark:hover:border-stone-500 dark:hover:text-white"
                  >
                    Close
                  </button>
                </div>
              </div>

              <div
                ref={viewportRef}
                className={`relative aspect-[3/4] max-h-[80vh] w-full overflow-hidden rounded-2xl bg-stone-50 dark:bg-stone-950 ${
                  zoomed
                    ? dragging
                      ? "cursor-grabbing"
                      : "cursor-grab"
                    : "cursor-zoom-in"
                }`}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                onDoubleClick={toggleDoubleClickZoom}
                aria-label={`${cardName} ${activeSide} enlarged view`}
              >
                <div
                  className="absolute inset-0 transition-transform duration-100 ease-out"
                  style={{
                    transform: zoomed
                      ? `translate(${offset.x}px, ${offset.y}px) scale(${scale})`
                      : "translate(0px, 0px) scale(1)",
                    transformOrigin: "center center",
                  }}
                >
                  <Image
                    src={activeSrc}
                    alt={`${cardName} ${activeSide}`}
                    fill
                    quality={95}
                    sizes="100vw"
                    className="object-contain select-none"
                    draggable={false}
                  />
                </div>
              </div>

              <p className="mt-3 text-sm text-stone-500 dark:text-stone-400">
                {zoomed
                  ? `Drag to inspect details. Scroll to fine-tune zoom (${scale.toFixed(
                      2
                    )}x). Double-click to reset. Press Z to toggle zoom.`
                  : "Double-click or press Z to enter zoom view and inspect corners, borders, and surface details."}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}