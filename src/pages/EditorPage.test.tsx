// @vitest-environment jsdom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { EditorPage } from "./EditorPage";

// Tell React that this test environment supports act()
(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

describe("EditorPage UI regression tests", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
  });

  it("regression: loading case -> manual edit -> clicking Reset thoroughly clears case data without reverting to old case", async () => {
    // 1. Mount EditorPage with ?case=large-counts-full-two-col
    await act(async () => {
      root.render(
        <MemoryRouter initialEntries={["/editor?case=large-counts-full-two-col"]}>
          <EditorPage />
        </MemoryRouter>,
      );
    });

    // 2. Verify large-counts-full-two-col is loaded (databases = 124500)
    const inputs = Array.from(container.querySelectorAll<HTMLInputElement>("input[type='number']"));
    const dbInput = inputs[0];
    expect(dbInput).toBeDefined();
    expect(dbInput.value).toBe("124500");

    // Notice should be present
    expect(container.querySelector(".notice")?.textContent).toContain("Illustrative counts testing two-column layout");

    // 3. User makes a manual edit (e.g. databases = 999)
    await act(async () => {
      const nativeSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        "value",
      )?.set;
      nativeSetter?.call(dbInput, "999");
      dbInput.dispatchEvent(new Event("input", { bubbles: true }));
      dbInput.dispatchEvent(new Event("change", { bubbles: true }));
    });

    expect(dbInput.value).toBe("999");

    // 4. User clicks Reset button
    const buttons = Array.from(container.querySelectorAll("button"));
    const resetBtn = buttons.find((b) => b.textContent?.trim() === "Reset");
    expect(resetBtn).toBeDefined();

    await act(async () => {
      resetBtn?.click();
    });

    // 5. Verify the form is completely reset:
    // Databases must be 0, NOT 124500 and NOT 999!
    expect(dbInput.value).toBe("0");
    expect(dbInput.value).not.toBe("124500");
    expect(dbInput.value).not.toBe("999");

    // Notice should be cleared
    expect(container.querySelector(".notice")).toBeNull();

    // 6. Wait for any microtasks / router updates to settle, ensuring no race condition reverts the data
    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });

    expect(dbInput.value).toBe("0");
    expect(dbInput.value).not.toBe("124500");
  });

  it("regression: loading case via UI picker -> Reset clears state and notice", async () => {
    // 1. Mount on blank /editor
    await act(async () => {
      root.render(
        <MemoryRouter initialEntries={["/editor"]}>
          <EditorPage />
        </MemoryRouter>,
      );
    });

    const inputs = Array.from(container.querySelectorAll<HTMLInputElement>("input[type='number']"));
    const dbInput = inputs[0];
    expect(dbInput.value).toBe("0");

    // 2. Click "T2D trials" case button in UI
    const buttons = Array.from(container.querySelectorAll("button"));
    const t2dBtn = buttons.find((b) => b.textContent?.includes("T2D"));
    expect(t2dBtn).toBeDefined();

    await act(async () => {
      t2dBtn?.click();
    });

    expect(dbInput.value).toBe("1851");
    expect(container.querySelector(".notice")?.textContent).toContain("Illustrative counts for a databases-and-registers figure");

    // 3. Click Reset
    const resetBtn = buttons.find((b) => b.textContent?.trim() === "Reset");
    expect(resetBtn).toBeDefined();

    await act(async () => {
      resetBtn?.click();
    });

    expect(dbInput.value).toBe("0");
    expect(container.querySelector(".notice")).toBeNull();
  });
});
