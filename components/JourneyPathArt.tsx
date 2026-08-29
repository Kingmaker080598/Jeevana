const NODE_TEXT = {
  fontFamily: "var(--font-display), Georgia, serif",
  fontWeight: 700,
} as const;

/**
 * Decorative winding "journey" path with numbered stops, drawn to match the
 * Jeevana brand artwork. Purely presentational — hidden from screen readers.
 */
export function JourneyPathArt({ className }: Readonly<{ className?: string }>) {
  return (
    <svg
      viewBox="0 0 440 560"
      className={className}
      aria-hidden="true"
      focusable="false"
      fill="none"
    >
      {/* faint blueprint curves in the background */}
      <path
        d="M 300 8 L 300 96 Q 300 148 352 148 L 436 148"
        stroke="var(--line)"
        strokeDasharray="3 5"
        strokeWidth="1"
      />
      <path
        d="M 436 340 Q 340 340 332 432"
        stroke="var(--line)"
        strokeDasharray="3 5"
        strokeWidth="1"
      />

      {/* start dot */}
      <circle cx="24" cy="508" r="5" fill="var(--leaf)" className="node-pop" />

      {/* 1 → 2 */}
      <path
        d="M 29 508 L 108 508"
        stroke="var(--leaf)"
        strokeWidth="2"
        pathLength={1}
        className="path-draw"
        style={{ animationDelay: "0.15s" }}
      />
      <path
        d="M 148 508 C 204 508, 196 424, 232 421"
        stroke="var(--leaf)"
        strokeWidth="2"
        pathLength={1}
        className="path-draw"
        style={{ animationDelay: "0.45s" }}
      />
      {/* 2 → 3 */}
      <path
        d="M 272 418 C 322 414, 352 388, 358 336"
        stroke="var(--marigold)"
        strokeWidth="2"
        pathLength={1}
        className="path-draw"
        style={{ animationDelay: "0.75s" }}
      />
      {/* 3 → 4 */}
      <path
        d="M 356 288 C 350 244, 332 234, 327 198"
        stroke="var(--leaf)"
        strokeWidth="2"
        pathLength={1}
        className="path-draw"
        style={{ animationDelay: "1.05s" }}
      />
      {/* 4 → 5, dashed with arrowhead */}
      <path
        d="M 332 158 C 342 118, 356 100, 378 88"
        stroke="var(--leaf)"
        strokeWidth="2"
        strokeDasharray="5 5"
        pathLength={1}
        className="path-draw"
        style={{ animationDelay: "1.35s" }}
      />
      <path
        d="M 372 96 L 382 85 L 368 82"
        stroke="var(--leaf)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={1}
        className="path-draw"
        style={{ animationDelay: "1.55s" }}
      />

      {/* stop 1 — filled leaf */}
      <g className="node-pop" style={{ animationDelay: "0.35s" }}>
        <circle cx="128" cy="508" r="19" fill="var(--leaf)" />
        <text x="128" y="515" textAnchor="middle" fontSize="19" fill="#fff" style={NODE_TEXT}>
          1
        </text>
      </g>

      {/* stop 2 — leaf outline */}
      <g className="node-pop" style={{ animationDelay: "0.7s" }}>
        <circle cx="252" cy="420" r="19" fill="var(--paper)" stroke="var(--leaf)" strokeWidth="2" />
        <text x="252" y="427" textAnchor="middle" fontSize="19" fill="var(--leaf)" style={NODE_TEXT}>
          2
        </text>
      </g>

      {/* stop 3 — marigold outline, slightly larger */}
      <g className="node-pop" style={{ animationDelay: "1s" }}>
        <circle cx="360" cy="312" r="23" fill="var(--paper)" stroke="var(--marigold)" strokeWidth="2.5" />
        <text x="360" y="320" textAnchor="middle" fontSize="21" fill="var(--marigold-dark)" style={NODE_TEXT}>
          3
        </text>
      </g>

      {/* stop 4 — leaf outline */}
      <g className="node-pop" style={{ animationDelay: "1.3s" }}>
        <circle cx="324" cy="178" r="19" fill="var(--paper)" stroke="var(--leaf)" strokeWidth="2" />
        <text x="324" y="185" textAnchor="middle" fontSize="19" fill="var(--leaf)" style={NODE_TEXT}>
          4
        </text>
      </g>

      {/* stop 5 — filled marigold */}
      <g className="node-pop" style={{ animationDelay: "1.65s" }}>
        <circle cx="404" cy="72" r="20" fill="var(--marigold)" />
        <text x="404" y="79" textAnchor="middle" fontSize="19" fill="#fff" style={NODE_TEXT}>
          5
        </text>
      </g>
    </svg>
  );
}
