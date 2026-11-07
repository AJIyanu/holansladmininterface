import type { Field, FormDefinition, Resource } from "./types";
const lookup = (
  name: string,
  label: string,
  resource: string,
  required = true,
  flatten?: string,
): Field => ({ name, label, resource, required, flatten, type: "lookup" });
const field = (
  name: string,
  label: string,
  required = true,
  type: Field["type"] = "text",
  defaultValue?: string | boolean,
  disablePast = false,
  max?: number,
): Field => ({ name, label, required, type, defaultValue, disablePast, max });
const choice = (
  name: string,
  label: string,
  options: string[],
  required = true,
): Field => ({ name, label, options, required, type: "select" });
const request = lookup("request", "Client request", "requests");
const item = lookup("item", "Requested item", "items");
const qty = field("quantity", "Quantity", true, "decimal");
const price = field("unit_price", "Unit price", true, "decimal");
const currency = field("currency", "Currency code (e.g. NGN)");
const doc = (
  name = "document",
  label = "Supporting document",
  required = false,
) => lookup(name, label, "documents", required);
const reason = field("reason", "Reason", true, "textarea");
const form = (
  title: string,
  model: string,
  endpoint: string,
  fields: Field[],
  lines?: FormDefinition["lines"],
  notice?: string,
): FormDefinition => ({
  title,
  permission: `procurement.${model}.create`,
  endpoint,
  destination: endpoint,
  fields,
  lines,
  notice,
});
export const resources: Record<string, Resource> = {
  requests: {
    title: "Client requests",
    model: "procurementrequest",
    columns: ["number", "client_name", "submitted_at", "created_by_name"],
    form: form(
      "New client request",
      "procurementrequest",
      "requests",
      [
        lookup("client", "Client", "lookups?kind=clients"),
        lookup("contact", "Client contact", "lookups?kind=contacts", false),
        field("received_at", "Received at", false, "datetime"),
        field("notes", "Notes", false, "textarea"),
      ],
      {
        name: "items",
        label: "Requested items",
        fields: [
          field("description", "Item description"),
          field("specification", "Specification", false, "textarea"),
          qty,
          field("unit", "Unit (e.g. each)"),
          field("required_date", "Required date", false, "date"),
        ],
      },
      "Review the items before saving. The current backend allows draft notes to be edited, but not saved item lines.",
    ),
  },
  items: {
    title: "Item trackers",
    model: "requestitem",
    columns: ["description", "quantity", "unit", "required_date"],
  },
  "supplier-quotations": {
    title: "Supplier offers",
    model: "supplierquotation",
    columns: ["supplier_name", "reference", "currency", "expires_at"],
    form: form(
      "Record supplier offer",
      "supplierquotation",
      "supplier-quotations",
      [
        request,
        lookup("supplier", "Supplier", "lookups?kind=suppliers"),
        field("reference", "Supplier reference", false),
        currency,
        field("expires_at", "Valid until", false, "date", undefined, true),
        doc(),
      ],
      {
        name: "lines",
        label: "Offered items",
        fields: [
          item,
          lookup(
            "attempt",
            "Replacement attempt (if applicable)",
            "attempts",
            false,
          ),
          qty,
          price,
          field("charges", "Other charges", false, "decimal"),
        ],
      },
    ),
  },
  quotations: {
    title: "Client quotations",
    model: "clientquotation",
    columns: ["display_reference", "request", "created_at", "created_by_name"],
    form: form(
      "Prepare client quotation",
      "clientquotation",
      "quotations",
      [
        request,
        currency,
        field("expires_at", "Valid until", false, "date", undefined, true),
        doc("document", "Existing quotation file", false),
      ],
      {
        name: "lines",
        label: "Quotation items",
        fields: [
          item,
          lookup(
            "supplier_offer",
            "Supplier offer item",
            "supplier-quotations",
            true,
            "lines",
          ),
          field("description", "Item Description on Quote"),
          qty,
          price,
          choice("discount_type", "Discount type", ["AMOUNT", "PERCENT"]),
          field("discount_value", "Discount", false, "decimal", "0"),
          field("tax_rate", "Tax (%)", true, "decimal", "7.5", false, 100),
          field("logistics", "Logistics", false, "decimal"),
          field("additional_charges", "Additional charges", false, "decimal"),
        ],
      },
      "Quotation revisions need ledger approval before official issuance. Internal costs are excluded from client document snapshots.",
    ),
  },
  "quotation-revisions": {
    title: "Quotation revisions",
    model: "clientquotationrevision",
    columns: ["number", "currency", "reason", "expires_at"],
  },
  "purchase-orders": {
    title: "Client purchase orders",
    model: "clientpurchaseorder",
    columns: ["reference", "received_at", "verbal", "created_by_name"],
    form: form(
      "Record purchase order",
      "clientpurchaseorder",
      "purchase-orders",
      [
        request,
        field("reference", "Client PO number or reference"),
        field("verbal", "Verbal confirmation", false, "boolean"),
        field("evidence", "Confirmation details", false, "textarea"),
        doc("document", "Purchase order document"),
        field("received_at", "Received at", false, "datetime"),
      ],
      {
        name: "lines",
        label: "Ordered items",
        fields: [
          lookup(
            "quote_line",
            "Quoted item",
            "quotation-revisions",
            false,
            "lines",
          ),
          lookup(
            "invoice_line",
            "Approved invoice item (instead of quote)",
            "lookups?kind=invoice-lines",
            false,
          ),
          qty,
          price,
        ],
      },
      "A documented PO needs its document; a verbal PO needs confirmation details. New quotations must first receive ledger approval.",
    ),
  },
  "supplier-purchases": {
    title: "Supplier purchases",
    model: "supplierpurchase",
    columns: ["supplier_name", "reference", "currency", "created_at"],
    form: form(
      "Record supplier purchase",
      "supplierpurchase",
      "supplier-purchases",
      [
        request,
        lookup("supplier", "Supplier", "lookups?kind=suppliers"),
        currency,
        field("reference", "Purchase reference", false),
        doc(),
      ],
      {
        name: "lines",
        label: "Purchased items",
        fields: [
          lookup("attempt", "Fulfilment attempt", "attempts"),
          lookup(
            "supplier_offer",
            "Supplier offer item",
            "supplier-quotations",
            true,
            "lines",
          ),
          qty,
          price,
        ],
      },
    ),
  },
  "goods-receipts": {
    title: "Goods received by Holan",
    model: "goodsreceipt",
    columns: ["purchase", "received_at", "created_by_name"],
    form: form(
      "Receive purchased goods",
      "goodsreceipt",
      "goods-receipts",
      [
        lookup("purchase", "Supplier purchase", "supplier-purchases"),
        field("received_at", "Received at", false, "datetime"),
        doc(),
      ],
      {
        name: "lines",
        label: "Received quantities",
        fields: [
          lookup(
            "purchase_line",
            "Purchased item",
            "supplier-purchases",
            true,
            "lines",
          ),
          qty,
        ],
      },
    ),
  },
  deliveries: {
    title: "Deliveries & waybills",
    model: "delivery",
    columns: ["number", "recipient_name", "destination", "dispatched_at"],
    form: form(
      "Prepare delivery",
      "delivery",
      "deliveries",
      [
        request,
        field("destination", "Delivery destination", true, "textarea"),
        lookup(
          "recipient",
          "Intended receiving contact",
          "lookups?kind=contacts",
        ),
        field(
          "logistics_details",
          "Vehicle and logistics details",
          false,
          "textarea",
        ),
        doc("waybill", "Existing waybill (or generate after saving)"),
      ],
      {
        name: "lines",
        label: "Delivery items",
        fields: [
          lookup(
            "receipt_line",
            "Received item",
            "goods-receipts",
            true,
            "lines",
          ),
          qty,
        ],
      },
      "Saving reserves the selected received quantities. Generate or attach a waybill before dispatch.",
    ),
  },
  "outcome-lines": {
    title: "Rejected items & replacements",
    model: "deliveryoutcomeline",
    columns: ["reason", "rejected", "accepted", "created_at"],
    filters: { rejected: "true" },
  },
  "delivery-outcomes": {
    title: "Delivery outcomes",
    model: "deliveryoutcome",
    columns: ["receiver_name", "occurred_at", "signed_waybill"],
  },
  attempts: {
    title: "Fulfilment attempts",
    model: "fulfilmentattempt",
    columns: ["strategy", "quantity", "reason", "created_at"],
  },
  "rejection-actions": {
    title: "Rejection resolutions",
    model: "rejectionaction",
    columns: ["kind", "quantity", "reason", "created_at"],
  },
  "finance-requests": {
    title: "Finance requests",
    model: "financerequest",
    columns: ["kind", "currency", "notes", "created_at"],
    form: form(
      "Prepare finance request",
      "financerequest",
      "finance-requests",
      [
        request,
        choice("kind", "Request type", [
          "INVOICE",
          "EXPENSE",
          "ADVANCE",
          "ADVANCE_BREAKDOWN",
          "SUPPLIER_REFUND",
        ]),
        currency,
        field("notes", "Notes", false, "textarea"),
      ],
      {
        name: "lines",
        label: "Request items",
        fields: [
          item,
          lookup("po_line", "PO line", "purchase-orders", false, "lines"),
          lookup(
            "delivery_line",
            "Delivery line",
            "deliveries",
            false,
            "lines",
          ),
          qty,
          field("amount", "Amount", true, "decimal"),
          doc(),
        ],
      },
      "Save, then submit the request for Accounts review. Accounts can create invoices from the procurement inbox; invoices enter the sales ledger when marked delivered. Submission does not mean payment.",
    ),
  },
  costs: {
    title: "Cost breakdowns",
    model: "procurementcost",
    columns: ["kind", "amount", "currency", "description"],
    form: form(
      "Record actual cost",
      "procurementcost",
      "costs",
      [
        item,
        choice("kind", "Cost type", ["SUPPLIER", "LOGISTICS", "OTHER"]),
        field("amount", "Amount", true, "decimal"),
        currency,
        field("description", "Details", true, "textarea"),
        doc("document", "Cost evidence", true),
      ],
      undefined,
      "Recorded costs remain unapproved until reviewed by ledger.",
    ),
  },
  documents: {
    title: "Uploaded evidence",
    model: "procurementdocument",
    columns: ["filename", "category", "size_bytes", "created_by_name"],
    form: form(
      "Upload supporting document",
      "procurementdocument",
      "documents",
      [
        request,
        choice("category", "Document category", [
          "QUOTATION",
          "PURCHASE_ORDER",
          "WAYBILL",
          "SIGNED_WAYBILL",
          "RECEIPT",
          "OTHER",
        ]),
        field("file", "Document file", true, "file"),
      ],
      undefined,
      "Private files only. Maximum 20 MiB. Uploaded receipt evidence does not verify a payment.",
    ),
  },
  "document-register": {
    title: "Document register",
    model: "documentregister",
    columns: ["number", "kind", "client_code", "created_at"],
  },
  "document-versions": {
    title: "Document versions",
    model: "documentversion",
    columns: ["number", "revision", "approval_status", "created_by_name"],
    form: form(
      "Prepare document",
      "documentversion",
      "document-versions",
      [
        request,
        choice("kind", "Document type", ["QT", "WB"]),
        lookup(
          "quotation_revision",
          "Quotation revision (QT only)",
          "quotation-revisions",
          false,
        ),
        lookup("delivery", "Delivery (WB only)", "deliveries", false),
      ],
      undefined,
      "Assign a client code on the request first. Invoices and receipts originate from ledger.",
    ),
  },
  "task-links": {
    title: "Linked tasks",
    model: "procurementtasklink",
    columns: ["item", "task", "created_at"],
    form: form("Link existing task", "procurementtasklink", "task-links", [
      item,
      lookup("task", "Task", "lookups?kind=tasks"),
    ]),
  },
  events: {
    title: "Item history",
    model: "itemtrackingevent",
    columns: ["kind", "quantity", "reason", "created_by_name", "occurred_at"],
  },
};
export function actionForm(
  resource: string,
  id: string,
  action: string,
): FormDefinition | undefined {
  const base = resources[resource];
  if (!base) return;
  const definition = (
    title: string,
    permission: string,
    fields: Field[] = [],
    lines?: FormDefinition["lines"],
    notice?: string,
  ): FormDefinition => ({
    title,
    permission: `procurement.${permission}`,
    endpoint: `${resource}/${id}/${action}`,
    destination: `${resource}/${id}`,
    fields,
    lines,
    notice,
  });
  if (resource === "finance-requests" && action === "submit")
    return definition(
      "Submit finance request",
      "financerequest.edit",
      [],
      undefined,
      "Submit this request to Accounts. This does not record a payment.",
    );
  if (resource === "requests" && action === "submit")
    return definition(
      "Submit client request",
      "procurementrequest.edit",
      [],
      undefined,
      "Confirm the requested items are correct. Submitted requests cannot be edited.",
    );
  if (resource === "requests" && action === "client-code")
    return definition(
      "Assign client document code",
      "clientdocumentcode.manage",
      [field("code", "Stable client code (3–4 uppercase letters)")],
      undefined,
      "The code must be unique and cannot be changed here after assignment.",
    );
  if (resource === "items" && action === "reorder")
    return definition(
      "Client reorder",
      "procurementrequest.create",
      [qty, reason, field("required_date", "Required date", false, "date")],
      undefined,
      "Creates a new request for the same client, linked to this item. Use rejection resolution for replacement goods.",
    );
  if (resource === "deliveries" && action === "dispatch")
    return definition(
      "Dispatch delivery",
      "delivery.edit",
      [],
      undefined,
      "Confirm these goods are leaving Holan for the client. A waybill is required.",
    );
  if (resource === "deliveries" && action === "outcomes")
    return definition(
      "Record client acceptance or rejection",
      "deliveryoutcome.create",
      [
        lookup(
          "receiver",
          "Actual receiving client contact",
          "lookups?kind=contacts",
        ),
        field("occurred_at", "Received at", false, "datetime"),
        doc("signed_waybill", "Signed waybill (required for acceptance)"),
      ],
      {
        name: "lines",
        label: "Delivery outcome",
        fields: [
          lookup(
            "delivery_line",
            "Delivered item",
            "deliveries",
            true,
            "lines",
          ),
          field("accepted", "Accepted quantity", true, "decimal"),
          field("rejected", "Rejected quantity", true, "decimal"),
          field("reason", "Rejection reason", false, "textarea"),
        ],
      },
    );
  if (resource === "outcome-lines" && action === "resolve")
    return definition(
      "Resolve rejected quantity",
      "procurementrequest.resolve",
      [
        choice("kind", "Resolution", [
          "RETURNED_TO_SUPPLIER",
          "SUPPLIER_ACCEPTED_RETURN",
          "SUPPLIER_REFUSED_RETURN",
          "SAME_SUPPLIER_REPLACEMENT",
          "DIFFERENT_SUPPLIER_CHOSEN",
          "REFUND_REPORTED",
          "CLOSED_REJECTED",
        ]),
        qty,
        reason,
        doc(),
        field(
          "refund_amount",
          "Reported refund amount (refund only)",
          false,
          "decimal",
        ),
        field("currency", "Refund currency (refund only)", false),
      ],
      undefined,
      "Replacement creates another attempt under the existing PO. Refund reports do not verify payment. Closing ends fulfilment for the selected rejected quantity.",
    );
  if (
    (resource === "quotations" || resource === "supplier-quotations") &&
    action === "revise" &&
    base.form
  )
    return {
      ...base.form,
      title: "Create quotation revision",
      permission: `procurement.${base.model}.edit`,
      endpoint: `${resource}/${id}/revise`,
      destination: `${resource}/${id}`,
      fields: [...base.form.fields, reason],
    };
  if (resource === "quotation-revisions" && action === "record-sent")
    return definition(
      "Record quotation sent",
      "clientquotationrevision.edit",
      [
        lookup("recipient", "Recipient", "lookups?kind=contacts"),
        field("method", "Sending method"),
        field("evidence", "Sending evidence", true, "textarea"),
      ],
      undefined,
      "Accounts approval of this revision is required before recording it as sent.",
    );
  if (resource === "document-versions" && action === "request-approval")
    return definition(
      "Request ledger approval",
      "documentregister.requestapproval",
      [],
      undefined,
      "This records an approval request. It does not approve or issue the document.",
    );
  if (resource === "document-versions" && action === "generate")
    return definition(
      "Generate document file",
      "documentregister.generate",
      [
        choice("format", "File format", ["PDF", "JPG"]),
        field("draft", "Draft preview", false, "boolean"),
        field("show_logistics", "Show logistics on print", false, "boolean"),
        field(
          "show_additional_charges",
          "Show additional charges on print",
          false,
          "boolean",
        ),
      ],
      undefined,
      "Print options control charge row visibility only; totals still include all recorded charges. Drafts are marked as previews. Official documents require the current office address to be configured. Official quotations need ledger approval; waybills do not.",
    );
}
export const actionNames: Record<string, string[]> = {
  "finance-requests": ["submit"],
  requests: ["submit", "client-code"],
  items: ["reorder"],
  quotations: ["revise"],
  "supplier-quotations": ["revise"],
  deliveries: ["dispatch", "outcomes"],
  "outcome-lines": ["resolve"],
  "document-versions": ["request-approval", "generate"],
};
