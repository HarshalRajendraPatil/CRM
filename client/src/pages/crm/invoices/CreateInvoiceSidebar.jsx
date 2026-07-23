import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProjectDeals } from "../../../store/dealSlice";
import { createNewInvoice } from "../../../store/invoiceSlice";
import Button from "../../../components/ui/Button";
import Alert from "../../../components/ui/Alert";

const CreateInvoiceSidebar = ({ isOpen, onClose, projectId, onSuccess }) => {
  const dispatch = useDispatch();
  const { deals, loading: dealsLoading } = useSelector((state) => state.deals);
  const { loading, error } = useSelector((state) => state.invoices);
  const [formData, setFormData] = useState({
    deal: "",
    customer: "",
    company: "",
    dueDate: "",
    notes: "",
    terms: "",
  });

  useEffect(() => {
    if (isOpen && projectId) {
      dispatch(
        fetchProjectDeals({
          projectId,
          params: { status: "closed-won", limit: 100 },
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

    if (name === "deal") {
      const selectedDeal = deals.find((d) => d._id === value);
      if (selectedDeal) {
        setFormData((prev) => ({
          ...prev,
          deal: value,
          customer: selectedDeal.customer?._id || selectedDeal.customer || "",
          company: selectedDeal.company?._id || selectedDeal.company || "",
        }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Calculate due date (30 days from now if not provided)
      const dueDate =
        formData.dueDate ||
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0];

      const selectedDeal = deals.find((d) => d._id === formData.deal);
      if (!selectedDeal) {
        throw new Error("Please select a deal");
      }

      // Prepare invoice items from deal products or deal value
      let items = [];
      if (selectedDeal.products && selectedDeal.products.length > 0) {
        items = selectedDeal.products.map((product) => ({
          name: product.name,
          description: product.description || "",
          quantity: product.quantity,
          unitPrice: product.unitPrice,
          discount: product.discount || 0,
          tax: product.tax || 0,
          totalPrice: product.totalPrice,
        }));
      } else {
        items = [
          {
            name: selectedDeal.name,
            description: selectedDeal.description || "",
            quantity: 1,
            unitPrice: selectedDeal.value,
            discount: 0,
            tax: 0,
            totalPrice: selectedDeal.value,
          },
        ];
      }

      const invoiceData = {
        ...formData,
        project: projectId,
        deal: formData.deal,
        customer:
          formData.customer ||
          selectedDeal.customer?._id ||
          selectedDeal.customer,
        company:
          formData.company ||
          selectedDeal.company?._id ||
          selectedDeal.company ||
          null,
        items,
        dueDate,
        currency: selectedDeal.currency || "USD",
      };

      await dispatch(createNewInvoice({ projectId, invoiceData })).unwrap();
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
            <h2 className="text-xl font-bold text-gray-900">Create Invoice</h2>
          </div>

          <form
            onSubmit={handleSubmit}
            className="flex-1 overflow-y-auto px-6 py-4"
          >
            {error && <Alert type="error" message={error} className="mb-4" />}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Deal *
                </label>
                <select
                  name="deal"
                  value={formData.deal}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  disabled={dealsLoading}
                >
                  <option value="">Select a deal</option>
                  {deals.map((deal) => (
                    <option key={deal._id} value={deal._id}>
                      {deal.name} - {deal.dealNumber} ({deal.value})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Due Date *
                </label>
                <input
                  type="date"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleChange}
                  min={new Date().toISOString().split("T")[0]}
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Terms
                </label>
                <textarea
                  name="terms"
                  value={formData.terms}
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
              {loading ? "Creating..." : "Create Invoice"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateInvoiceSidebar;
