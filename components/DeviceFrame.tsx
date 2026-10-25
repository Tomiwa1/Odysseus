"use client";

import { useCallback, useEffect, useState } from "react";

/* iPhone 15 Pro Max, at its real logical size: 430 × 932 pt.
   The app runs in an iframe at exactly that width, so this is the true
   mobile layout — and it is the view we design in, not a check at the end. */
const SCREEN_W = 430;
const SCREEN_H = 932;
const BEZEL = 13;
/* iOS reserves the top strip for the status bar, so the app viewport starts
   below it — without this the Dynamic Island sits on the product. */
const STATUS_H = 59;

const screens: [string, string][] = [
  ["Landing", "/"],
  ["Upload CV", "/start"],
  ["Question", "/question"],
  ["Today", "/today"],
  ["Job", "/job"],
  ["Prepare", "/prepare"],
  ["Pipeline", "/pipeline"],
  ["Profile", "/profile"],
];

type Zoom = "fit" | 1 | 1.25 | 1.5;
const ZOOMS: [Zoom, string][] = [["fit", "Fit"], [1, "100%"], [1.25, "125%"], [1.5, "150%"]];

export default function DeviceFrame() {
  const [path, setPath] = useState("/start");
  const [zoom, setZoom] = useState<Zoom>(1);
  const [fit, setFit] = useState(1);

  const measure = useCallback(() => {
    const avail = window.innerHeight - 96;
    setFit(Math.min(1.6, avail / (SCREEN_H + BEZEL * 2)));
  }, []);

  useEffect(() => {
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [measure]);

  const scale = zoom === "fit" ? fit : zoom;

  return (
    <div className="stage">
      <div className="stage-bar">
        <span className="stage-k">iPhone 15 Pro Max · 430 × 932</span>

        <div className="stage-controls">
          <div className="stage-tabs">
            {screens.map(([label, href]) => (
              <button
                key={href}
                type="button"
                className="stage-tab"
                aria-pressed={path === href}
                onClick={() => setPath(href)}
              >
                {label}
              </button>
            ))}
          </div>
          <span className="stage-sep" />
          <div className="stage-tabs">
            {ZOOMS.map(([z, label]) => (
              <button
                key={String(z)}
                type="button"
                className="stage-tab stage-tab--zoom"
                aria-pressed={zoom === z}
                onClick={() => setZoom(z)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="stage-floor">
        {/* the slot takes the scaled size so the frame can be scrolled when
            it is bigger than the window, instead of being clipped */}
        <div
          className="device-slot"
          style={{
            width: (SCREEN_W + BEZEL * 2) * scale,
            height: (SCREEN_H + BEZEL * 2) * scale,
          }}
        >
          <div
            className="device"
            style={{
              width: SCREEN_W + BEZEL * 2,
              height: SCREEN_H + BEZEL * 2,
              transform: `scale(${scale})`,
            }}
          >
            <span className="device-btn device-silent" />
            <span className="device-btn device-vol-up" />
            <span className="device-btn device-vol-dn" />
            <span className="device-btn device-power" />

            <div className="device-screen" style={{ width: SCREEN_W, height: SCREEN_H }}>
              <div className="device-status" style={{ height: STATUS_H }} aria-hidden="true">
                <span className="device-time">9:41</span>
                <span className="device-meta">
                  <svg width="18" height="12" viewBox="0 0 18 12" fill="currentColor">
                    <rect x="0" y="8" width="3" height="4" rx="1" />
                    <rect x="5" y="5.5" width="3" height="6.5" rx="1" />
                    <rect x="10" y="3" width="3" height="9" rx="1" />
                    <rect x="15" y="0" width="3" height="12" rx="1" />
                  </svg>
                  <svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor">
                    <path d="M8 11.4 5.6 8.8a3.6 3.6 0 0 1 4.8 0L8 11.4Zm0-5.6a6.4 6.4 0 0 0-4.5 1.8L1.8 5.9a9 9 0 0 1 12.4 0l-1.7 1.7A6.4 6.4 0 0 0 8 5.8Z" />
                  </svg>
                  <svg width="26" height="12" viewBox="0 0 26 12" fill="none">
                    <rect x=".6" y=".6" width="21" height="10.8" rx="3" stroke="currentColor" strokeOpacity=".4" strokeWidth="1.1" />
                    <rect x="2.2" y="2.2" width="15" height="7.6" rx="1.8" fill="currentColor" />
                    <path d="M23.4 4.2v3.6a2 2 0 0 0 0-3.6Z" fill="currentColor" fillOpacity=".4" />
                  </svg>
                </span>
              </div>

              <iframe
                key={path}
                src={path}
                title={`Odysseus on iPhone · ${path}`}
                width={SCREEN_W}
                height={SCREEN_H - STATUS_H}
                style={{ border: 0, display: "block" }}
              />
              <span className="device-island" aria-hidden="true" />
              <span className="device-home" aria-hidden="true" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
