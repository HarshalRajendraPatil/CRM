import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchFinancialOverview,
  fetchOutstandingReceivables,
  fetchPaymentMethodAnalytics,
  fetchOverdueInvoices,
  clearError,
} from "../../../store/financialSlice";
import { formatCurrency, formatDate } from "../../../utils/settingsUtils";
import { selectSettings } from "../../../store/settingsSlice";
import CrmLayout from "../../../layouts/CrmLayout";
import Alert from "../../../components/ui/Alert";

const Financial = () => {
  const { projectId } = useParams();
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("overview");
  const settings = useSelector(selectSettings);

  const { overview, receivables, paymentMethods, overdue, loading, error } =
    useSelector((state) => state.financial);

  useEffect(() => {
    dispatch(fetchFinancialOverview({ projectId }));
    dispatch(fetchOutstandingReceivables({ projectId }));
    dispatch(fetchPaymentMethodAnalytics({ projectId }));
    dispatch(fetchOverdueInvoices({ projectId }));
  }, [dispatch, projectId]);

  useEffect(() => {
    if (error) {
      dispatch(clearError());
    }
  }, [dispatch, error]);

  if (loading) {
    return (
      <CrmLayout>
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </CrmLayout>
    );
  }

  return (
    <CrmLayout>
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">
            Financial Dashboard
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Comprehensive financial overview and analytics
          </p>

          <div className="mt-4 flex items-center gap-2 border-b border-gray-200">
            {["overview", "receivables", "overdue", "analytics"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-medium capitalize ${
                  activeTab === tab
                    ? "text-indigo-600 border-b-2 border-indigo-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-gray-50 p-6">
          {error && <Alert type="error" message={error} className="mb-4" />}

          {activeTab === "overview" && overview && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="text-sm font-medium text-gray-500">
                    Total Revenue
                  </div>
                  <div className="mt-2 text-3xl font-bold text-gray-900">
                    {formatCurrency(
                      overview.revenue?.total || 0,
                      null,
                      settings
                    )}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    {overview.revenue?.paymentCount || 0} payments
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="text-sm font-medium text-gray-500">
                    Outstanding Receivables
                  </div>
                  <div className="mt-2 text-3xl font-bold text-red-600">
                    {formatCurrency(
                      overview.receivables?.total || 0,
                      null,
                      settings
                    )}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    {overview.receivables?.invoiceCount || 0} invoices
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="text-sm font-medium text-gray-500">
                    Overdue Amount
                  </div>
                  <div className="mt-2 text-3xl font-bold text-red-600">
                    {formatCurrency(
                      overview.receivables?.overdue?.amount || 0,
                      null,
                      settings
                    )}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    {overview.receivables?.overdue?.count || 0} invoices
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="text-sm font-medium text-gray-500">
                    Payment Methods
                  </div>
                  <div className="mt-2 text-3xl font-bold text-gray-900">
                    {overview.paymentMethods?.length || 0}
                  </div>
                </div>
              </div>

              {overview.monthlyTrend && overview.monthlyTrend.length > 0 && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Monthly Revenue Trend
                  </h3>
                  <div className="space-y-3">
                    {overview.monthlyTrend.map((month, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between"
                      >
                        <span className="text-sm text-gray-600">
                          {month._id.month}/{month._id.year}
                        </span>
                        <div className="text-right">
                          <div className="font-medium">
                            {formatCurrency(month.revenue, null, settings)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {month.count} payments
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "receivables" && (
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">
                  Outstanding Receivables
                </h3>
              </div>
              <div className="divide-y divide-gray-200">
                {receivables.invoices?.map((invoice) => (
                  <div key={invoice._id} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{invoice.invoiceNumber}</p>
                        <p className="text-sm text-gray-500">
                          {invoice.customer?.firstName}{" "}
                          {invoice.customer?.lastName}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-red-600">
                          {formatCurrency(
                            invoice.remainingAmount,
                            invoice.currency,
                            settings
                          )}
                        </p>
                        <p className="text-sm text-gray-500">
                          Due: {formatDate(invoice.dueDate, settings)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "overdue" && (
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">
                  Overdue Invoices
                </h3>
              </div>
              <div className="divide-y divide-gray-200">
                {overdue.invoices?.map((invoice) => (
                  <div key={invoice._id} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{invoice.invoiceNumber}</p>
                        <p className="text-sm text-gray-500">
                          {invoice.customer?.firstName}{" "}
                          {invoice.customer?.lastName}
                        </p>
                        <p className="text-sm text-red-600 mt-1">
                          {invoice.daysOverdue} days overdue
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-red-600">
                          {formatCurrency(
                            invoice.remainingAmount,
                            invoice.currency,
                            settings
                          )}
                        </p>
                        <p className="text-sm text-gray-500">
                          Due: {formatDate(invoice.dueDate, settings)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "analytics" && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Payment Method Analytics
              </h3>
              <div className="space-y-3">
                {paymentMethods.map((method, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded"
                  >
                    <div>
                      <span className="font-medium capitalize">
                        {method._id.replace("_", " ")}
                      </span>
                      <div className="text-sm text-gray-500 mt-1">
                        {method.count} payments • Avg:{" "}
                        {formatCurrency(method.averageAmount, null, settings)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        {formatCurrency(method.totalAmount, null, settings)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {method.percentage.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </CrmLayout>
  );
};

export default Financial;
