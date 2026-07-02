import type { CurrentUser } from "@/types/auth";

import type { StaffProfile } from "../staff-list-types";

export interface StaffActionContentProps {
  profile: StaffProfile;
  currentUser: CurrentUser;
  onClose: () => void;
  onCompleted: () => void;
}
