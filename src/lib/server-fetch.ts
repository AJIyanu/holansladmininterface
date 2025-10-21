import { cookies } from "next/headers";

// Types
interface FetchOptions {
  method?: "GET" | "HEAD" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: Record<string, unknown> | string | FormData | null;
  headers?: Record<string, string>;
  retries?: number;
  enableRetry?: boolean;
  cache?: RequestCache;
}

interface FetchResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    technical?: string;
    statusCode?: number;
  };
}

/**
 * Centralized server-side fetch utility with automatic token injection,
 * retry mechanism, and standardized error handling
 */
export async function serverFetch<T = unknown>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<FetchResponse<T>> {
  const {
    method,
    body,
    headers = {},
    retries = 3,
    enableRetry = true,
    cache = "no-store",
  } = options;

  // Determine HTTP method
  const httpMethod = method || (body ? "POST" : "GET");

  // Normalize endpoint to full URL
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
  const fullUrl = endpoint.startsWith("http")
    ? endpoint
    : `${baseUrl}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  // Get access token from cookies
  const token = (await cookies()).get("access_token")?.value;

  // Prepare headers
  const requestHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...headers,
  };

  // Add authorization headers if token exists
  if (token) {
    requestHeaders["Authorization"] = `Bearer ${token}`;
    requestHeaders["X-Auth-Token"] = `Bearer ${token}`;
  }

  // Prepare request body
  let requestBody: string | undefined;
  if (body && httpMethod !== "GET" && httpMethod !== "HEAD") {
    requestBody = typeof body === "string" ? body : JSON.stringify(body);
  }

  // Retry logic
  let lastError: FetchResponse<T>["error"];
  const maxRetries = enableRetry ? retries : 0;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      console.log(
        `[serverFetch] ${httpMethod} ${fullUrl} (Attempt ${attempt + 1}/${
          maxRetries + 1
        })`
      );

      const response = await fetch(fullUrl, {
        method: httpMethod,
        headers: requestHeaders,
        body: requestBody,
        cache,
      });

      // Handle successful responses
      if (response.ok) {
        const contentType = response.headers.get("content-type");
        let data: T;

        if (contentType?.includes("application/json")) {
          data = (await response.json()) as T;
        } else {
          data = (await response.text()) as unknown as T;
        }

        return {
          success: true,
          data,
        };
      }

      // Handle HTTP errors (4xx, 5xx)
      const errorBody = await response.text();
      let errorMessage: string;
      let technicalDetails: string;

      try {
        const errorJson = JSON.parse(errorBody);
        errorMessage = errorJson.message || errorJson.error || "Request failed";
        technicalDetails = JSON.stringify(errorJson);
      } catch {
        errorMessage = "Request failed";
        technicalDetails = errorBody || response.statusText;
      }

      // For client errors (4xx), don't retry
      if (response.status >= 400 && response.status < 500) {
        return {
          success: false,
          error: {
            message: `${getClientFriendlyMessage(
              response.status
            )} ${errorMessage}`,
            technical: `${response.status}: ${technicalDetails}`,
            statusCode: response.status,
          },
        };
      }

      // For server errors (5xx), retry if enabled
      lastError = {
        message: "Service temporarily unavailable",
        technical: `${response.status}: ${technicalDetails}`,
        statusCode: response.status,
      };

      // Don't retry if this is the last attempt
      if (attempt === maxRetries) break;

      // Exponential backoff
      await sleep(Math.min(1000 * Math.pow(2, attempt), 10000));
    } catch (err) {
      const error = err as Error;
      console.error(
        `[serverFetch] Network error on attempt ${attempt + 1}:`,
        error
      );

      lastError = {
        message: `Unable to connect to service`,
        technical: `Network error: ${error.message || "Unknown error"}`,
        statusCode: 0,
      };

      // Don't retry if this is the last attempt or retry is disabled
      if (attempt === maxRetries || !enableRetry) break;

      // Exponential backoff
      await sleep(Math.min(1000 * Math.pow(2, attempt), 10000));
    }
  }

  // All retries exhausted
  return {
    success: false,
    error: lastError || {
      message: "Service unavailable",
      technical: "Maximum retry attempts exceeded",
    },
  };
}

/**
 * Helper function to convert HTTP status codes to user-friendly messages
 */
function getClientFriendlyMessage(statusCode: number): string {
  switch (statusCode) {
    case 400:
      return "Invalid request. Please check your input.";
    case 401:
      return "Authentication required. Please log in again.";
    case 403:
      return "You don't have permission to perform this action.";
    case 404:
      return "The requested resource was not found.";
    case 409:
      return "Conflict detected. The resource may already exist.";
    case 422:
      return "Validation failed. Please check your input.";
    case 429:
      return "Too many requests. Please try again later.";
    case 500:
      return "Internal server error. Please try again.";
    case 502:
      return "Service temporarily unavailable.";
    case 503:
      return "Service is under maintenance. Please try again later.";
    case 504:
      return "Request timeout. Please try again.";
    default:
      return "An error occurred. Please try again or contact support.";
  }
}

/**
 * Sleep utility for retry backoff
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Usage examples:

/*
// Simple GET request
const result = await serverFetch("/crm/contacts/");

// POST with body
const result = await serverFetch("/crm/contacts/", {
  method: "POST",
  body: { name: "John Doe", email: "john@example.com" }
});

// PUT with custom headers and no retry
const result = await serverFetch(`/crm/contacts/${id}/`, {
  method: "PUT",
  body: values,
  headers: { "X-Custom-Header": "value" },
  enableRetry: false
});

// Full URL with custom retry count
const result = await serverFetch("https://api.example.com/data", {
  retries: 5
});

// Handle response
if (result.success) {
  console.log("Data:", result.data);
} else {
  console.error("Error:", result.error?.message);
  console.error("Technical:", result.error?.technical);
}
*/
