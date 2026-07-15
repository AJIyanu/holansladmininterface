import type { CrmDuplicateMatch } from "./types";

export interface CrmPartyActionState {
  ok: boolean;
  message: string;
  duplicateMatches?: CrmDuplicateMatch[];
}

export interface CrmRegistrationActionState {
  ok: boolean;
  message: string;
  revealedValue?: string;
}

export interface CrmDocumentActionState {
  ok: boolean;
  message: string;
}

export interface CrmLifecycleActionState {
  ok: boolean;
  message: string;
}

export const initialCrmPartyActionState: CrmPartyActionState = {
  ok: false,
  message: "",
};

export const initialCrmRegistrationActionState: CrmRegistrationActionState = {
  ok: false,
  message: "",
};

export const initialCrmDocumentActionState: CrmDocumentActionState = {
  ok: false,
  message: "",
};

export const initialCrmLifecycleActionState: CrmLifecycleActionState = {
  ok: false,
  message: "",
};
