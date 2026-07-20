import { Plus, Save, Trash2 } from "lucide-react";

import { hasPermission } from "@/types/auth";
import type { CurrentUser } from "@/types/auth";

import {
  createCrmContactRoleAction,
  deleteCrmContactRoleAction,
  updateCrmContactRoleAction,
} from "@/features/crm/contact-role-actions";
import { CRM_PERMISSIONS } from "@/features/crm/permissions";

import type { CrmContactRole, PaginatedResponse } from "@/features/crm/types";

interface CrmContactRolesManagerProps {
  user: CurrentUser;
  data: PaginatedResponse<CrmContactRole>;
}

function fieldClass(): string {
  return "h-11 w-full rounded-lg border border-[#CBD5E1] bg-white px-3 text-sm text-[#0F172A] outline-none transition placeholder:text-[#94A3B8] focus:border-[#F46C0B] focus:ring-2 focus:ring-[#FED7AA]";
}

function textareaClass(): string {
  return "w-full rounded-lg border border-[#CBD5E1] bg-white px-3 py-2 text-sm text-[#0F172A] outline-none transition placeholder:text-[#94A3B8] focus:border-[#F46C0B] focus:ring-2 focus:ring-[#FED7AA]";
}

function labelClass(): string {
  return "text-sm font-medium text-[#334155]";
}

export function CrmContactRolesManager({
  user,
  data,
}: CrmContactRolesManagerProps) {
  const canCreate = hasPermission(user, CRM_PERMISSIONS.contactRole.create);

  const canEdit = hasPermission(user, CRM_PERMISSIONS.contactRole.edit);

  const canDelete = hasPermission(user, CRM_PERMISSIONS.contactRole.delete);

  return (
    <section className="space-y-6">
      <header className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm sm:p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#F46C0B]">
          CRM settings
        </p>

        <h1 className="mt-1 text-2xl font-bold text-[#0F172A] sm:text-3xl">
          Contact Roles
        </h1>

        <p className="mt-2 max-w-3xl text-sm leading-6 text-[#475569]">
          Configure the responsibilities a person may hold for an organisation,
          such as procurement contact, accounts contact, technical contact or
          decision maker.
        </p>
      </header>

      {canCreate ? (
        <form
          action={createCrmContactRoleAction}
          className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm sm:p-6"
        >
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFF1E8] text-[#F46C0B]">
              <Plus className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-base font-semibold text-[#0F172A]">
                Create contact role
              </h2>

              <p className="text-sm text-[#64748B]">
                Add a reusable role for organisation contacts.
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div>
              <label className={labelClass()} htmlFor="new-name">
                Name
              </label>

              <input
                id="new-name"
                name="name"
                required
                maxLength={100}
                placeholder="e.g. Procurement contact"
                className={`${fieldClass()} mt-1`}
              />
            </div>

            <div>
              <label className={labelClass()} htmlFor="new-slug">
                Slug
              </label>

              <input
                id="new-slug"
                name="slug"
                maxLength={120}
                placeholder="Optional, e.g. procurement-contact"
                className={`${fieldClass()} mt-1`}
              />
            </div>

            <div>
              <label className={labelClass()} htmlFor="new-sort-order">
                Sort order
              </label>

              <input
                id="new-sort-order"
                name="sort_order"
                type="number"
                min={0}
                max={32767}
                defaultValue={0}
                className={`${fieldClass()} mt-1`}
              />
            </div>

            <label className="mt-7 flex items-center gap-2 text-sm font-medium text-[#334155]">
              <input
                type="checkbox"
                name="is_active"
                defaultChecked
                className="h-4 w-4 rounded border-[#CBD5E1] accent-[#F46C0B]"
              />
              Active
            </label>

            <div className="md:col-span-2">
              <label className={labelClass()} htmlFor="new-description">
                Description
              </label>

              <textarea
                id="new-description"
                name="description"
                rows={3}
                placeholder="Explain when this role should be used."
                className={`${textareaClass()} mt-1`}
              />
            </div>
          </div>

          <div className="mt-5 flex justify-end border-t border-[#E2E8F0] pt-5">
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#F46C0B] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#D95C06]"
            >
              <Plus className="h-4 w-4" />
              Create role
            </button>
          </div>
        </form>
      ) : null}

      <div className="grid gap-4">
        {data.results.map((role) => (
          <article
            key={role.id}
            className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm"
          >
            {canEdit ? (
              <form action={updateCrmContactRoleAction} className="space-y-4">
                <input type="hidden" name="contact_role_id" value={role.id} />

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className={labelClass()}>Name</label>

                    <input
                      name="name"
                      required
                      maxLength={100}
                      defaultValue={role.name}
                      className={`${fieldClass()} mt-1`}
                    />
                  </div>

                  <div>
                    <label className={labelClass()}>Slug</label>

                    <input
                      name="slug"
                      maxLength={120}
                      defaultValue={role.slug}
                      className={`${fieldClass()} mt-1`}
                    />
                  </div>

                  <div>
                    <label className={labelClass()}>Sort order</label>

                    <input
                      name="sort_order"
                      type="number"
                      min={0}
                      max={32767}
                      defaultValue={role.sort_order}
                      className={`${fieldClass()} mt-1`}
                    />
                  </div>

                  <label className="mt-7 flex items-center gap-2 text-sm font-medium text-[#334155]">
                    <input
                      type="checkbox"
                      name="is_active"
                      defaultChecked={role.is_active}
                      className="h-4 w-4 rounded border-[#CBD5E1] accent-[#F46C0B]"
                    />
                    Active
                  </label>

                  <div className="md:col-span-2">
                    <label className={labelClass()}>Description</label>

                    <textarea
                      name="description"
                      rows={3}
                      defaultValue={role.description}
                      className={`${textareaClass()} mt-1`}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-3 border-t border-[#E2E8F0] pt-4 sm:flex-row sm:justify-end">
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#0F4C81] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0B3A63]"
                  >
                    <Save className="h-4 w-4" />
                    Save changes
                  </button>
                </div>
              </form>
            ) : (
              <div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h2 className="text-base font-semibold text-[#0F172A]">
                      {role.name}
                    </h2>

                    <p className="mt-1 text-sm text-[#64748B]">
                      {role.description || "No description."}
                    </p>
                  </div>

                  <span
                    className={
                      role.is_active
                        ? "rounded-full border border-[#BBF7D0] bg-[#F0FDF4] px-3 py-1 text-xs font-semibold text-[#166534]"
                        : "rounded-full border border-[#CBD5E1] bg-[#F1F5F9] px-3 py-1 text-xs font-semibold text-[#475569]"
                    }
                  >
                    {role.is_active ? "Active" : "Inactive"}
                  </span>
                </div>

                <p className="mt-3 text-xs text-[#94A3B8]">
                  Slug: {role.slug || "—"} · Sort: {role.sort_order}
                </p>
              </div>
            )}

            {canDelete ? (
              <form
                action={deleteCrmContactRoleAction}
                className="mt-3 flex justify-end"
              >
                <input type="hidden" name="contact_role_id" value={role.id} />

                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#FECACA] px-4 py-2 text-sm font-semibold text-[#B91C1C] transition hover:bg-[#FEF2F2]"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </form>
            ) : null}
          </article>
        ))}

        {data.results.length === 0 ? (
          <div className="rounded-2xl border border-[#E2E8F0] bg-white p-10 text-center text-sm text-[#64748B] shadow-sm">
            No contact roles have been created yet.
          </div>
        ) : null}
      </div>
    </section>
  );
}
