import { useEffect, useState } from 'react';
import { completeOAuthCallback, homePathAfterOAuth } from '@/lib/oauth';

export default function OAuthCallback() {
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    const finish = async () => {
      try {
        await completeOAuthCallback();
        window.location.replace(homePathAfterOAuth());
      } catch (cause) {
        if (!cancelled) {
          setError(cause instanceof Error ? cause.message : String(cause));
        }
      }
    };
    void finish();
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return (
      <section className="mx-auto max-w-lg p-8 text-sm">
        <h2 className="font-display mb-3 text-xl">Salesforce login failed</h2>
        <pre className="text-destructive mb-4 whitespace-pre-wrap" role="alert">
          {error}
        </pre>
        <a className="underline" href={homePathAfterOAuth()}>
          Back to login
        </a>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-lg p-8 text-sm">
      <p>Completing Salesforce login…</p>
    </section>
  );
}
