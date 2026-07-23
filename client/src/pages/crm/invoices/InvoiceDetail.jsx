import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchInvoice,
  markInvoiceAsSentAction,
  deleteExistingInvoice,
} from "../../../store/invoiceSlice";
import { fetchProjectPayments } from "../../../store/paymentSlice";
import { formatCurrency, formatDate } from "../../../utils/settingsUtils";
import { selectSettings } from "../../../store/settingsSlice";
import Button from "../../../components/ui/Button";
import Alert from "../../../components/ui/Alert";
import CrmLayout from "../../../layouts/CrmLayout";
import { useProjectAccess } from "../../../hooks/useProjectAccess";
import { getProjectById } from "../../../store/projectSlice";

const InvoiceDetail = () => {
  const { projectId, invoiceId } = useParams();
  console.log(projectId, invoiceId);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { hasSupportExecutiveAccess, hasManagerAccess } = useProjectAccess();
  const settings = useSelector(selectSettings);

  console.log(hasSupportExecutiveAccess, hasManagerAccess);

  const { currentInvoice, loading, error } = useSelector(
    (state) => state.invoices
  );
  const { payments } = useSelector((state) => state.payments);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    dispatch(getProjectById(projectId));
    dispatch(fetchInvoice({ projectId, invoiceId }));
    dispatch(
      fetchProjectPayments({ projectId, params: { invoice: invoiceId } })
    );
  }, [dispatch, invoiceId, projectId]);

  const invoice = currentInvoice;
  const invoicePayments = payments.filter(
    (p) => p.invoice?._id === invoiceId || p.invoice === invoiceId
  );

  const handleSendInvoice = async () => {
    const email = prompt("Enter customer email:");
    if (!email) return;

    try {
      setSending(true);
      await dispatch(
        markInvoiceAsSentAction({ invoiceId, sentToEmail: email })
      ).unwrap();
      await dispatch(fetchInvoice({ projectId, invoiceId }));
      alert("Invoice sent successfully!");
    } catch (err) {
      alert(err || "Failed to send invoice");
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this invoice?")) {
      try {
        await dispatch(deleteExistingInvoice(projectId, invoiceId)).unwrap();
        navigate(`/crm/${projectId}/invoices`);
      } catch (err) {
        alert(err || "Failed to delete invoice");
      }
    }
  };

  if (loading) {
    return (
      <CrmLayout>
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </CrmLayout>
    );
  }

  if (error || !invoice) {
    return (
      <CrmLayout>
        <div className="p-6">
          <Alert type="error" message={error || "Invoice not found"} />
        </div>
      </CrmLayout>
    );
  }

  const getStatusColor = (status) => {
    const colors = {
      draft: "bg-gray-100 text-gray-800",
      sent: "bg-blue-100 text-blue-800",
      paid: "bg-green-100 text-green-800",
      overdue: "bg-red-100 text-red-800",
      partially_paid: "bg-yellow-100 text-yellow-800",
      cancelled: "bg-gray-100 text-gray-800",
    };
    return colors[status] || colors.draft;
  };

  return (
    <CrmLayout>
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <button
                onClick={() => navigate(`/crm/${projectId}/invoices`)}
                className="text-sm text-gray-500 hover:text-gray-700 mb-2"
              >
                ← Back to Invoices
              </button>
              <h1 className="text-2xl font-bold text-gray-900">
                {invoice.invoiceNumber}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {invoice.customer?.firstName} {invoice.customer?.lastName}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                  invoice.status
                )}`}
              >
                {invoice.status.replace("_", " ")}
              </span>
              {hasSupportExecutiveAccess && (
                <>
                  {invoice.status !== "sent" && (
                    <Button onClick={handleSendInvoice} disabled={sending}>
                      {sending ? "Sending..." : "Send Invoice"}
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={() =>
                      navigate(`/crm/${projectId}/invoices/${invoiceId}/edit`)
                    }
                  >
                    Edit
                  </Button>
                </>
              )}
              {hasManagerAccess && (
                <Button
                  variant="outline"
                  onClick={handleDelete}
                  className="text-red-600"
                >
                  Delete
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto bg-gray-50 p-6">
          <div className="max-w-5xl mx-auto">
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">
                    Invoice Details
                  </h3>
                  <div className="space-y-1">
                    <p className="text-sm">
                      <span className="font-medium">Invoice Number:</span>{" "}
                      {invoice.invoiceNumber}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Issue Date:</span>{" "}
                      {formatDate(invoice.issueDate, settings)}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Due Date:</span>{" "}
                      {formatDate(invoice.dueDate, settings)}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Status:</span>{" "}
                      {invoice.status}
                    </p>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">
                    Customer
                  </h3>
                  <div className="space-y-1">
                    <p className="text-sm">
                      {invoice.customer?.firstName} {invoice.customer?.lastName}
                    </p>
                    <p className="text-sm">{invoice.customer?.email}</p>
                    <p className="text-sm">{invoice.customer?.phone}</p>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-500 mb-3">
                  Items
                </h3>
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Item
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Quantity
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Unit Price
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {invoice.items?.map((item, index) => (
                      <tr key={index}>
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-900">
                            {item.name}
                          </div>
                          {item.description && (
                            <div className="text-sm text-gray-500">
                              {item.description}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right text-sm text-gray-900">
                          {item.quantity}
                        </td>
                        <td className="px-4 py-3 text-right text-sm text-gray-900">
                          {formatCurrency(
                            item.unitPrice,
                            invoice.currency,
                            settings
                          )}
                        </td>
                        <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                          {formatCurrency(
                            item.totalPrice,
                            invoice.currency,
                            settings
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="flex justify-end">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium">
                      {formatCurrency(
                        invoice.subtotal,
                        invoice.currency,
                        settings
                      )}
                    </span>
                  </div>
                  {invoice.tax > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tax:</span>
                      <span className="font-medium">
                        {formatCurrency(
                          invoice.tax,
                          invoice.currency,
                          settings
                        )}
                      </span>
                    </div>
                  )}
                  {invoice.discount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Discount:</span>
                      <span className="font-medium">
                        -
                        {formatCurrency(
                          invoice.discount,
                          invoice.currency,
                          settings
                        )}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>Total:</span>
                    <span>
                      {formatCurrency(
                        invoice.total,
                        invoice.currency,
                        settings
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Paid:</span>
                    <span className="font-medium text-green-600">
                      {formatCurrency(
                        invoice.paidAmount || 0,
                        invoice.currency,
                        settings
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Remaining:</span>
                    <span
                      className={`font-medium ${
                        invoice.remainingAmount > 0
                          ? "text-red-600"
                          : "text-gray-900"
                      }`}
                    >
                      {formatCurrency(
                        invoice.remainingAmount || 0,
                        invoice.currency,
                        settings
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payments */}
            {invoicePayments.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Payments
                </h3>
                <div className="space-y-3">
                  {invoicePayments.map((payment) => (
                    <div
                      key={payment._id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded"
                    >
                      <div>
                        <p className="font-medium">{payment.paymentNumber}</p>
                        <p className="text-sm text-gray-500">
                          {formatDate(payment.paymentDate, settings)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {formatCurrency(
                            payment.amount,
                            payment.currency,
                            settings
                          )}
                        </p>
                        <p className="text-sm text-gray-500">
                          {payment.paymentMethod}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </CrmLayout>
  );
};

export default InvoiceDetail;
