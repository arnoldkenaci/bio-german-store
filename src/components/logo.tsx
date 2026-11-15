/** Text logo with a small tree mark. Replace with /public/logo.svg once the brand file is available. */
export function Logo() {
  return (
    <span className="flex items-center gap-2.5">
      <svg width="30" height="30" viewBox="0 0 32 32" aria-hidden className="text-copper">
        <path d="M16 30V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M16 20l-4-3M16 18l4-3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        <circle cx="16" cy="11" r="8.5" fill="currentColor" opacity="0.18" />
        <circle cx="12" cy="10" r="3.2" fill="currentColor" opacity="0.55" />
        <circle cx="19.5" cy="8.5" r="3.6" fill="currentColor" opacity="0.7" />
        <circle cx="17" cy="13.5" r="3" fill="currentColor" opacity="0.45" />
        <path d="M9 30h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
      <span className="font-serif text-2xl leading-none font-semibold tracking-wide">India House</span>
    </span>
  );
}
