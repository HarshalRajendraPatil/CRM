import React from "react";
import { formatCurrency } from "../../../utils/settingsUtils";

const ReceiptStats = ({ stats, loading }) => {
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
            Total Receipts
          </div>
          <div className="mt-2 text-3xl font-bold text-gray-900">
            {stats.totalReceipts || 0}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500">Total Amount</div>
          <div className="mt-2 text-3xl font-bold text-gray-900">
            {formatCurrency(stats.totalAmount || 0)}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500">Sent</div>
          <div className="mt-2 text-3xl font-bold text-green-600">
            {stats.sentCount || 0}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500">Not Sent</div>
          <div className="mt-2 text-3xl font-bold text-yellow-600">
            {stats.unsentCount || 0}
          </div>
        </div>
      </div>

      {stats.paymentMethods && stats.paymentMethods.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Payment Methods
          </h3>
          <div className="space-y-3">
            {stats.paymentMethods.map((method, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-600 capitalize">
                  {method._id.replace("_", " ")}
                </span>
                <div className="text-right">
                  <div className="font-medium">
                    {formatCurrency(method.totalAmount)}
                  </div>
                  <div className="text-sm text-gray-500">
                    {method.count} receipts
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReceiptStats;
