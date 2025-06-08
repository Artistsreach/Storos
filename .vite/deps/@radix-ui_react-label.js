"use client";
import {
  Primitive
} from "./chunk-MSAE6HTY.js";
import "./chunk-6ALU2HC3.js";
import {
  require_jsx_runtime
} from "./chunk-RI74BKWD.js";
import "./chunk-KTKPYBYG.js";
import {
  require_react
} from "./chunk-P4I6WM76.js";
import {
  __toESM
} from "./chunk-2GTGKKMZ.js";

// node_modules/@radix-ui/react-label/dist/index.mjs
var React = __toESM(require_react(), 1);
var import_jsx_runtime = __toESM(require_jsx_runtime(), 1);
var NAME = "Label";
var Label = React.forwardRef((props, forwardedRef) => {
  return (0, import_jsx_runtime.jsx)(
    Primitive.label,
    {
      ...props,
      ref: forwardedRef,
      onMouseDown: (event) => {
        var _a;
        const target = event.target;
        if (target.closest("button, input, select, textarea"))
          return;
        (_a = props.onMouseDown) == null ? void 0 : _a.call(props, event);
        if (!event.defaultPrevented && event.detail > 1)
          event.preventDefault();
      }
    }
  );
});
Label.displayName = NAME;
var Root = Label;
export {
  Label,
  Root
};
//# sourceMappingURL=@radix-ui_react-label.js.map
