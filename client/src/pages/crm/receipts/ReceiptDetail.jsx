import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchReceipt,
  markReceiptAsSentAction,
} from "../../../store/receiptSlice";
import { formatCurrency, formatDate } from "../../../utils/settingsUtils";
import Button from "../../../components/ui/Button";
import Alert from "../../../components/ui/Alert";
import CrmLayout from "../../../layouts/CrmLayout";
import { useProjectAccess } from "../../../hooks/useProjectAccess";

const ReceiptDetail = () => {
  const { projectId, receiptId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { hasSupportExecutiveAccess } = useProjectAccess();

  const { currentReceipt, loading, error } = useSelector(
    (state) => state.receipts
  );
  const receipt = currentReceipt;
  const [sending, setSending] = useState(false);

  useEffect(() => {
    dispatch(fetchReceipt(receiptId));
  }, [dispatch, receiptId]);

  const handleSend = async () => {
    const email = prompt("Enter customer email:");
    if (!email) return;

    try {
      setSending(true);
      await dispatch(
        markReceiptAsSentAction({ receiptId, sentToEmail: email })
      ).unwrap();
      await dispatch(fetchReceipt(receiptId));
      alert("Receipt sent successfully!");
    } catch (err) {
      alert(err || "Failed to send receipt");
    } finally {
      setSending(false);
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

  if (error || !receipt) {
    return (
      <CrmLayout>
        <div className="p-6">
          <Alert type="error" message={error || "Receipt not found"} />
        </div>
      </CrmLayout>
    );
  }

  return (
    <CrmLayout>
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <button
                onClick={() => navigate(`/crm/${projectId}/receipts`)}
                className="text-sm text-gray-500 hover:text-gray-700 mb-2"
              >
                ← Back to Receipts
              </button>
              <h1 className="text-2xl font-bold text-gray-900">
                {receipt.receiptNumber}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {receipt.customer?.firstName} {receipt.customer?.lastName}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {hasSupportExecutiveAccess && !receipt.sentAt && (
                <Button onClick={handleSend} disabled={sending}>
                  {sending ? "Sending..." : "Send Receipt"}
                </Button>
              )}
              {receipt.pdfUrl && (
                <Button
                  variant="outline"
                  onClick={() => window.open(receipt.pdfUrl, "_blank")}
                >
                  View PDF
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-gray-50 p-6">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Receipt Details
              </h3>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-500">Amount</p>
                  <p className="text-xl font-bold text-gray-900 mt-1">
                    {formatCurrency(receipt.amount, receipt.currency)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Payment Method</p>
                  <p className="text-lg font-medium text-gray-900 mt-1 capitalize">
                    {receipt.paymentMethod.replace("_", " ")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Payment Date</p>
                  <p className="text-lg font-medium text-gray-900 mt-1">
                    {formatDate(receipt.paymentDate)}
                  </p>
                </div>
                {receipt.sentAt && (
                  <div>
                    <p className="text-sm text-gray-500">Sent At</p>
                    <p className="text-lg font-medium text-gray-900 mt-1">
                      {formatDate(receipt.sentAt)}
                    </p>
                    {receipt.sentToEmail && (
                      <p className="text-sm text-gray-500 mt-1">
                        To: {receipt.sentToEmail}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {receipt.notes && (
                <div className="mt-6">
                  <p className="text-sm text-gray-500 mb-2">Notes</p>
                  <p className="text-gray-900">{receipt.notes}</p>
                </div>
              )}
            </div>

            {receipt.invoice && (
              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Related Invoice
                </h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">
                      {receipt.invoice.invoiceNumber}
                    </p>
                    <p className="text-sm text-gray-500">
                      Total:{" "}
                      {formatCurrency(receipt.invoice.total, receipt.currency)}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() =>
                      navigate(
                        `/crm/${projectId}/invoices/${receipt.invoice._id}`
                      )
                    }
                  >
                    View Invoice
                  </Button>
                </div>
              </div>
            )}

            {receipt.payment && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Related Payment
                </h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">
                      {receipt.payment.paymentNumber}
                    </p>
                    <p className="text-sm text-gray-500">
                      Amount:{" "}
                      {formatCurrency(receipt.payment.amount, receipt.currency)}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() =>
                      navigate(
                        `/crm/${projectId}/payments/${receipt.payment._id}`
                      )
                    }
                  >
                    View Payment
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

export default ReceiptDetail;
