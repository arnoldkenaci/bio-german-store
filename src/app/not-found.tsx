import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <h1 className="text-5xl">Seite nicht gefunden</h1>
      <p className="mt-4 text-ink-soft">Diese Seite gibt es leider nicht (mehr).</p>
      <Link href="/produkte" className="btn btn-primary mt-8">Zu den Produkten</Link>
    </div>
  );
}
