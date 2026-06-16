interface Item {
  description: string;
  quantity: number;
  unit_price: number;
  gst_percentage: number;
}

interface Props {
  items: Item[];
  discount: number;
}

export default function InvoiceTotals({
  items,
  discount,
}: Props) {
  const subtotal = items.reduce(
    (sum, item) =>
      sum +
      item.quantity *
        item.unit_price,
    0
  );

  const gstAmount = items.reduce(
    (sum, item) =>
      sum +
      item.quantity *
        item.unit_price *
        (item.gst_percentage / 100),
    0
  );

  const total =
    subtotal +
    gstAmount -
    discount;

  return (
    <div className="bg-white border rounded-2xl p-6">
      <h2 className="font-semibold mb-6">
        Totals
      </h2>

      <div className="space-y-3">
        <div className="flex justify-between">
          <span>Subtotal</span>

          <span>
            ₹
            {subtotal.toLocaleString(
              "en-IN"
            )}
          </span>
        </div>

        <div className="flex justify-between">
          <span>GST</span>

          <span>
            ₹
            {gstAmount.toLocaleString(
              "en-IN"
            )}
          </span>
        </div>

        <div className="flex justify-between">
          <span>Discount</span>

          <span>
            ₹
            {discount.toLocaleString(
              "en-IN"
            )}
          </span>
        </div>

        <div className="border-t pt-4 flex justify-between text-xl font-bold">
          <span>Total</span>

          <span>
            ₹
            {total.toLocaleString(
              "en-IN"
            )}
          </span>
        </div>
      </div>
    </div>
  );
}