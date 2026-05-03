"use client";

import { useEffect, useRef, useState, useMemo } from "react";

interface Props {
  cols?: number;
  rows?: number;
  pattern?: "wave" | "diagonal" | "spiral";
  cycleDuration?: number;
  cellFadeFrames?: number;
  dark?: boolean;
}

function spiralIndices(cols: number, rows: number): number[][] {
  const grid: number[][] = Array.from({ length: rows }, () => Array(cols).fill(0));
  let top = 0, bottom = rows - 1, left = 0, right = cols - 1, i = 0;
  while (top <= bottom && left <= right) {
    for (let x = left; x <= right; x++) grid[top][x] = i++;
    top++;
    for (let y = top; y <= bottom; y++) grid[y][right] = i++;
    right--;
    if (top <= bottom) { for (let x = right; x >= left; x--) grid[bottom][x] = i++; bottom--; }
    if (left <= right) { for (let y = bottom; y >= top; y--) grid[y][left] = i++; left--; }
  }
  return grid;
}

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

export function GridAnimation({
  cols = 16,
  rows = 9,
  pattern = "wave",
  cycleDuration = 140,
  cellFadeFrames = 20,
  dark = false,
}: Props) {
  const frameRef = useRef(0);
  const rafRef = useRef<number>(0);
  const [cells, setCells] = useState<number[]>([]);

  const delays = useMemo(() => {
    const raw: number[][] = Array.from({ length: rows }, () => Array(cols).fill(0));
    const spiral = pattern === "spiral" ? spiralIndices(cols, rows) : null;
    for (let y = 0; y < rows; y++)
      for (let x = 0; x < cols; x++) {
        if (pattern === "wave") raw[y][x] = Math.hypot(x - (cols - 1) / 2, y - (rows - 1) / 2);
        else if (pattern === "diagonal") raw[y][x] = x + y;
        else if (spiral) raw[y][x] = spiral[y][x];
      }
    let min = Infinity, max = -Infinity;
    for (let y = 0; y < rows; y++)
      for (let x = 0; x < cols; x++) {
        if (raw[y][x] < min) min = raw[y][x];
        if (raw[y][x] > max) max = raw[y][x];
      }
    const span = Math.max(0, cycleDuration / 2 - cellFadeFrames);
    const range = max - min || 1;
    const out: number[] = [];
    for (let y = 0; y < rows; y++)
      for (let x = 0; x < cols; x++)
        out.push(((raw[y][x] - min) / range) * span);
    return out;
  }, [cols, rows, pattern, cycleDuration, cellFadeFrames]);

  useEffect(() => {
    let lastTime = 0;
    const interval = 1000 / 30;
    const tick = (time: number) => {
      rafRef.current = requestAnimationFrame(tick);
      if (time - lastTime < interval) return;
      lastTime = time;
      frameRef.current = (frameRef.current + 1) % cycleDuration;
      const f = frameRef.current;
      const half = cycleDuration / 2;
      const newCells = delays.map((delay) => {
        if (f < half) return clamp((f - delay) / cellFadeFrames, 0, 1);
        else return 1 - clamp((f - half - delay) / cellFadeFrames, 0, 1);
      });
      setCells(newCells);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [delays, cycleDuration, cellFadeFrames]);

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: dark ? "#05191e" : "#ffffff", transition: "background 0.5s ease" }}>
      {/* Grid cells */}
      <div style={{
        position: "absolute", inset: 0,
        display: "grid",
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gridTemplateRows: `repeat(${rows}, 1fr)`,
      }}>
        {cells.map((opacity, i) => (
          <div key={i} style={{
            background: "#5ba4b0",
            opacity: opacity * (dark ? 0.18 : 0.10),
          }} />
        ))}
      </div>
      {/* Grid lines */}
      <div style={{
        position: "absolute", inset: 0,
        display: "grid",
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gridTemplateRows: `repeat(${rows}, 1fr)`,
        pointerEvents: "none",
      }}>
        {Array.from({ length: cols * rows }).map((_, i) => (
          <div key={i} style={{ border: `1px solid rgba(91,164,176,${dark ? 0.12 : 0.07})` }} />
        ))}
      </div>
      {/* Radial glow */}
      <div style={{
        position: "absolute", inset: 0,
        background: `radial-gradient(ellipse at 50% 35%, rgba(91,164,176,${dark ? 0.14 : 0.08}) 0%, transparent 60%)`,
        pointerEvents: "none",
      }} />
    </div>
  );
}
