export default function Textarea({ className = "", ...props }) {
  return (
    <textarea
      {...props}
      className={`w-full rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] px-3 py-2 text-[var(--font-size-sm)] text-[var(--input-text)] placeholder:text-[var(--input-placeholder)] ${className}`}
    />
  );
}
