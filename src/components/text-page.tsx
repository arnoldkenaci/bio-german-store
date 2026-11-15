export function TextPage({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <h1 className="text-5xl">{title}</h1>
      <div className="prose-legal mt-8">{children}</div>
    </div>
  );
}

/** Marks a spot where the final legal text still has to be pasted in. */
export function Placeholder({ what }: { what: string }) {
  return (
    <p className="rounded-xl border border-dashed border-copper bg-sand p-4 text-sm">
      ⚠️ Platzhalter: Hier den finalen Text „{what}“ einfügen (Datei unter <code>src/app/…/page.tsx</code>).
    </p>
  );
}
