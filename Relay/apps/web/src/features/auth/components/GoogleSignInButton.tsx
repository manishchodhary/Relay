import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../lib/axios";
import { saveSession } from "../../../lib/session";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (options: {
            client_id: string;
            callback: (response: { credential: string }) => void;
          }) => void;
          renderButton: (element: HTMLElement, options: Record<string, unknown>) => void;
        };
      };
    };
  }
}

type GoogleAuthResponse = {
  data?: {
    accessToken?: string;
    user?: { id: string; name: string; email: string };
  };
  message?: string;
};

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

export default function GoogleSignInButton() {
  const buttonRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!clientId || !buttonRef.current) return;

    let active = true;
    const renderGoogleButton = () => {
      if (!active || !buttonRef.current || !window.google) return;
      buttonRef.current.replaceChildren();
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async ({ credential }) => {
          setError("");
          setLoading(true);
          try {
            const response = await api.post<GoogleAuthResponse>("/auth/google", { credential });
            const result = response.data.data;
            if (!result?.accessToken || !result.user) {
              throw new Error("Google sign-in response was incomplete.");
            }
            saveSession(result.accessToken, result.user);
            navigate("/home", { replace: true });
          } catch (cause) {
            const message = cause instanceof Error ? cause.message : "";
            setError(message || "Google sign-in failed. Please try again.");
          } finally {
            setLoading(false);
          }
        },
      });
      window.google.accounts.id.renderButton(buttonRef.current, {
        type: "standard",
        theme: "outline",
        size: "large",
        shape: "rectangular",
        text: "continue_with",
        width: 320,
        logo_alignment: "left",
      });
    };

    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[src="https://accounts.google.com/gsi/client"]',
    );
    if (window.google) {
      renderGoogleButton();
    } else if (existingScript) {
      existingScript.addEventListener("load", renderGoogleButton, { once: true });
    } else {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = renderGoogleButton;
      script.onerror = () => setError("Google sign-in could not load. Check your connection.");
      document.head.appendChild(script);
    }

    return () => {
      active = false;
    };
  }, [navigate]);

  if (!clientId) {
    return <p className="text-sm text-amber-700">Google sign-in needs VITE_GOOGLE_CLIENT_ID in the frontend environment.</p>;
  }

  return (
    <div className="space-y-2">
      <div className="flex min-h-10 justify-center" ref={buttonRef} />
      {loading && <p className="text-center text-sm text-slate-500">Signing in with Google...</p>}
      {error && <p role="alert" className="text-center text-sm text-rose-700">{error}</p>}
    </div>
  );
}
