import "@testing-library/jest-dom/vitest";
import { cleanup, configure } from "@testing-library/react";
import { afterEach } from "vitest";

configure({ testIdAttribute: "data-ocid" });

// jsdom does not implement the Pointer Capture API that Radix UI primitives
// (Select, etc.) call on pointer events. Without these stubs, opening a Radix
// Select throws `target.hasPointerCapture is not a function`.
if (!Element.prototype.hasPointerCapture) {
  Element.prototype.hasPointerCapture = () => false;
}
if (!Element.prototype.setPointerCapture) {
  Element.prototype.setPointerCapture = () => {};
}
if (!Element.prototype.releasePointerCapture) {
  Element.prototype.releasePointerCapture = () => {};
}
if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {};
}

afterEach(() => {
  cleanup();
});
