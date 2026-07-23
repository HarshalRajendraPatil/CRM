import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchPayment,
  markPaymentAsCompletedAction,
  processRefundAction,
  deleteExistingPayment,
} from "../../../store/paymentSlice";
import { formatCurrency, formatDate } from "../../../utils/settingsUtils";
import Button from "../../../components/ui/Button";
import Alert from "../../../components/ui/Alert";
import CrmLayout from "../../../layouts/CrmLayout";
import { useProjectAccess } from "../../../hooks/useProjectAccess";

const PaymentDetail = () => {
  const { projectId, paymentId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { hasSupportExecutiveAccess, hasManagerAccess } = useProjectAccess();

  const { currentPayment, loading, error } = useSelector(
    (state) => state.payments
  );
  const payment = currentPayment;

  useEffect(() => {
    dispatch(fetchPayment(paymentId));
  }, [dispatch, paymentId]);

  const handleComplete = async () => {
    try {
      await dispatch(markPaymentAsCompletedAction(paymentId)).unwrap();
      await dispatch(fetchPayment(paymentId));
      alert("Payment marked as completed!");
    } catch (err) {
      alert(err || "Failed to complete payment");
    }
  };

  const handleRefund = async () => {
    const amount = prompt("Enter refund amount:");
    if (!amount) return;
    const reason = prompt("Enter refund reason (optional):") || "";

    try {
      await dispatch(
        processRefundAction({
          paymentId,
          refundData: { amount: parseFloat(amount), reason },
        })
      ).unwrap();
      await dispatch(fetchPayment(paymentId));
      alert("Refund processed successfully!");
    } catch (err) {
      alert(err || "Failed to process refund");
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this payment?")) {
      try {
        await dispatch(deleteExistingPayment(paymentId)).unwrap();
        navigate(`/crm/${projectId}/payments`);
      } catch (err) {
        alert(err || "Failed to delete payment");
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

  if (error || !payment) {
    return (
      <CrmLayout>
        <div className="p-6">
          <Alert type="error" message={error || "Payment not found"} />
        </div>
      </CrmLayout>
    );
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      completed: "bg-green-100 text-green-800",
      failed: "bg-red-100 text-red-800",
      refunded: "bg-gray-100 text-gray-800",
      cancelled: "bg-gray-100 text-gray-800",
    };
    return colors[status] || colors.pending;
  };

  return (
    <CrmLayout>
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <button
                onClick={() => navigate(`/crm/${projectId}/payments`)}
                className="text-sm text-gray-500 hover:text-gray-700 mb-2"
              >
                ← Back to Payments
              </button>
              <h1 className="text-2xl font-bold text-gray-900">
                {payment.paymentNumber}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {payment.customer?.firstName} {payment.customer?.lastName}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                  payment.status
                )}`}
              >
                {payment.status}
              </span>
              {hasSupportExecutiveAccess && payment.status === "pending" && (
                <Button onClick={handleComplete}>Mark as Completed</Button>
              )}
              {hasManagerAccess && payment.status === "completed" && (
                <Button
                  variant="outline"
                  onClick={handleRefund}
                  className="text-orange-600"
                >
                  Process Refund
                </Button>
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

        <div className="flex-1 overflow-y-auto bg-gray-50 p-6">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Payment Details
              </h3>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-500">Amount</p>
                  <p className="text-xl font-bold text-gray-900 mt-1">
                    {formatCurrency(payment.amount, payment.currency)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Payment Method</p>
                  <p className="text-lg font-medium text-gray-900 mt-1 capitalize">
                    {payment.paymentMethod.replace("_", " ")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Payment Date</p>
                  <p className="text-lg font-medium text-gray-900 mt-1">
                    {formatDate(payment.paymentDate)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p className="text-lg font-medium text-gray-900 mt-1">
                    {payment.status}
                  </p>
                </div>
                {payment.transactionId && (
                  <div>
                    <p className="text-sm text-gray-500">Transaction ID</p>
                    <p className="text-lg font-medium text-gray-900 mt-1">
                      {payment.transactionId}
                    </p>
                  </div>
                )}
                {payment.referenceNumber && (
                  <div>
                    <p className="text-sm text-gray-500">Reference Number</p>
                    <p className="text-lg font-medium text-gray-900 mt-1">
                      {payment.referenceNumber}
                    </p>
                  </div>
                )}
              </div>

              {payment.notes && (
                <div className="mt-6">
                  <p className="text-sm text-gray-500 mb-2">Notes</p>
                  <p className="text-gray-900">{payment.notes}</p>
                </div>
              )}

              {payment.status === "refunded" && (
                <div className="mt-6 p-4 bg-orange-50 rounded-lg">
                  <p className="text-sm font-medium text-orange-900">
                    Refund Information
                  </p>
                  <p className="text-sm text-orange-700 mt-1">
                    Amount:{" "}
                    {formatCurrency(payment.refundAmount, payment.currency)}
                  </p>
                  {payment.refundDate && (
                    <p className="text-sm text-orange-700">
                      Date: {formatDate(payment.refundDate)}
                    </p>
                  )}
                  {payment.refundReason && (
                    <p className="text-sm text-orange-700 mt-1">
                      Reason: {payment.refundReason}
                    </p>
                  )}
                </div>
              )}
            </div>

            {payment.invoice && (
              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Related Invoice
                </h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">
                      {payment.invoice.invoiceNumber}
                    </p>
                    <p className="text-sm text-gray-500">
                      Total:{" "}
                      {formatCurrency(payment.invoice.total, payment.currency)}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() =>
                      navigate(
                        `/crm/${projectId}/invoices/${payment.invoice._id}`
                      )
                    }
                  >
                    View Invoice
                  </Button>
                </div>
              </div>
            )}

            {payment.receipt && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Receipt
                </h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">
                      {payment.receipt.receiptNumber}
                    </p>
                    {payment.receipt.pdfUrl && (
                      <a
                        href={payment.receipt.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-indigo-600 hover:text-indigo-800"
                      >
                        View PDF
                      </a>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    onClick={() =>
                      navigate(
                        `/crm/${projectId}/receipts/${payment.receipt._id}`
                      )
                    }
                  >
                    View Receipt
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </CrmLayout>
  );
};

export default PaymentDetail;
