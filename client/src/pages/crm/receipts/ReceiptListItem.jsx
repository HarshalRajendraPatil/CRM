import React from "react";
import { formatCurrency, formatDate } from "../../../utils/settingsUtils";
import { EyeIcon } from "@heroicons/react/24/outline";

const ReceiptListItem = ({ receipt, onView }) => {
  return (
    <div
      className="group grid grid-cols-12 gap-4 items-center px-6 py-4 border-b border-gray-200 hover:bg-gray-50 transition-colors duration-200 cursor-pointer bg-white"
      onClick={() => onView(receipt._id)}
    >
      <div className="col-span-2">
        <div className="font-medium text-gray-900">{receipt.receiptNumber}</div>
      </div>
      <div className="col-span-2">
        {receipt.customer ? (
          <div>
            <div className="font-medium text-gray-900">
              {receipt.customer.firstName} {receipt.customer.lastName}
            </div>
            <div className="text-sm text-gray-500">
              {receipt.customer.email}
            </div>
          </div>
        ) : (
          <span className="text-gray-400">No customer</span>
        )}
      </div>
      <div className="col-span-2">
        {receipt.invoice ? (
          <div>
            <div className="font-medium text-gray-900">
              {receipt.invoice.invoiceNumber}
            </div>
          </div>
        ) : (
          <span className="text-gray-400">No invoice</span>
        )}
      </div>
      <div className="col-span-1 text-right">
        <div className="font-medium text-gray-900">
          {formatCurrency(receipt.amount, receipt.currency)}
        </div>
      </div>
      <div className="col-span-1">
        <div className="text-sm text-gray-900 capitalize">
          {receipt.paymentMethod.replace("_", " ")}
        </div>
      </div>
      <div className="col-span-1">
        <div className="text-sm text-gray-900">
          {formatDate(receipt.paymentDate)}
        </div>
      </div>
      <div className="col-span-1 text-center">
        {receipt.sentAt ? (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Sent
          </span>
        ) : (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            Not Sent
          </span>
        )}
      </div>
      <div className="col-span-2 text-right">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onView(receipt._id);
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

export default ReceiptListItem;
