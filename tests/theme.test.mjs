import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";
import { fileURLToPath } from "node:url";

const cssUrl = new URL("../src/app/globals.css", import.meta.url);
const css = readFileSync(cssUrl, "utf8");
const layout = readFileSync(
  new URL("../src/app/layout.tsx", import.meta.url),
  "utf8",
);
const declarations = (block) =>
  Object.fromEntries(
    [...block.matchAll(/--([\w-]+):\s*([^;]+);/g)].map((match) => [
      match[1],
      match[2].trim(),
    ]),
  );
const theme = declarations(css.match(/@theme inline\s*{([\s\S]*?)}/)[1]);
const light = declarations(css.match(/:root\s*{([\s\S]*?)}/)[1]);
const dark = {
  ...light,
  ...declarations(css.match(/\.dark\s*{([\s\S]*?)}/)[1]),
};

function luminance(hex) {
  const rgb = hex
    .slice(1)
    .match(/../g)
    .map((channel) => parseInt(channel, 16) / 255);
  const linear = rgb.map((value) =>
    value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4,
  );
  return linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722;
}

function contrast(a, b) {
  const values = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (values[0] + 0.05) / (values[1] + 0.05);
}

test("the approved brand palette and compatibility aliases are preserved", () => {
  assert.equal(theme["color-brand-primary"], "#04035e");
  assert.equal(theme["color-brand-accent"], "#69caf0");
  assert.equal(theme["color-brand-neutral"], "#696060");
  assert.equal(theme["color-brand-white"], "#ffffff");
  assert.equal(theme["color-brand-navy"], theme["color-brand-primary"]);
  assert.equal(theme["color-brand-blue"], theme["color-brand-accent"]);
  assert.equal(theme["color-brand-gray"], theme["color-brand-neutral"]);
});

test("every semantic colour resolves to a complete CSS colour in both modes", () => {
  for (const [name, value] of Object.entries(theme)) {
    if (!name.startsWith("color-")) continue;
    const reference = value.match(/^var\(--([\w-]+)\)$/)?.[1];
    for (const mode of [light, dark]) {
      const colour = reference ? mode[reference] : value;
      assert.match(colour ?? "", /^#[0-9a-f]{6}$/i, name);
    }
  }
});

test("status aliases cover foreground and subtle alert surfaces", () => {
  for (const [alias, target] of Object.entries({
    error: "destructive",
    danger: "destructive",
    destroy: "destructive",
    alert: "warning",
  })) {
    for (const suffix of [
      "",
      "-foreground",
      "-subtle",
      "-content",
      "-border",
    ]) {
      assert.equal(
        theme[`color-${alias}${suffix}`],
        `var(--${target}${suffix})`,
      );
    }
  }
});

test("normal text and status pairs meet AA contrast in both themes", () => {
  const pairs = [
    ["foreground", "background"],
    ["card-foreground", "card"],
    ["popover-foreground", "popover"],
    ["primary-foreground", "primary"],
    ["secondary-foreground", "secondary"],
    ["accent-foreground", "accent"],
    ["muted-foreground", "muted"],
    ["muted-foreground", "background"],
    ["sidebar-foreground", "sidebar"],
    ["sidebar-primary-foreground", "sidebar-primary"],
    ["sidebar-accent-foreground", "sidebar-accent"],
    ...["success", "warning", "info", "destructive"].flatMap((status) => [
      [`${status}-foreground`, status],
      [`${status}-content`, `${status}-subtle`],
    ]),
  ];
  for (const [modeName, mode] of Object.entries({ light, dark })) {
    for (const [fg, bg] of pairs) {
      const ratio = contrast(mode[fg], mode[bg]);
      assert.ok(ratio >= 4.5, `${modeName} ${fg}/${bg}: ${ratio.toFixed(2)}`);
    }
  }
});

test("focus and input/status boundaries have at least 3:1 contrast", () => {
  for (const mode of [light, dark]) {
    for (const surface of ["background", "card", "popover"]) {
      for (const boundary of ["ring", "input"]) {
        assert.ok(
          contrast(mode[boundary], mode[surface]) >= 3,
          `${boundary}/${surface}`,
        );
      }
    }
    assert.ok(contrast(mode["sidebar-ring"], mode.sidebar) >= 3);
    for (const status of ["success", "warning", "info", "destructive"]) {
      assert.ok(
        contrast(mode[`${status}-border`], mode[`${status}-subtle`]) >= 3,
      );
    }
  }
});

test("approved web fonts replace Geist without a fixed body background override", () => {
  for (const font of ["Barlow", "Inter", "Lato"])
    assert.ok(layout.includes(font));
  for (const variable of ["--font-barlow", "--font-inter", "--font-lato"]) {
    assert.ok(layout.includes(variable));
  }
  assert.match(layout, /weight: \["500", "600", "700"\]/);
  assert.ok(!layout.includes("Geist"));
  assert.ok(!layout.includes("bg-blue-200"));
  assert.equal(theme["text-body"], "1rem");
});

test("Tailwind v4 compiles semantic utilities, aliases and dark variants", async () => {
  const require = createRequire(import.meta.url);
  const tailwind = require("@tailwindcss/postcss");
  // Reuse PostCSS from the declared Tailwind plugin; no new test dependency.
  const pluginRequire = createRequire(require.resolve("@tailwindcss/postcss"));
  const postcss = pluginRequire("postcss");
  const result = await postcss([tailwind({ optimize: false })]).process(
    css +
      '\n@source inline("bg-success text-success-foreground bg-warning bg-info bg-destroy bg-alert border-input ring-ring bg-brand-navy font-heading dark:bg-card");',
    { from: fileURLToPath(cssUrl) },
  );
  for (const utility of [
    ".bg-success",
    ".text-success-foreground",
    ".bg-warning",
    ".bg-info",
    ".bg-destroy",
    ".bg-alert",
    ".border-input",
    ".ring-ring",
    ".bg-brand-navy",
    ".font-heading",
  ]) {
    assert.ok(result.css.includes(utility), `Missing compiled ${utility}`);
  }
  assert.ok(result.css.includes(".dark\\:bg-card"));
  assert.ok(result.css.includes("background-color: var(--success)"));
});
