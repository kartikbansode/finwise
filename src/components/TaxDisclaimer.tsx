export default function TaxDisclaimer() {
  return (
    <div className="mt-6 rounded-xl border border-amber-300 bg-amber-50 p-4">
      <h3 className="font-semibold text-amber-900">
        Important Disclaimer
      </h3>

      <p className="mt-2 text-sm text-amber-800">
        Tax calculations, GST estimates, advance tax
        estimates, presumptive taxation calculations
        under Sections 44ADA and 44AD, financial
        projections, and regime comparisons are
        provided for informational purposes only.
      </p>

      <p className="mt-2 text-sm text-amber-800">
        Actual tax liability may differ based on
        deductions, exemptions, business structure,
        tax law updates, and personal circumstances.
      </p>

      <p className="mt-2 text-sm text-amber-800">
        Please consult a Chartered Accountant (CA),
        tax professional, or financial advisor before
        filing returns or making financial decisions.
      </p>
    </div>
  );
}