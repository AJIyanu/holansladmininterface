import {
  Building2,
  Globe,
  MapPin,
  Phone,
  Save,
  Trash2,
  UserRound,
} from "lucide-react";

import {
  createCrmAddressAction,
  createCrmContactMethodAction,
  createCrmSourceAction,
  deleteCrmAddressAction,
  deleteCrmContactMethodAction,
  deleteCrmSourceAction,
  updateCrmAddressAction,
  updateCrmContactMethodAction,
  updateCrmProfileAction,
  updateCrmSourceAction,
} from "@/features/crm/party-related-actions";

import type {
  CrmAddress,
  CrmContactMethod,
  CrmPartyDetail,
  CrmPartySource,
} from "@/features/crm/types";

interface CrmPartyRelatedRecordsPanelProps {
  party: CrmPartyDetail;
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

function SubmitButton({ children = "Save" }: { children?: React.ReactNode }) {
  return (
    <button
      type="submit"
      className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#0F4C81] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#0B3A63]"
    >
      <Save className="h-4 w-4" />
      {children}
    </button>
  );
}

function DeleteButton() {
  return (
    <button
      type="submit"
      className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#FECACA] px-4 py-2 text-sm font-semibold text-[#B91C1C] transition hover:bg-[#FEF2F2]"
    >
      <Trash2 className="h-4 w-4" />
      Delete
    </button>
  );
}

function ActivePrimaryChecks({
  item,
}: {
  item?: {
    is_active?: boolean;
    is_primary?: boolean;
    is_verified?: boolean;
  };
}) {
  return (
    <div className="flex flex-wrap gap-4">
      <label className="flex items-center gap-2 text-sm font-medium text-[#334155]">
        <input
          type="checkbox"
          name="is_primary"
          defaultChecked={item?.is_primary ?? false}
          className="h-4 w-4 rounded border-[#CBD5E1] accent-[#F46C0B]"
        />
        Primary
      </label>

      <label className="flex items-center gap-2 text-sm font-medium text-[#334155]">
        <input
          type="checkbox"
          name="is_active"
          defaultChecked={item?.is_active ?? true}
          className="h-4 w-4 rounded border-[#CBD5E1] accent-[#F46C0B]"
        />
        Active
      </label>

      {"is_verified" in (item ?? {}) ? (
        <label className="flex items-center gap-2 text-sm font-medium text-[#334155]">
          <input
            type="checkbox"
            name="is_verified"
            defaultChecked={item?.is_verified ?? false}
            className="h-4 w-4 rounded border-[#CBD5E1] accent-[#F46C0B]"
          />
          Verified
        </label>
      ) : null}
    </div>
  );
}

function ProfilePanel({ party }: { party: CrmPartyDetail }) {
  const isIndividual = party.entity_kind === "INDIVIDUAL";
  const person = party.person_profile;
  const organisation = party.organisation_profile;

  return (
    <section className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFF7ED] text-[#F46C0B]">
          {isIndividual ? (
            <UserRound className="h-5 w-5" />
          ) : (
            <Building2 className="h-5 w-5" />
          )}
        </div>

        <div>
          <h2 className="text-base font-bold text-[#0F172A]">
            {isIndividual ? "Person profile" : "Organisation / trading profile"}
          </h2>

          <p className="mt-1 text-sm text-[#64748B]">
            Edit profile fields through the dedicated profile endpoint.
          </p>
        </div>
      </div>

      <details className="mt-5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
        <summary className="cursor-pointer text-sm font-semibold text-[#0F4C81]">
          Edit profile details
        </summary>

        <form action={updateCrmProfileAction} className="mt-4 space-y-4">
          <input type="hidden" name="party_id" value={party.id} />

          <input type="hidden" name="entity_kind" value={party.entity_kind} />

          {isIndividual ? (
            <div className="grid gap-4 md:grid-cols-2">
              <input
                name="title"
                placeholder="Title"
                defaultValue={person?.title ?? ""}
                className={fieldClass()}
              />

              <input
                name="first_name"
                placeholder="First name"
                defaultValue={person?.first_name ?? ""}
                className={fieldClass()}
              />

              <input
                name="middle_name"
                placeholder="Middle name"
                defaultValue={person?.middle_name ?? ""}
                className={fieldClass()}
              />

              <input
                name="last_name"
                placeholder="Last name"
                defaultValue={person?.last_name ?? ""}
                className={fieldClass()}
              />

              <input
                name="preferred_name"
                placeholder="Preferred name"
                defaultValue={person?.preferred_name ?? ""}
                className={`${fieldClass()} md:col-span-2`}
              />
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              <input
                name="legal_name"
                placeholder="Legal name"
                defaultValue={organisation?.legal_name ?? ""}
                className={fieldClass()}
              />

              <input
                name="trading_name"
                placeholder="Trading name"
                defaultValue={organisation?.trading_name ?? ""}
                className={fieldClass()}
              />

              <input
                name="website"
                type="url"
                inputMode="url"
                autoComplete="url"
                placeholder="https://example.com"
                title="Enter a complete URL beginning with http:// or https://"
                defaultValue={organisation?.website ?? ""}
                className={fieldClass()}
              />

              <input
                name="industry"
                placeholder="Industry"
                defaultValue={organisation?.industry ?? ""}
                className={fieldClass()}
              />

              <input
                name="registration_country"
                placeholder="Registration country, e.g. NG"
                maxLength={2}
                defaultValue={organisation?.registration_country ?? ""}
                className={`${fieldClass()} uppercase`}
              />

              <input
                name="incorporation_date"
                type="date"
                defaultValue={organisation?.incorporation_date ?? ""}
                className={fieldClass()}
              />

              <textarea
                name="business_description"
                rows={3}
                placeholder="Business description"
                defaultValue={organisation?.business_description ?? ""}
                className={`${textareaClass()} md:col-span-2`}
              />
            </div>
          )}

          <div className="flex justify-end border-t border-[#E2E8F0] pt-4">
            <SubmitButton>Save profile</SubmitButton>
          </div>
        </form>
      </details>
    </section>
  );
}

function ContactMethodForm({
  partyId,
  contactMethod,
}: {
  partyId: string;
  contactMethod?: CrmContactMethod;
}) {
  const action = contactMethod
    ? updateCrmContactMethodAction
    : createCrmContactMethodAction;

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="party_id" value={partyId} />

      {contactMethod ? (
        <input
          type="hidden"
          name="contact_method_id"
          value={contactMethod.id}
        />
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <select
          name="method_type"
          defaultValue={contactMethod?.method_type ?? "EMAIL"}
          className={fieldClass()}
        >
          <option value="EMAIL">Email</option>
          <option value="PHONE">Phone</option>
          <option value="MOBILE">Mobile</option>
          <option value="WHATSAPP">WhatsApp</option>
          <option value="WEBSITE">Website</option>
          <option value="SOCIAL_MEDIA">Social media</option>
          <option value="MARKETPLACE">Marketplace</option>
          <option value="OTHER">Other</option>
        </select>

        <input
          name="label"
          placeholder="Label"
          defaultValue={contactMethod?.label ?? ""}
          className={fieldClass()}
        />

        <input
          name="value"
          required
          placeholder="Value"
          defaultValue={contactMethod?.value ?? ""}
          className={`${fieldClass()} md:col-span-2`}
        />
      </div>

      <ActivePrimaryChecks item={contactMethod} />

      <div className="flex justify-end">
        <SubmitButton>
          {contactMethod ? "Save contact" : "Add contact"}
        </SubmitButton>
      </div>
    </form>
  );
}

function ContactMethodsPanel({ party }: { party: CrmPartyDetail }) {
  return (
    <section className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EFF6FF] text-[#1D4ED8]">
          <Phone className="h-5 w-5" />
        </div>

        <div>
          <h2 className="text-base font-bold text-[#0F172A]">
            Contact methods
          </h2>

          <p className="mt-1 text-sm text-[#64748B]">
            Manage email, phone, WhatsApp, website, social and marketplace
            contact records.
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-4">
        {party.contact_methods.map((contactMethod) => (
          <details
            key={contactMethod.id}
            className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4"
          >
            <summary className="cursor-pointer text-sm font-semibold text-[#0F4C81]">
              {contactMethod.method_type_display}: {contactMethod.value}
              {contactMethod.is_primary ? " · Primary" : ""}
            </summary>

            <div className="mt-4 space-y-3">
              <ContactMethodForm
                partyId={party.id}
                contactMethod={contactMethod}
              />

              <form
                action={deleteCrmContactMethodAction}
                className="flex justify-end"
              >
                <input type="hidden" name="party_id" value={party.id} />

                <input
                  type="hidden"
                  name="contact_method_id"
                  value={contactMethod.id}
                />

                <DeleteButton />
              </form>
            </div>
          </details>
        ))}

        <details className="rounded-xl border border-[#FED7AA] bg-[#FFF7ED] p-4">
          <summary className="cursor-pointer text-sm font-semibold text-[#C2410C]">
            Add contact method
          </summary>

          <div className="mt-4">
            <ContactMethodForm partyId={party.id} />
          </div>
        </details>
      </div>
    </section>
  );
}

function AddressForm({
  partyId,
  address,
}: {
  partyId: string;
  address?: CrmAddress;
}) {
  const action = address ? updateCrmAddressAction : createCrmAddressAction;

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="party_id" value={partyId} />

      {address ? (
        <input type="hidden" name="address_id" value={address.id} />
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <select
          name="address_type"
          defaultValue={address?.address_type ?? "OTHER"}
          className={fieldClass()}
        >
          <option value="REGISTERED">Registered</option>
          <option value="OFFICE">Office</option>
          <option value="BILLING">Billing</option>
          <option value="DELIVERY">Delivery</option>
          <option value="RESIDENTIAL">Residential</option>
          <option value="MARKET">Market / trading location</option>
          <option value="OTHER">Other</option>
        </select>

        <input
          name="label"
          placeholder="Label"
          defaultValue={address?.label ?? ""}
          className={fieldClass()}
        />

        <input
          name="line_1"
          placeholder="Address line 1"
          defaultValue={address?.line_1 ?? ""}
          className={fieldClass()}
        />

        <input
          name="line_2"
          placeholder="Address line 2"
          defaultValue={address?.line_2 ?? ""}
          className={fieldClass()}
        />

        <input
          name="city"
          placeholder="City"
          defaultValue={address?.city ?? ""}
          className={fieldClass()}
        />

        <input
          name="state_region"
          placeholder="State / region"
          defaultValue={address?.state_region ?? ""}
          className={fieldClass()}
        />

        <input
          name="postal_code"
          placeholder="Postal code"
          defaultValue={address?.postal_code ?? ""}
          className={fieldClass()}
        />

        <input
          name="country_code"
          placeholder="Country code, e.g. NG"
          maxLength={2}
          defaultValue={address?.country_code ?? ""}
          className={`${fieldClass()} uppercase`}
        />

        <textarea
          name="location_notes"
          rows={3}
          placeholder="Location notes"
          defaultValue={address?.location_notes ?? ""}
          className={`${textareaClass()} md:col-span-2`}
        />
      </div>

      <ActivePrimaryChecks item={address} />

      <div className="flex justify-end">
        <SubmitButton>{address ? "Save address" : "Add address"}</SubmitButton>
      </div>
    </form>
  );
}

function AddressesPanel({ party }: { party: CrmPartyDetail }) {
  return (
    <section className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F0FDF4] text-[#166534]">
          <MapPin className="h-5 w-5" />
        </div>

        <div>
          <h2 className="text-base font-bold text-[#0F172A]">
            Addresses and locations
          </h2>

          <p className="mt-1 text-sm text-[#64748B]">
            Manage registered address, office, billing, delivery, residential or
            market locations.
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-4">
        {party.addresses.map((address) => (
          <details
            key={address.id}
            className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4"
          >
            <summary className="cursor-pointer text-sm font-semibold text-[#0F4C81]">
              {address.address_type_display}:{" "}
              {address.label || address.line_1 || address.city || "Location"}
              {address.is_primary ? " · Primary" : ""}
            </summary>

            <div className="mt-4 space-y-3">
              <AddressForm partyId={party.id} address={address} />

              <form
                action={deleteCrmAddressAction}
                className="flex justify-end"
              >
                <input type="hidden" name="party_id" value={party.id} />

                <input type="hidden" name="address_id" value={address.id} />

                <DeleteButton />
              </form>
            </div>
          </details>
        ))}

        <details className="rounded-xl border border-[#FED7AA] bg-[#FFF7ED] p-4">
          <summary className="cursor-pointer text-sm font-semibold text-[#C2410C]">
            Add address / location
          </summary>

          <div className="mt-4">
            <AddressForm partyId={party.id} />
          </div>
        </details>
      </div>
    </section>
  );
}

function SourceForm({
  partyId,
  source,
}: {
  partyId: string;
  source?: CrmPartySource;
}) {
  const action = source ? updateCrmSourceAction : createCrmSourceAction;

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="party_id" value={partyId} />

      {source ? (
        <input type="hidden" name="source_id" value={source.id} />
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <select
          name="source_type"
          defaultValue={source?.source_type ?? "DIRECT_CONTACT"}
          className={fieldClass()}
        >
          <option value="ONLINE_MARKETPLACE">Online marketplace</option>
          <option value="PHYSICAL_MARKET">Physical market</option>
          <option value="DIRECT_CONTACT">Direct contact</option>
          <option value="REFERRAL">Referral</option>
          <option value="WEBSITE">Website</option>
          <option value="SOCIAL_MEDIA">Social media</option>
          <option value="PREVIOUS_TRANSACTION">Previous transaction</option>
          <option value="TRADE_DIRECTORY">Trade directory</option>
          <option value="EVENT">Event</option>
          <option value="OTHER">Other</option>
        </select>

        <input
          name="platform_name"
          placeholder="Platform name"
          defaultValue={source?.platform_name ?? ""}
          className={fieldClass()}
        />

        <input
          name="seller_name"
          placeholder="Seller name"
          defaultValue={source?.seller_name ?? ""}
          className={fieldClass()}
        />

        <input
          name="external_id"
          placeholder="External ID"
          defaultValue={source?.external_id ?? ""}
          className={fieldClass()}
        />

        <input
          name="profile_url"
          placeholder="Profile URL"
          defaultValue={source?.profile_url ?? ""}
          className={fieldClass()}
        />

        <input
          name="listing_url"
          placeholder="Listing URL"
          defaultValue={source?.listing_url ?? ""}
          className={fieldClass()}
        />

        <input
          name="market_name"
          placeholder="Market name"
          defaultValue={source?.market_name ?? ""}
          className={fieldClass()}
        />

        <input
          name="referrer_name"
          placeholder="Referrer name"
          defaultValue={source?.referrer_name ?? ""}
          className={fieldClass()}
        />

        <input
          name="discovered_at"
          type="date"
          defaultValue={
            source?.discovered_at ?? new Date().toISOString().slice(0, 10)
          }
          className={fieldClass()}
        />

        <textarea
          name="location_details"
          rows={3}
          placeholder="Location details"
          defaultValue={source?.location_details ?? ""}
          className={`${textareaClass()} md:col-span-2`}
        />

        <textarea
          name="notes"
          rows={3}
          placeholder="Source notes"
          defaultValue={source?.notes ?? ""}
          className={`${textareaClass()} md:col-span-2`}
        />
      </div>

      <ActivePrimaryChecks item={source} />

      <div className="flex justify-end">
        <SubmitButton>{source ? "Save source" : "Add source"}</SubmitButton>
      </div>
    </form>
  );
}

function SourcesPanel({ party }: { party: CrmPartyDetail }) {
  return (
    <section className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFF7ED] text-[#C2410C]">
          <Globe className="h-5 w-5" />
        </div>

        <div>
          <h2 className="text-base font-bold text-[#0F172A]">
            Sources and marketplace records
          </h2>

          <p className="mt-1 text-sm text-[#64748B]">
            Manage Jumia, eBay, Amazon, physical market, referral and discovery
            details.
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-4">
        {party.sources.map((source) => (
          <details
            key={source.id}
            className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4"
          >
            <summary className="cursor-pointer text-sm font-semibold text-[#0F4C81]">
              {source.source_type_display}:{" "}
              {source.reference_label || source.platform_name || "Source"}
              {source.is_primary ? " · Primary" : ""}
            </summary>

            <div className="mt-4 space-y-3">
              <SourceForm partyId={party.id} source={source} />

              <form action={deleteCrmSourceAction} className="flex justify-end">
                <input type="hidden" name="party_id" value={party.id} />

                <input type="hidden" name="source_id" value={source.id} />

                <DeleteButton />
              </form>
            </div>
          </details>
        ))}

        <details className="rounded-xl border border-[#FED7AA] bg-[#FFF7ED] p-4">
          <summary className="cursor-pointer text-sm font-semibold text-[#C2410C]">
            Add source
          </summary>

          <div className="mt-4">
            <SourceForm partyId={party.id} />
          </div>
        </details>
      </div>
    </section>
  );
}

export function CrmPartyRelatedRecordsPanel({
  party,
}: CrmPartyRelatedRecordsPanelProps) {
  return (
    <section className="space-y-5">
      <ProfilePanel party={party} />

      <div className="grid gap-5 xl:grid-cols-2">
        <ContactMethodsPanel party={party} />
        <AddressesPanel party={party} />
      </div>

      <SourcesPanel party={party} />
    </section>
  );
}
