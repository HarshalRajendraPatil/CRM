import React from "react";
import { formatCurrency, formatDate } from "../../../utils/settingsUtils";
import { EyeIcon } from "@heroicons/react/24/outline";

const PaymentListItem = ({ payment, onView }) => {
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
    <div
      className="group grid grid-cols-12 gap-4 items-center px-6 py-4 border-b border-gray-200 hover:bg-gray-50 transition-colors duration-200 cursor-pointer bg-white"
      onClick={() => onView(payment._id)}
    >
      <div className="col-span-2">
        <div className="font-medium text-gray-900">{payment.paymentNumber}</div>
        {payment.transactionId && (
          <div className="text-sm text-gray-500">
            Txn: {payment.transactionId}
          </div>
        )}
      </div>
      <div className="col-span-2">
        {payment.customer ? (
          <div>
            <div className="font-medium text-gray-900">
              {payment.customer.firstName} {payment.customer.lastName}
            </div>
            <div className="text-sm text-gray-500">
              {payment.customer.email}
            </div>
          </div>
        ) : (
          <span className="text-gray-400">No customer</span>
        )}
      </div>
      <div className="col-span-2">
        {payment.invoice ? (
          <div>
            <div className="font-medium text-gray-900">
              {payment.invoice.invoiceNumber}
            </div>
            <div className="text-sm text-gray-500">
              {formatCurrency(payment.invoice.total, payment.currency)}
            </div>
          </div>
        ) : (
          <span className="text-gray-400">No invoice</span>
        )}
      </div>
      <div className="col-span-1 text-right">
        <div className="font-medium text-gray-900">
          {formatCurrency(payment.amount, payment.currency)}
        </div>
      </div>
      <div className="col-span-1">
        <div className="text-sm text-gray-900 capitalize">
          {payment.paymentMethod.replace("_", " ")}
        </div>
      </div>
      <div className="col-span-1">
        <div className="text-sm text-gray-900">
          {formatDate(payment.paymentDate)}
        </div>
      </div>
      <div className="col-span-1 text-center">
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
            payment.status
          )}`}
        >
          {payment.status}
        </span>
      </div>
      <div className="col-span-2 text-right">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onView(payment._id);
          }}
          className="p-1 text-gray-400 hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity"
          title="View"
        >
          <EyeIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default PaymentListItem;
