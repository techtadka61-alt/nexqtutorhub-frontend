/**
 * "Continue with Google" through Firebase Auth. Firebase is used only for the Google popup and the ID token it
 * returns; the API verifies that token and issues our own session, so the Firebase session is signed out at once.
 * The SDK is imported on click, keeping it out of every page's bundle.
 */

// Referenced literally so Next.js inlines them at build time.
const FIREBASE_CONFIG = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export const isGoogleSignInConfigured = !!(FIREBASE_CONFIG.apiKey && FIREBASE_CONFIG.authDomain && FIREBASE_CONFIG.projectId);

export class GoogleSignInError extends Error {
  /** The user closed the popup or started another one: not worth an error message. */
  cancelled: boolean;
  constructor(message: string, cancelled = false) {
    super(message);
    this.name = "GoogleSignInError";
    this.cancelled = cancelled;
  }
}

const CANCELLED_CODES = new Set(["auth/popup-closed-by-user", "auth/cancelled-popup-request", "auth/user-cancelled"]);

const MESSAGES: Record<string, string> = {
  "auth/popup-blocked": "Your browser blocked the Google sign-in window. Please allow pop-ups for this site and try again.",
  "auth/unauthorized-domain": "Google sign-in isn't enabled for this website address yet. Please use email and password.",
  "auth/operation-not-allowed": "Google sign-in isn't enabled yet. Please use email and password.",
  "auth/network-request-failed": "Couldn't reach Google. Check your internet connection and try again.",
};

/**
 * Opens the Google popup and returns a fresh Firebase ID token for the chosen account. Throws GoogleSignInError
 * (with `cancelled` set when the user just closed the popup).
 */
export async function getGoogleIdToken(): Promise<string> {
  if (!isGoogleSignInConfigured) throw new GoogleSignInError("Google sign-in isn't available right now. Please use email and password.");
  const [{ getApp, getApps, initializeApp }, { getAuth, GoogleAuthProvider, signInWithPopup, signOut }] = await Promise.all([
    import("firebase/app"),
    import("firebase/auth"),
  ]);
  const app = getApps().length ? getApp() : initializeApp(FIREBASE_CONFIG);
  const auth = getAuth(app);
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  try {
    const { user } = await signInWithPopup(auth, provider);
    return await user.getIdToken();
  } catch (error) {
    const code = (error as { code?: string }).code ?? "";
    if (CANCELLED_CODES.has(code)) throw new GoogleSignInError("Google sign-in was cancelled.", true);
    throw new GoogleSignInError(MESSAGES[code] ?? "Google sign-in failed. Please try again.");
  } finally {
    // Our API session is the only session; don't leave a Firebase one behind.
    await signOut(auth).catch(() => undefined);
  }
}
