type LoadingStatusProps = {
  label: string;
};

/**
 * Announces loading state to assistive technology while the visual skeleton
 * stays hidden from the accessibility tree.
 */
export function LoadingStatus({ label }: LoadingStatusProps) {
  return (
    <span className="visuallyHidden" role="status" aria-live="polite" aria-atomic="true">
      {label}
    </span>
  );
}
