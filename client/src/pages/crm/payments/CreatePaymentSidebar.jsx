import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProjectInvoices } from "../../../store/invoiceSlice";
import { createNewPayment } from "../../../store/paymentSlice";
import Button from "../../../components/ui/Button";
import Alert from "../../../components/ui/Alert";

const CreatePaymentSidebar = ({ isOpen, onClose, projectId, onSuccess }) => {
  const dispatch = useDispatch();
  const { invoices, loading: invoicesLoading } = useSelector(
    (state) => state.invoices
  );
  const { loading, error } = useSelector((state) => state.payments);
  const [formData, setFormData] = useState({
    invoice: "",
    amount: "",
    paymentMethod: "credit_card",
    paymentDate: new Date().toISOString().split("T")[0],
    transactionId: "",
    notes: "",
  });

  useEffect(() => {
    if (isOpen && projectId) {
      dispatch(
        fetchProjectInvoices({
          projectId,
          params: { status: "sent,overdue,partially_paid", limit: 100 },
        })
      );
    }
  }, [dispatch, isOpen, projectId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "invoice") {
      const selectedInvoice = invoices.find((i) => i._id === value);
      if (selectedInvoice) {
        setFormData((prev) => ({
          ...prev,
          invoice: value,
          amount: selectedInvoice.remainingAmount || selectedInvoice.total,
          customer: selectedInvoice.customer?._id || selectedInvoice.customer,
          deal: selectedInvoice.deal?._id || selectedInvoice.deal,
          company:
            selectedInvoice.company?._id || selectedInvoice.company || null,
          currency: selectedInvoice.currency,
        }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const selectedInvoice = invoices.find((i) => i._id === formData.invoice);
      if (!selectedInvoice) {
        throw new Error("Please select an invoice");
      }

      const paymentData = {
        ...formData,
        project: projectId,
        invoice: formData.invoice,
        customer: selectedInvoice.customer?._id || selectedInvoice.customer,
        deal: selectedInvoice.deal?._id || selectedInvoice.deal,
        company:
          selectedInvoice.company?._id || selectedInvoice.company || null,
        amount: parseFloat(formData.amount),
        currency: selectedInvoice.currency || "USD",
        status: "completed",
      };

      await dispatch(createNewPayment({ projectId, paymentData })).unwrap();
      onSuccess();
    } catch (err) {
      // Error is handled by Redux
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      ></div>
      <div className="absolute right-0 top-0 h-full w-full max-w-2xl bg-white shadow-xl">
        <div className="flex flex-col h-full">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Record Payment</h2>
          </div>

          <form
            onSubmit={handleSubmit}
            className="flex-1 overflow-y-auto px-6 py-4"
          >
            {error && <Alert type="error" message={error} className="mb-4" />}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Invoice *
                </label>
                <select
                  name="invoice"
                  value={formData.invoice}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  disabled={invoicesLoading}
                >
                  <option value="">Select an invoice</option>
                  {invoices.map((invoice) => (
                    <option key={invoice._id} value={invoice._id}>
                      {invoice.invoiceNumber} - {invoice.customer?.firstName}{" "}
                      {invoice.customer?.lastName}(
                      {invoice.remainingAmount > 0
                        ? `Remaining: ${invoice.remainingAmount}`
                        : "Paid"}
                      )
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount *
                </label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  required
                  step="0.01"
                  min="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Method *
                </label>
                <select
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="credit_card">Credit Card</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="check">Check</option>
                  <option value="cash">Cash</option>
                  <option value="paypal">PayPal</option>
                  <option value="stripe">Stripe</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Date *
                </label>
                <input
                  type="date"
                  name="paymentDate"
                  value={formData.paymentDate}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Transaction ID
                </label>
                <input
                  type="text"
                  name="transactionId"
                  value={formData.transactionId}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </form>

          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? "Recording..." : "Record Payment"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePaymentSidebar;
