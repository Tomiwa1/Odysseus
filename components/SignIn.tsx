"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import Logo from "./Logo";
import Portal from "./Portal";
import { signIn, signUp } from "../app/auth-actions";

/* Sign in.
 *
 * One screen for both, because the only honest difference is whether we
 * already know you, and making people choose a tab before they have
 * typed anything is a decision asked too early.
 *
 * The bird is here for the same reason it is on the landing page: this
 * is the first thing a person sees, and the product's whole argument is
 * that job hunting does not have to feel like filing a tax return. */
export default function SignIn() {
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
