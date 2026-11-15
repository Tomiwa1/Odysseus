"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import Logo from "./Logo";
import Portal from "./Portal";
import { signIn, signUp } from "../app/auth-actions";

/* Google's own mark, inline.
 *
 * A brand logo, not an interface icon, so it does not come from the
 * icon set and does not take the icon colour. Their guidelines ask for
 * these four colours on a light button, and a button that says Google
 * should look like Google or it reads as a phishing page. */
const GoogleMark = () => (
  <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
    <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.6l6.7-6.7C35.6 2.6 30.2 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.8 6.1C12.3 13.5 17.6 9.5 24 9.5z" />
    <path fill="#4285F4" d="M46.1 24.6c0-1.6-.1-3.2-.4-4.6H24v9.1h12.4c-.5 2.9-2.2 5.3-4.6 7l7.6 5.9c4.4-4.1 6.7-10.1 6.7-17.4z" />
    <path fill="#FBBC05" d="M10.4 28.7c-.5-1.5-.8-3-.8-4.7s.3-3.2.8-4.7l-7.8-6.1C.9 16.3 0 20 0 24s.9 7.7 2.6 10.8l7.8-6.1z" />
    <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.6-5.9c-2.1 1.4-4.8 2.3-8.3 2.3-6.4 0-11.7-4-13.6-9.8l-7.8 6.1C6.5 42.6 14.6 48 24 48z" />
  </svg>
);

/* Sign in.
 *
 * One screen for both, because the only honest difference is whether we
 * already know you, and making people choose a tab before they have
 * typed anything is a decision asked too early.
 *
 * The bird is here for the same reason it is on the landing page: this
 * is the first thing a person sees, and the product's whole argument is
 * that job hunting does not have to feel like filing a tax return. */
export default function SignIn({
  google = false,
  notice = null,
}: { google?: boolean; notice?: string | null }) {
  const [mode, setMode] = useState<"in" | "up">("in");
  /* React clears an uncontrolled form once a server action returns, so
     a rejected sign in threw away the address as well as the password.
     Retyping an email to find out a password was wrong is a punishment
     for the wrong mistake, so the address is held here. */
  const [email, setEmail] = useState("");
  const action = mode === "in" ? signIn : signUp;
  const [state, submit, pending] = useActionState(action, null as { error?: string } | null);

  return (
    <div className="flow si">
      <header className="flow-top">
        <Link href="/"><Logo kind="letter" size={40} /></Link>
      </header>

      <main className="flow-body">
        <div className="flow-inner si-inner">
          <Portal size="flow" />

          <h1 className="display si-h1">
            {mode === "in" ? "Welcome back." : "Let's get you started."}
          </h1>
          <p className="flow-sub">
            {mode === "in"
              ? "Pick up where the search left off."
              : "One account. Your CV goes in next, and nothing is sent anywhere."}
          </p>

          {/* Google first, because it is one tap and the form is not.
              It only appears when it is actually wired, so the screen
              never offers a button that cannot work. */}
          {google && (
            <>
              <a className="btn btn-quiet btn-block si-google" href="/auth/google">
                <GoogleMark />
                Continue with Google
              </a>
              <p className="si-or"><span>or</span></p>
            </>
          )}

          {notice && <p className="si-error" role="alert">{notice}</p>}

          <form action={submit} className="si-form">
            {mode === "up" && (
              <label className="si-field">
                <span>Your name</span>
                <input name="name" autoComplete="name" placeholder="Tomiwa Akinbode" />
              </label>
            )}

            <label className="si-field">
              <span>Email</span>
              <input
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>

            <label className="si-field">
              <span>Password</span>
              <input
                name="password"
                type="password"
                required
                minLength={mode === "up" ? 8 : undefined}
                autoComplete={mode === "in" ? "current-password" : "new-password"}
                placeholder={mode === "up" ? "Eight characters or more" : ""}
              />
            </label>

            {/* the same message for a wrong password and an unknown
                email, so a list of addresses cannot be tested here */}
            {state?.error && <p className="si-error" role="alert">{state.error}</p>}

            <button className="btn btn-primary btn-block" type="submit" disabled={pending}>
              {pending ? "One moment" : mode === "in" ? "Sign in" : "Create the account"}
            </button>
          </form>

          <p className="si-swap">
            {mode === "in" ? "No account yet?" : "Already have one?"}{" "}
            <button type="button" onClick={() => setMode(mode === "in" ? "up" : "in")}>
              {mode === "in" ? "Make one" : "Sign in"}
            </button>
          </p>

          <p className="flow-note si-note">
            Free while we build it. No card, and nothing is shared with anyone until
            you send an application.
          </p>
        </div>
      </main>
    </div>
  );
}
