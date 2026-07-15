import { ServerFetchError } from "@/lib/server-fetch";

export type CrmFieldErrors = Record<string, string[]>;

export interface CrmApiErrorBody {
  detail?: string;
  code?: string;
  non_field_errors?: string[];
  [field: string]: unknown;
}

/**
 * Convert a backend validation value into an array of messages.
 *
 * @param value Backend error value.
 * @returns User-readable messages.
 */
function normaliseErrorMessages(value: unknown): string[] {
  if (typeof value === "string") {
    return [value];
  }

  if (Array.isArray(value)) {
    return value.flatMap(normaliseErrorMessages);
  }

  if (value && typeof value === "object") {
    return Object.values(value).flatMap(normaliseErrorMessages);
  }

  return [];
}

/**
 * Extract field-level errors from a server request failure.
 *
 * @param error Unknown thrown error.
 * @returns Field names mapped to backend messages.
 */
export function getCrmFieldErrors(error: unknown): CrmFieldErrors {
  if (!(error instanceof ServerFetchError)) {
    return {};
  }

  const body = error.responseBody;

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return {};
  }

  const ignoredKeys = new Set(["detail", "code", "non_field_errors"]);

  return Object.fromEntries(
    Object.entries(body)
      .filter(([key]) => !ignoredKeys.has(key))
      .map(([key, value]) => [key, normaliseErrorMessages(value)])
      .filter(([, messages]) => messages.length > 0),
  );
}

/**
 * Return the most useful user-facing CRM error message.
 *
 * @param error Unknown thrown error.
 * @returns Message suitable for an alert or toast.
 */
export function getCrmErrorMessage(error: unknown): string {
  if (error instanceof ServerFetchError) {
    const body = error.responseBody;

    if (body && typeof body === "object" && !Array.isArray(body)) {
      const apiBody = body as CrmApiErrorBody;

      if (apiBody.detail) {
        return apiBody.detail;
      }

      if (apiBody.non_field_errors?.length) {
        return apiBody.non_field_errors.join(" ");
      }

      const fieldMessages = Object.entries(apiBody)
        .filter(([key]) => key !== "code" && key !== "detail")
        .flatMap(([, value]) => normaliseErrorMessages(value));

      if (fieldMessages.length) {
        return fieldMessages.join(" ");
      }
    }

    if (error.status === 403) {
      return "You do not have permission to perform this CRM operation.";
    }

    if (error.status === 404) {
      return "The requested CRM record could not be found.";
    }

    if (error.status === 409) {
      return "The CRM operation conflicts with an existing record.";
    }

    if (error.status >= 500) {
      return "The CRM service is temporarily unavailable.";
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "The CRM operation could not be completed.";
}
