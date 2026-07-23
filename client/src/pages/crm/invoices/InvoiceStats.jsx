import React from "react";
import { formatCurrency } from "../../../utils/settingsUtils";

const InvoiceStats = ({ stats, loading }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No statistics available</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500">
            Total Invoices
          </div>
          <div className="mt-2 text-3xl font-bold text-gray-900">
            {stats.totalInvoices || 0}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500">Total Amount</div>
          <div className="mt-2 text-3xl font-bold text-gray-900">
            {formatCurrency(stats.totalAmount || 0)}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500">Paid Amount</div>
          <div className="mt-2 text-3xl font-bold text-green-600">
            {formatCurrency(stats.paidAmount || 0)}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500">Outstanding</div>
          <div className="mt-2 text-3xl font-bold text-red-600">
            {formatCurrency(stats.outstandingAmount || 0)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500 mb-4">
            Status Breakdown
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Draft</span>
              <span className="font-medium">{stats.draftCount || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Sent</span>
              <span className="font-medium">{stats.sentCount || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Paid</span>
              <span className="font-medium text-green-600">
                {stats.paidCount || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Overdue</span>
              <span className="font-medium text-red-600">
                {stats.overdueCount || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Partially Paid</span>
              <span className="font-medium text-yellow-600">
                {stats.partiallyPaidCount || 0}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceStats;
