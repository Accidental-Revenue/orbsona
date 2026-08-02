import {
  type AvatarIdentity,
  initialIdentity,
  isAvatarIdentity,
  isLegacyAvatarIdentityV1,
  isTopologyPreviewIdentity,
  migrateLegacyIdentityV1,
  migrateTopologyPreviewIdentity,
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
    if (isAvatarIdentity(value)) return value;
    if (isLegacyAvatarIdentityV1(value)) {
      const migrated = migrateLegacyIdentityV1(value);
      window.localStorage.setItem(IDENTITY_DRAFT_KEY, JSON.stringify(migrated));
      return migrated;
    }
    if (isTopologyPreviewIdentity(value)) {
      const migrated = migrateTopologyPreviewIdentity(value);
      window.localStorage.setItem(IDENTITY_DRAFT_KEY, JSON.stringify(migrated));
      return migrated;
    }
    return null;
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
