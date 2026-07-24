import {
  type AvatarIdentity,
  initialIdentity,
  isAvatarIdentity,
} from "@accidental-revenue/orbsona";

export const IDENTITY_DRAFT_EVENT = "orbsona:identity-draft-change";
const IDENTITY_DRAFT_KEY = "orbsona:identity";

function notifyDraftChange() {
  window.dispatchEvent(new Event("orbsona:identity-change"));
  window.dispatchEvent(new Event(IDENTITY_DRAFT_EVENT));
}

export function readIdentityDraft(): AvatarIdentity | null {
  try {
    const stored = window.localStorage.getItem(IDENTITY_DRAFT_KEY);
    if (!stored) return null;
    const value = JSON.parse(stored) as unknown;
    return isAvatarIdentity(value) ? value : null;
  } catch {
    return null;
  }
}

export function readCurrentIdentity(): AvatarIdentity {
  return readIdentityDraft() ?? initialIdentity;
}

export function saveIdentityDraft(identity: AvatarIdentity): boolean {
  try {
    window.localStorage.setItem(IDENTITY_DRAFT_KEY, JSON.stringify(identity));
    notifyDraftChange();
    return true;
  } catch {
    return false;
  }
}

export function clearIdentityDraft(): boolean {
  try {
    window.localStorage.removeItem(IDENTITY_DRAFT_KEY);
    notifyDraftChange();
    return true;
  } catch {
    return false;
  }
}
