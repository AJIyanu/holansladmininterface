import test from "node:test";
import assert from "node:assert/strict";
import { can, canWrite } from "../src/features/procurement/types.ts";
import { resources, actionForm } from "../src/features/procurement/config.ts";

test("executive role names do not grant procurement access", () => {
  const executive = {
    is_superuser: false,
    roles: ["CEO", "CTO"],
    permissions: [],
  };
  assert.equal(can(executive, "procurement.documentregister.view"), false);
  assert.equal(
    canWrite(executive, "procurement.documentregister.generate"),
    false,
  );
});
test("writes require request visibility, operational permission and the action grant", () => {
  const required = [
    "procurement.procurementrequest.view",
    "procurement.procurementrequest.operate",
    "procurement.procurementrequest.resolve",
  ];
  for (const missing of required)
    assert.equal(
      canWrite(
        {
          is_superuser: false,
          permissions: required.filter((p) => p !== missing),
        },
        required[2],
      ),
      false,
    );
  assert.equal(
    canWrite({ is_superuser: false, permissions: required }, required[2]),
    true,
  );
});
test("replacements retain the rejection endpoint; client reorders use a separate request action", () => {
  assert.equal(
    actionForm("outcome-lines", "rejected-line", "resolve").endpoint,
    "outcome-lines/rejected-line/resolve",
  );
  assert.equal(
    actionForm("items", "item", "reorder").endpoint,
    "items/item/reorder",
  );
  assert.equal(
    actionForm("outcome-lines", "rejected-line", "resolve").permission,
    "procurement.procurementrequest.resolve",
  );
});
test("procurement document preparation does not offer ledger-owned invoice or receipt generation", () => {
  const kinds = resources["document-versions"].form.fields.find(
    (field) => field.name === "kind",
  ).options;
  assert.deepEqual(kinds, ["QT", "WB"]);
  assert.equal(
    actionForm("document-versions", "version", "approve"),
    undefined,
  );
});
