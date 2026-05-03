export type LastBloomProfile = {
  id: string;
  email: string;
  displayName: string;
  deviceId: string;
};

const PROFILE_KEY = "last-bloom-profile";

function createId(prefix: string) {
  const value =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  return `${prefix}_${value}`;
}

export function getStoredProfile(): LastBloomProfile | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(PROFILE_KEY);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as LastBloomProfile;
  } catch {
    window.localStorage.removeItem(PROFILE_KEY);
    return null;
  }
}

export function saveProfile(email: string, displayName: string) {
  const existing = getStoredProfile();
  const profile: LastBloomProfile = {
    id: existing?.id ?? createId("user"),
    email,
    displayName,
    deviceId: existing?.deviceId ?? createId("device")
  };

  window.localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));

  return profile;
}

export function getProfileHeaders(profile: LastBloomProfile | null): HeadersInit {
  if (!profile) {
    return {};
  }

  return {
    "x-last-bloom-user-id": profile.id,
    "x-last-bloom-email": profile.email,
    "x-last-bloom-display-name": profile.displayName,
    "x-last-bloom-device": profile.deviceId
  };
}
