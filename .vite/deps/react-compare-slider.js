"use client";
import {
  require_jsx_runtime
} from "./chunk-RI74BKWD.js";
import {
  require_react
} from "./chunk-P4I6WM76.js";
import {
  __toESM
} from "./chunk-2GTGKKMZ.js";

// node_modules/react-compare-slider/dist/index.mjs
var import_react = __toESM(require_react(), 1);
var import_react2 = __toESM(require_react(), 1);
var import_jsx_runtime = __toESM(require_jsx_runtime(), 1);
var import_jsx_runtime2 = __toESM(require_jsx_runtime(), 1);
var import_react3 = __toESM(require_react(), 1);
var import_jsx_runtime3 = __toESM(require_jsx_runtime(), 1);
var import_react4 = __toESM(require_react(), 1);
var import_jsx_runtime4 = __toESM(require_jsx_runtime(), 1);
var import_react5 = __toESM(require_react(), 1);
var B = (0, import_react2.forwardRef)(({ transition: e, ...t }, r) => {
  let o = { position: "absolute", top: 0, left: 0, width: "100%", height: "100%", transition: e ? `clip-path ${e}` : void 0, userSelect: "none", willChange: "clip-path, transition", KhtmlUserSelect: "none", MozUserSelect: "none", WebkitUserSelect: "none" };
  return (0, import_jsx_runtime.jsx)("div", { ...t, style: o, "data-rcs": "clip-item", ref: r });
});
B.displayName = "ContainerClip";
var W = (0, import_react2.forwardRef)(({ children: e, disabled: t, portrait: r, position: o, transition: i }, m) => {
  let u = { position: "absolute", top: 0, width: r ? "100%" : void 0, height: r ? void 0 : "100%", background: "none", border: 0, padding: 0, pointerEvents: "all", appearance: "none", WebkitAppearance: "none", MozAppearance: "none", outline: 0, transform: r ? "translate3d(0, -50% ,0)" : "translate3d(-50%, 0, 0)", transition: i ? `${r ? "top" : "left"} ${i}` : void 0 };
  return (0, import_jsx_runtime.jsx)("button", { ref: m, "aria-label": "Drag to move or focus and use arrow keys", "aria-orientation": r ? "vertical" : "horizontal", "aria-valuemin": 0, "aria-valuemax": 100, "aria-valuenow": o, "data-rcs": "handle-container", disabled: t, role: "slider", style: u, children: e });
});
W.displayName = "ThisHandleContainer";
var re = ({ flip: e }) => (0, import_jsx_runtime2.jsx)("div", { className: "__rcs-handle-arrow", style: { width: 0, height: 0, borderTop: "8px solid transparent", borderRight: "10px solid", borderBottom: "8px solid transparent", transform: e ? "rotate(180deg)" : void 0 } });
var F = ({ className: e = "__rcs-handle-root", disabled: t, buttonStyle: r, linesStyle: o, portrait: i, style: m, ...C }) => {
  let u = { display: "flex", flexDirection: i ? "row" : "column", placeItems: "center", height: "100%", cursor: t ? "not-allowed" : i ? "ns-resize" : "ew-resize", pointerEvents: "none", color: "#fff", ...m }, E = { flexGrow: 1, height: i ? 2 : "100%", width: i ? "100%" : 2, backgroundColor: "currentColor", pointerEvents: "auto", boxShadow: "0 0 4px rgba(0,0,0,.5)", ...o }, y = { display: "grid", gridAutoFlow: "column", gap: 8, placeContent: "center", flexShrink: 0, width: 56, height: 56, borderRadius: "50%", borderStyle: "solid", borderWidth: 2, pointerEvents: "auto", backdropFilter: "blur(7px)", WebkitBackdropFilter: "blur(7px)", backgroundColor: "rgba(0, 0, 0, 0.125)", boxShadow: "0 0 4px rgba(0,0,0,.35)", transform: i ? "rotate(90deg)" : void 0, ...r };
  return (0, import_jsx_runtime2.jsxs)("div", { ...C, className: e, style: u, children: [(0, import_jsx_runtime2.jsx)("div", { className: "__rcs-handle-line", style: E }), (0, import_jsx_runtime2.jsxs)("div", { className: "__rcs-handle-button", style: y, children: [(0, import_jsx_runtime2.jsx)(re, {}), (0, import_jsx_runtime2.jsx)(re, { flip: true })] }), (0, import_jsx_runtime2.jsx)("div", { className: "__rcs-handle-line", style: E })] });
};
var $ = ((i) => (i.ARROW_LEFT = "ArrowLeft", i.ARROW_RIGHT = "ArrowRight", i.ARROW_UP = "ArrowUp", i.ARROW_DOWN = "ArrowDown", i))($ || {});
var G = ({ boxSizing: e = "border-box", objectFit: t = "cover", objectPosition: r = "center center", ...o } = {}) => ({ display: "block", width: "100%", height: "100%", maxWidth: "100%", boxSizing: e, objectFit: t, objectPosition: r, ...o });
var oe = (e) => {
  let t = (0, import_react3.useRef)(e);
  return (0, import_react3.useEffect)(() => {
    t.current = e;
  }), t.current;
};
var U = (e, t, r, o) => {
  let i = (0, import_react3.useRef)();
  (0, import_react3.useEffect)(() => {
    i.current = t;
  }, [t]), (0, import_react3.useEffect)(() => {
    if (!(r && r.addEventListener))
      return;
    let m = (C) => i.current && i.current(C);
    return r.addEventListener(e, m, o), () => {
      r.removeEventListener(e, m, o);
    };
  }, [e, r, o]);
};
var Te = typeof window < "u" && typeof window.document < "u" && typeof window.document.createElement < "u" ? import_react3.useLayoutEffect : import_react3.useEffect;
var ie = (e, t) => {
  let r = (0, import_react3.useRef)(), o = (0, import_react3.useCallback)(() => {
    e.current && r.current && r.current.observe(e.current);
  }, [e]);
  Te(() => (r.current = new ResizeObserver(([i]) => t(i.contentRect)), o(), () => {
    r.current && r.current.disconnect();
  }), [t, o]);
};
var I = { capture: false, passive: true };
var X = { capture: true, passive: false };
var Me = (e) => {
  e.preventDefault(), e.currentTarget.focus();
};
var se = (0, import_react.forwardRef)(({ boundsPadding: e = 0, browsingContext: t = globalThis, changePositionOnHover: r = false, disabled: o = false, handle: i, itemOne: m, itemTwo: C, keyboardIncrement: u = "5%", onlyHandleDraggable: E = false, onPositionChange: y, portrait: a = false, position: g = 50, style: le, transition: ce, ...pe }, de) => {
  let p = (0, import_react.useRef)(null), j = (0, import_react.useRef)(null), f = (0, import_react.useRef)(null), d = (0, import_react.useRef)(g), [L, q] = (0, import_react.useState)(false), [me, x] = (0, import_react.useState)(true), w = (0, import_react.useRef)(false), [ue, fe] = (0, import_react.useState)(), J = oe(g), l = (0, import_react.useCallback)(function({ x: s, y: c, isOffset: R }) {
    let b = p.current, A = f.current, D = j.current, { width: h, height: S, left: Pe, top: Ee } = b.getBoundingClientRect();
    if (h === 0 || S === 0)
      return;
    let ye = a ? R ? c - Ee - t.scrollY : c : R ? s - Pe - t.scrollX : s, Q = Math.min(Math.max(ye / (a ? S : h) * 100, 0), 100), z = a ? S / (b.offsetHeight || 1) : h / (b.offsetWidth || 1), Z = e * z / (a ? S : h) * 100, _ = Math.min(Math.max(Q, Z * z), 100 - Z * z);
    d.current = Q, A.setAttribute("aria-valuenow", `${Math.round(d.current)}`), A.style.top = a ? `${_}%` : "0", A.style.left = a ? "0" : `${_}%`, D.style.clipPath = a ? `inset(${_}% 0 0 0)` : `inset(0 0 0 ${_}%)`, y && y(d.current);
  }, [e, y, a, t]);
  (0, import_react.useEffect)(() => {
    let { width: n, height: s } = p.current.getBoundingClientRect(), c = g === J ? d.current : g;
    l({ x: n / 100 * c, y: s / 100 * c });
  }, [e, g, a, J, l]);
  let Re = (0, import_react.useCallback)((n) => {
    n.preventDefault(), !(o || n.button !== 0) && (l({ isOffset: true, x: n.pageX, y: n.pageY }), q(true), x(true));
  }, [o, l]), v = (0, import_react.useCallback)(function(s) {
    l({ isOffset: true, x: s.pageX, y: s.pageY }), x(false);
  }, [l]), T = (0, import_react.useCallback)(() => {
    q(false), x(true);
  }, []), Se = (0, import_react.useCallback)(({ width: n, height: s }) => {
    let { width: c, height: R } = p.current.getBoundingClientRect();
    l({ x: n / 100 * d.current * c / n, y: s / 100 * d.current * R / s });
  }, [l]), Ce = (0, import_react.useCallback)((n) => {
    if (!Object.values($).includes(n.key))
      return;
    n.preventDefault(), x(true);
    let { top: s, left: c } = f.current.getBoundingClientRect(), { width: R, height: b } = p.current.getBoundingClientRect(), D = typeof u == "string" ? parseFloat(u) : u / R * 100, h = a ? n.key === "ArrowLeft" || n.key === "ArrowDown" : n.key === "ArrowRight" || n.key === "ArrowUp", S = Math.min(Math.max(h ? d.current + D : d.current - D, 0), 100);
    l({ x: a ? c : R * S / 100, y: a ? b * S / 100 : s });
  }, [u, a, l]);
  (0, import_react.useEffect)(() => {
    fe(E ? f.current : p.current);
  }, [E]), (0, import_react.useEffect)(() => {
    let n = p.current, s = () => {
      L || T();
    };
    return r && (n.addEventListener("pointermove", v, I), n.addEventListener("pointerleave", s, I)), () => {
      n.removeEventListener("pointermove", v), n.removeEventListener("pointerleave", s);
    };
  }, [r, v, T, L]), (0, import_react.useEffect)(() => (L && !w.current && (t.addEventListener("pointermove", v, I), t.addEventListener("pointerup", T, I), w.current = true), () => {
    w.current && (t.removeEventListener("pointermove", v), t.removeEventListener("pointerup", T), w.current = false);
  }), [v, T, L, t]), (0, import_react.useImperativeHandle)(de, () => ({ rootContainer: p.current, handleContainer: f.current, setPosition(n) {
    let { width: s, height: c } = p.current.getBoundingClientRect();
    l({ x: s / 100 * n, y: c / 100 * n });
  } }), [l]), ie(p, Se), U("keydown", Ce, f.current, X), U("click", Me, f.current, X), U("pointerdown", Re, ue, X);
  let ve = i || (0, import_jsx_runtime3.jsx)(F, { disabled: o, portrait: a }), K = me ? ce : void 0, he = { position: "relative", display: "flex", overflow: "hidden", cursor: L ? a ? "ns-resize" : "ew-resize" : void 0, touchAction: "none", userSelect: "none", KhtmlUserSelect: "none", msUserSelect: "none", MozUserSelect: "none", WebkitUserSelect: "none", ...le };
  return (0, import_jsx_runtime3.jsxs)("div", { ...pe, ref: p, style: he, "data-rcs": "root", children: [m, (0, import_jsx_runtime3.jsx)(B, { ref: j, transition: K, children: C }), (0, import_jsx_runtime3.jsx)(W, { disabled: o, portrait: a, position: Math.round(d.current), ref: f, transition: K, children: ve })] });
});
se.displayName = "ReactCompareSlider";
var ae = (0, import_react4.forwardRef)(({ style: e, ...t }, r) => {
  let o = G(e);
  return (0, import_jsx_runtime4.jsx)("img", { ref: r, ...t, style: o, "data-rcs": "image" });
});
ae.displayName = "ReactCompareSliderImage";
var _e = () => (0, import_react5.useRef)({ rootContainer: null, handleContainer: null, setPosition: () => console.warn("[react-compare-slider] `setPosition` cannot be used until the component has mounted.") });
export {
  se as ReactCompareSlider,
  F as ReactCompareSliderHandle,
  ae as ReactCompareSliderImage,
  G as styleFitContainer,
  _e as useReactCompareSliderRef
};
//# sourceMappingURL=react-compare-slider.js.map
