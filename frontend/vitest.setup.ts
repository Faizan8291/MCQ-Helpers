import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// React Testing Library only auto-cleans when Vitest globals are enabled;
// we keep globals off for explicit imports, so clean up manually.
afterEach(() => {
  cleanup();
});
