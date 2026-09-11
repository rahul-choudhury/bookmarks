export function ButtonSpinner({
  label,
  reserve,
}: {
  label: string;
  reserve: string;
}) {
  return (
    <span className="button-spinner-wrap">
      <span className="button-spinner-label" aria-hidden="true">
        {reserve}
      </span>
      <span className="button-spinner" aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </span>
  );
}
