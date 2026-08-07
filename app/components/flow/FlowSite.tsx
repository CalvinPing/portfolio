"use client";

import { useEffect, useRef } from "react";

type Key = "home" | "about" | "projects";

const ENTER_SIDE: Record<Key, "left" | "right"> = { home: "right", about: "left", projects: "right" };
const PORTRAIT_ENTER_SIDE: Record<Key, "left" | "right"> = { home: "left", about: "right", projects: "left" };
const PORTRAIT_SIDE: Record<Key, "left" | "right"> = { home: "right", about: "left", projects: "right" };
const MODE: Record<Key, "side" | "orbit"> = { home: "side", about: "side", projects: "orbit" };

export function FlowSite() {
  const navWrapRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const pillRef = useRef<HTMLSpanElement>(null);
  const layoutRef = useRef<HTMLDivElement>(null);
  const hillFarRef = useRef<HTMLDivElement>(null);
  const hillMidRef = useRef<HTMLDivElement>(null);
  const hillNearRef = useRef<HTMLDivElement>(null);
  const orbitRingRef = useRef<HTMLDivElement>(null);
  const orbitPrevRef = useRef<HTMLButtonElement>(null);
  const orbitNextRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const navWrap = navWrapRef.current;
    const nav = navRef.current;
    const pill = pillRef.current;
    const layoutEl = layoutRef.current;
    const orbitRing = orbitRingRef.current;
    const orbitPrev = orbitPrevRef.current;
    const orbitNext = orbitNextRef.current;
    const hillFar = hillFarRef.current;
    const hillMid = hillMidRef.current;
    const hillNear = hillNearRef.current;
    if (
      !navWrap ||
      !nav ||
      !pill ||
      !layoutEl ||
      !orbitRing ||
      !orbitPrev ||
      !orbitNext ||
      !hillFar ||
      !hillMid ||
      !hillNear
    ) {
      return;
    }

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const tabs = [...nav.querySelectorAll<HTMLButtonElement>(".tab")];
    const infoPanels = [...layoutEl.querySelectorAll<HTMLElement>(".info-panel")];
    const portraits = [...layoutEl.querySelectorAll<HTMLImageElement>(".portrait")];
    const hills = [hillFar, hillMid, hillNear];
    const cleanups: Array<() => void> = [];

    let active = tabs[0];

    function movePill(tab: HTMLButtonElement) {
      pill!.style.left = tab.offsetLeft + "px";
      pill!.style.width = tab.offsetWidth + "px";
    }
    movePill(active);

    if (!reduced) {
      tabs.forEach((tab) => {
        const onEnter = () => movePill(tab);
        tab.addEventListener("mouseenter", onEnter);
        cleanups.push(() => tab.removeEventListener("mouseenter", onEnter));
      });
      const onLeave = () => movePill(active);
      nav.addEventListener("mouseleave", onLeave);
      cleanups.push(() => nav.removeEventListener("mouseleave", onLeave));
    }

    function crossfade(
      items: HTMLElement[],
      key: string,
      dataAttr: string,
      dir: "left" | "right",
      exitMs: number,
      onSwap?: () => void
    ) {
      const oldItem = items.find((el) => el.classList.contains("active"));
      const newItem = items.find((el) => el.dataset[dataAttr] === key);
      if (!newItem || newItem === oldItem) return;

      if (reduced || !oldItem) {
        items.forEach((el) => el.classList.remove("active", "enter-left", "enter-right", "exit-left", "exit-right"));
        newItem.classList.add("active");
        onSwap?.();
        return;
      }

      oldItem.classList.remove("enter-left", "enter-right");
      oldItem.classList.add(dir === "right" ? "exit-left" : "exit-right");

      setTimeout(() => {
        items.forEach((el) => el.classList.remove("active", "exit-left", "exit-right", "enter-left", "enter-right"));
        newItem.classList.add("active");
        onSwap?.();
        void newItem.offsetWidth;
        newItem.classList.add(dir === "right" ? "enter-right" : "enter-left");
      }, exitMs);
    }

    // ---- orbit rotation ----
    const orbitItems = [...orbitRing.querySelectorAll<HTMLElement>(".orbit-item")];
    const orbitCards = [...orbitRing.querySelectorAll<HTMLElement>(".orbit-card")];
    const itemCount = orbitItems.length;
    const itemOffsets = orbitItems.map(
      (item) => parseFloat(getComputedStyle(item).getPropertyValue("--angle-offset")) || 0
    );
    let ringAngle = 0;
    let targetAngle: number | null = null;
    let speed = 1;
    let speedTarget = 1;
    let lastT: number | null = null;
    let depthFrame = 0;
    let orbitRunning = false;
    let rafId = 0;

    function updateDepth() {
      orbitItems.forEach((item, i) => {
        const rad = ((ringAngle + itemOffsets[i]) * Math.PI) / 180;
        const front = -Math.cos(rad);
        const scale = 1 + front * 0.14;
        const opacity = 0.8 + ((front + 1) / 2) * 0.2;
        item.style.zIndex = front > 0 ? "3" : "0";
        orbitCards[i].style.setProperty("--depth-scale", scale.toFixed(3));
        orbitCards[i].style.opacity = opacity.toFixed(2);
      });
    }

    function orbitTick(t: number) {
      if (active.dataset.tab !== "projects" || reduced) {
        orbitRunning = false;
        return;
      }
      if (lastT == null) lastT = t;
      const dt = t - lastT;
      lastT = t;

      speed += (speedTarget - speed) * 0.06;
      if (targetAngle !== null) {
        const diff = targetAngle - ringAngle;
        if (Math.abs(diff) < 0.4) {
          ringAngle = targetAngle;
          targetAngle = null;
        } else {
          ringAngle += diff * 0.12;
        }
      } else {
        ringAngle += dt * 0.012 * speed;
      }
      orbitRing!.style.setProperty("--ring-angle", ringAngle + "deg");

      depthFrame = (depthFrame + 1) % 3;
      if (depthFrame === 0) updateDepth();

      rafId = requestAnimationFrame(orbitTick);
    }

    function startOrbit() {
      if (orbitRunning || reduced) return;
      orbitRunning = true;
      lastT = null;
      updateDepth();
      rafId = requestAnimationFrame(orbitTick);
    }

    if (active.dataset.tab === "projects") startOrbit();

    function pauseOrbit() {
      speedTarget = 0;
      orbitRing!.classList.add("paused");
    }
    function resumeOrbit() {
      speedTarget = 1;
      orbitRing!.classList.remove("paused");
    }

    orbitItems.forEach((item) => {
      item.addEventListener("mouseenter", pauseOrbit);
      item.addEventListener("mouseleave", resumeOrbit);
      cleanups.push(() => {
        item.removeEventListener("mouseenter", pauseOrbit);
        item.removeEventListener("mouseleave", resumeOrbit);
      });
    });

    const onPrev = () => {
      targetAngle = (targetAngle !== null ? targetAngle : ringAngle) - 360 / itemCount;
    };
    const onNext = () => {
      targetAngle = (targetAngle !== null ? targetAngle : ringAngle) + 360 / itemCount;
    };
    orbitPrev.addEventListener("click", onPrev);
    orbitNext.addEventListener("click", onNext);
    cleanups.push(() => {
      orbitPrev.removeEventListener("click", onPrev);
      orbitNext.removeEventListener("click", onNext);
    });

    // ---- tab switching ----
    tabs.forEach((tab) => {
      const onClick = () => {
        if (tab === active) return;
        const key = tab.dataset.tab as Key;
        const dir = ENTER_SIDE[key];

        tabs.forEach((t) => t.classList.remove("active"));
        tab.classList.add("active");
        active = tab;
        movePill(tab);

        navWrap!.dataset.projects = key === "projects" ? "true" : "false";
        crossfade(infoPanels, key, "panel", dir, 260, () => {
          layoutEl!.dataset.mode = MODE[key];
          layoutEl!.dataset.portraitSide = PORTRAIT_SIDE[key];
        });
        crossfade(portraits, key, "portrait", PORTRAIT_ENTER_SIDE[key], 320);
        if (key === "projects") startOrbit();

        if (!reduced) {
          const hillDir = dir === "right" ? 1 : -1;
          hills.forEach((hill, i) => {
            hill.style.transform = "translateX(" + hillDir * (10 + i * 6) + "px)";
          });
          setTimeout(() => {
            hills.forEach((hill) => (hill.style.transform = "translateX(0)"));
          }, 500);
        }
      };
      tab.addEventListener("click", onClick);
      cleanups.push(() => tab.removeEventListener("click", onClick));
    });

    const onResize = () => movePill(active);
    window.addEventListener("resize", onResize);
    cleanups.push(() => window.removeEventListener("resize", onResize));

    return () => {
      cleanups.forEach((fn) => fn());
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <>
      <div className="sun" />
      <div className="hill hill-far" ref={hillFarRef} />
      <div className="hill hill-mid" ref={hillMidRef} />
      <div className="hill hill-near" ref={hillNearRef} />

      <div className="stage">
        <div className="nav-wrap">
          <div className="nav" ref={navRef}>
            <span className="pill" ref={pillRef} />
            <button className="tab active" data-tab="home" type="button">
              Home
            </button>
            <button className="tab" data-tab="about" type="button">
              About
            </button>
            <button className="tab" data-tab="projects" type="button">
              Experience
            </button>
          </div>
        </div>
        <div className="nav-arrows-row" ref={navWrapRef} data-projects="false">
          <button className="nav-arrow" ref={orbitPrevRef} type="button" aria-label="Previous project">
            ‹
          </button>
          <button className="nav-arrow" ref={orbitNextRef} type="button" aria-label="Next project">
            ›
          </button>
        </div>

        <div className="layout" ref={layoutRef} data-portrait-side="right" data-mode="side">
          <div className="cloud-cluster info-panel active" data-panel="home">
            <div className="cloud cloud-name">
              <h1>Calvin Ping</h1>
            </div>
            <div className="cloud cloud-role">
              <p>Computer Science @ UT Austin — Austin, TX</p>
            </div>
            <div className="cloud-links-row">
              <div className="cloud-link-wrap">
                <a className="cloud-link" href="https://github.com/CalvinPing" target="_blank" rel="noopener noreferrer">
                  GitHub
                </a>
              </div>
              <div className="cloud-link-wrap">
                <a
                  className="cloud-link"
                  href="https://linkedin.com/in/calvinping2005"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  LinkedIn
                </a>
              </div>
              <div className="cloud-link-wrap">
                <a className="cloud-link" href="mailto:calvinvping@gmail.com">
                  Email
                </a>
              </div>
            </div>
          </div>

          <div className="postcard info-panel" data-panel="about">
            <div className="postcard-inner">
              <div className="postcard-message">
                <p>
                  Hey, I&apos;m Calvin — I like figuring things out, building stuff that actually works, and picking
                  up something new along the way.
                </p>
              </div>
              <div className="postcard-divider" />
              <div className="postcard-right">
                <div className="postcard-stamp">
                  <div className="stamp-sun" />
                  <div className="stamp-hill" />
                </div>
                <div className="postcard-postmark">
                  UT
                  <br />
                  AUSTIN
                </div>
                <div className="postcard-address">
                  <p>Computer Science student</p>
                  <p>at UT Austin</p>
                  <p>minoring in Statistics &amp; Data Science</p>
                </div>
              </div>
            </div>
            <div className="postcard-stamps">
              <span className="travel-stamp">Python</span>
              <span className="travel-stamp">Java</span>
              <span className="travel-stamp">React</span>
              <span className="travel-stamp">Node.js</span>
              <span className="travel-stamp">Docker</span>
              <span className="travel-stamp">AWS</span>
              <span className="travel-stamp">PostgreSQL</span>
            </div>
            <a className="resume-link" href="/resume.pdf" target="_blank" rel="noopener noreferrer">
              Download résumé ↓
            </a>
          </div>

          <div className="orbit-wrap info-panel" data-panel="projects">
            <div className="orbit-ring" ref={orbitRingRef}>
              <div className="orbit-item" style={{ "--angle-offset": "0deg" } as React.CSSProperties}>
                <div className="orbit-card">
                  <div className="orbit-card-inner">
                    <h3>Fluent PDF</h3>
                    <p>Client-side PDF toolkit (merge, split, edit, protect) — runs entirely offline as an installable PWA.</p>
                    <div className="orbit-card-actions">
                      <a className="btn-solid" href="https://fluent-pdf.vercel.app/" target="_blank" rel="noopener noreferrer">
                        Visit site ↗
                      </a>
                      <a
                        className="btn-text"
                        href="https://github.com/CalvinPing/FluentPDF"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        GitHub →
                      </a>
                    </div>
                  </div>
                </div>
              </div>
              <div className="orbit-item" style={{ "--angle-offset": "60deg" } as React.CSSProperties}>
                <div className="orbit-card">
                  <div className="orbit-card-inner exp-orbit-card">
                    <p className="exp-dates">Jun 2025 – Aug 2025</p>
                    <h3>AI/Data Engineering Extern</h3>
                    <p className="exp-company">Outamation</p>
                    <p className="exp-desc">
                      Built an AI-powered OCR document pipeline in Python that cut manual processing time by 24%.
                    </p>
                  </div>
                </div>
              </div>
              <div className="orbit-item" style={{ "--angle-offset": "120deg" } as React.CSSProperties}>
                <div className="orbit-card">
                  <div className="orbit-card-inner">
                    <h3>RoleRadar</h3>
                    <p>Live SWE roles aggregated from 150+ companies&apos; ATS APIs, auto-refreshed via Cloudflare Cron.</p>
                    <div className="orbit-card-actions">
                      <a className="btn-solid" href="https://roleradar.pages.dev/" target="_blank" rel="noopener noreferrer">
                        Visit site ↗
                      </a>
                      <a
                        className="btn-text"
                        href="https://github.com/CalvinPing/RoleRadar"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        GitHub →
                      </a>
                    </div>
                  </div>
                </div>
              </div>
              <div className="orbit-item" style={{ "--angle-offset": "180deg" } as React.CSSProperties}>
                <div className="orbit-card">
                  <div className="orbit-card-inner exp-orbit-card">
                    <p className="exp-dates">Jun 2020 – May 2025</p>
                    <h3>Real Estate Data &amp; Technology Assistant</h3>
                    <p className="exp-company">Austin Central Realty</p>
                    <p className="exp-desc">
                      Automated data workflows and dashboards, cutting manual effort by 25%.
                    </p>
                  </div>
                </div>
              </div>
              <div className="orbit-item" style={{ "--angle-offset": "240deg" } as React.CSSProperties}>
                <div className="orbit-card">
                  <div className="orbit-card-inner">
                    <h3>Connected Horizons</h3>
                    <p>Broadband access platform for underserved communities — Flask/SQLAlchemy APIs + geographic data. Team project, archived.</p>
                    <div className="orbit-card-actions">
                      <a
                        className="btn-text"
                        href="https://github.com/CalvinPing/ConnectedHorizons"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        GitHub →
                      </a>
                    </div>
                  </div>
                </div>
              </div>
              <div className="orbit-item" style={{ "--angle-offset": "300deg" } as React.CSSProperties}>
                <div className="orbit-card">
                  <div className="orbit-card-inner exp-orbit-card">
                    <p className="exp-dates">Aug 2026 – Present</p>
                    <h3>Brokerage Website</h3>
                    <p className="exp-company">Austin Central Realty</p>
                    <p className="exp-desc">
                      Building a full-stack site with live MLS listings via SimplyRETS, backed by Supabase/PostgreSQL.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="portrait-stage">
            <div className="portrait-shadow" />
            <img className="portrait active" data-portrait="home" src="/photos/jacket.png" alt="Calvin Ping smiling in a jacket" />
            <img className="portrait" data-portrait="about" src="/photos/texas27.png" alt="Calvin Ping holding a Texas 27 sign" />
            <img className="portrait" data-portrait="projects" src="/photos/thumbsup.png" alt="Calvin Ping giving a thumbs up" />
          </div>
        </div>
      </div>

      <p className="site-footer">© 2026 Calvin Ping. All rights reserved.</p>
    </>
  );
}
