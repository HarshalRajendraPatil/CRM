import React from "react";
import { formatCurrency, formatDate } from "../../../utils/settingsUtils";
import { PencilIcon, TrashIcon, EyeIcon } from "@heroicons/react/24/outline";
import { useProjectAccess } from "../../../hooks/useProjectAccess";

const InvoiceListItem = ({ invoice, onView, onEdit, onDelete }) => {
  const { hasSupportExecutiveAccess } = useProjectAccess();

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

  const isOverdue =
    invoice.status === "overdue" ||
    (invoice.status !== "paid" &&
      invoice.dueDate &&
      new Date(invoice.dueDate) < new Date());

  return (
    <div
      className="group grid grid-cols-12 gap-4 items-center px-6 py-4 border-b border-gray-200 hover:bg-gray-50 transition-colors duration-200 cursor-pointer bg-white"
      onClick={() => onView(invoice._id)}
    >
      <div className="col-span-2">
        <div className="font-medium text-gray-900">{invoice.invoiceNumber}</div>
        <div className="text-sm text-gray-500">
          {formatDate(invoice.issueDate)}
        </div>
      </div>
      <div className="col-span-2">
        {invoice.customer ? (
          <div>
            <div className="font-medium text-gray-900">
              {invoice.customer.firstName} {invoice.customer.lastName}
            </div>
            <div className="text-sm text-gray-500">
              {invoice.customer.email}
            </div>
          </div>
        ) : (
          <span className="text-gray-400">No customer</span>
        )}
      </div>
      <div className="col-span-2">
        {invoice.deal ? (
          <div>
            <div className="font-medium text-gray-900">{invoice.deal.name}</div>
            <div className="text-sm text-gray-500">
              {invoice.deal.dealNumber}
            </div>
          </div>
        ) : (
          <span className="text-gray-400">No deal</span>
        )}
      </div>
      <div className="col-span-1 text-right">
        <div className="font-medium text-gray-900">
          {formatCurrency(invoice.total, invoice.currency)}
        </div>
      </div>
      <div className="col-span-1 text-center">
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
            invoice.status
          )}`}
        >
          {invoice.status.replace("_", " ")}
        </span>
      </div>
      <div className="col-span-1">
        <div className="text-sm text-gray-900">
          {formatDate(invoice.dueDate)}
        </div>
        {isOverdue && <div className="text-xs text-red-600 mt-1">Overdue</div>}
      </div>
      <div className="col-span-1 text-right">
        <div className="text-sm font-medium text-green-600">
          {formatCurrency(invoice.paidAmount || 0, invoice.currency)}
        </div>
      </div>
      <div className="col-span-1 text-right">
        <div
          className={`text-sm font-medium ${
            invoice.remainingAmount > 0 ? "text-red-600" : "text-gray-600"
          }`}
        >
          {formatCurrency(invoice.remainingAmount || 0, invoice.currency)}
        </div>
      </div>
      <div className="col-span-1 text-right">
        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onView(invoice._id);
            }}
            className="p-1 text-gray-400 hover:text-indigo-600"
            title="View"
          >
            <EyeIcon className="w-4 h-4" />
          </button>
          {hasSupportExecutiveAccess && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(invoice);
                }}
                className="p-1 text-gray-400 hover:text-indigo-600"
                title="Edit"
              >
                <PencilIcon className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(invoice._id);
                }}
                className="p-1 text-gray-400 hover:text-red-600"
                title="Delete"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvoiceListItem;
