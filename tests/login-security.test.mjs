import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";
import ts from "typescript";

const require = createRequire(import.meta.url);

function loadTypeScript(path) {
  const source = readFileSync(new URL(path, import.meta.url), "utf8");
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  });
  const compiledModule = { exports: {} };
  new Function("require", "module", "exports", outputText)(
    require,
    compiledModule,
    compiledModule.exports,
  );
  return compiledModule.exports;
}

const { getLoginRedirect } = loadTypeScript("../src/lib/login-redirect.ts");
const { POST } = loadTypeScript("../src/app/api/auth/login/route.ts");

test("login return destinations preserve protected routes and filters", () => {
  for (const path of [
    "/dashboard",
    "/dashboard/admin/staff?page=2#staff",
    "/statements/staff/example?currency=NGN",
  ]) {
    assert.equal(getLoginRedirect(path), path);
  }
});

test("unsafe or non-application return destinations fall back to dashboard", () => {
  for (const path of [
    null,
    "",
    "https://example.com/dashboard",
    "//example.com/dashboard",
    "javascript:alert(1)",
    "/\\example.com/dashboard",
    "/dashboard/../../login",
    "/dashboard/%2e%2e/login",
    "/dashboard/%5c../login",
    "/dashboard/%0aexample",
    "/dashboard/%zz",
    "/dashboard-other",
    "/login?redirect=/dashboard",
    "/api/auth/logout",
    " /dashboard",
    "/dashboard\n",
  ]) {
    assert.equal(getLoginRedirect(path), "/dashboard", String(path));
  }
});

test("native login submits POST to a fixed endpoint independent of redirect query", () => {
  const source = readFileSync(
    new URL("../src/components/login-form.tsx", import.meta.url),
    "utf8",
  );
  const form = source.match(/<form\s[\s\S]*?>/)?.[0];
  assert.match(form, /method="post"/);
  assert.match(form, /action="\/api\/auth\/login"/);
});

test("unhydrated native submission fails closed without reflecting credentials", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = () => {
    assert.fail("Native form credentials must not be forwarded to Django");
  };
  try {
    const request = new Request("https://admin.example/api/auth/login", {
      method: "POST",
      body: new URLSearchParams({
        email: "fixture@example.invalid",
        password: "fixture-secret",
      }),
    });
    const response = await POST(request);
    assert.equal(response.status, 415);
    assert.equal(response.headers.get("cache-control"), "no-store");
    const body = await response.text();
    assert.doesNotMatch(body, /fixture-secret|fixture@example/);
    assert.match(body, /enable JavaScript/);
    assert.equal(response.headers.get("location"), null);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("hydrated login forwards credentials only in a JSON POST body", async () => {
  const originalFetch = globalThis.fetch;
  let calls = 0;
  globalThis.fetch = async (url, options) => {
    calls += 1;
    assert.equal(new URL(url).search, "");
    assert.equal(options.method, "POST");
    assert.deepEqual(JSON.parse(options.body), {
      username: "fixture@example.invalid",
      password: "fixture-secret",
    });
    return Response.json({
      access: "fixture-access",
      refresh: "fixture-refresh",
    });
  };
  try {
    const response = await POST(
      new Request("https://admin.example/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "fixture@example.invalid",
          password: "fixture-secret",
        }),
      }),
    );
    assert.equal(calls, 1);
    assert.equal(response.status, 200);
    assert.doesNotMatch(await response.text(), /fixture-/);
    assert.equal(response.headers.get("location"), null);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
