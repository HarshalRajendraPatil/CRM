import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchProjectReceipts,
  fetchReceiptStats,
  clearError,
} from "../../../store/receiptSlice";
import ReceiptListItem from "./ReceiptListItem";
import ReceiptStats from "./ReceiptStats";
import Button from "../../../components/ui/Button";
import Alert from "../../../components/ui/Alert";
import CrmLayout from "../../../layouts/CrmLayout";

const Receipts = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    receipts,
    stats,
    loading,
    error,
    filters,
    sortBy,
    sortOrder,
    pagination,
  } = useSelector((state) => state.receipts);

  const [page, setPage] = useState(1);
  const [currentView, setCurrentView] = useState("list");

  useEffect(() => {
    const params = {
      page,
      limit: 20,
      sortBy,
      sortOrder,
      ...Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== "")
      ),
    };
    dispatch(fetchProjectReceipts({ projectId, params }));
    dispatch(fetchReceiptStats(projectId));
  }, [dispatch, projectId, filters, sortBy, sortOrder, page]);

  useEffect(() => {
    if (error) {
      dispatch(clearError());
    }
  }, [dispatch, error]);

  return (
    <CrmLayout>
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Receipts</h1>
              <p className="text-sm text-gray-500 mt-1">
                View payment receipts
              </p>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 border-b border-gray-200">
            <button
              onClick={() => setCurrentView("list")}
              className={`px-4 py-2 text-sm font-medium ${
                currentView === "list"
                  ? "text-indigo-600 border-b-2 border-indigo-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              List
            </button>
            <button
              onClick={() => setCurrentView("stats")}
              className={`px-4 py-2 text-sm font-medium ${
                currentView === "stats"
                  ? "text-indigo-600 border-b-2 border-indigo-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Statistics
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-gray-50">
          {error && (
            <div className="px-6 py-4">
              <Alert type="error" message={error} />
            </div>
          )}

          {currentView === "stats" ? (
            <ReceiptStats stats={stats} loading={loading} />
          ) : (
            <>
              <div className="bg-white border-b border-gray-200 px-6 py-3">
                <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-700">
                  <div className="col-span-2">Receipt Number</div>
                  <div className="col-span-2">Customer</div>
                  <div className="col-span-2">Invoice</div>
                  <div className="col-span-1 text-right">Amount</div>
                  <div className="col-span-1">Method</div>
                  <div className="col-span-1">Date</div>
                  <div className="col-span-1 text-center">Sent</div>
                  <div className="col-span-2 text-right">Actions</div>
                </div>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
              ) : receipts.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">No receipts found</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {receipts.map((receipt) => (
                    <ReceiptListItem
                      key={receipt._id}
                      receipt={receipt}
                      onView={(id) =>
                        navigate(`/crm/${projectId}/receipts/${id}`)
                      }
                    />
                  ))}
                </div>
              )}

              {pagination.pages > 1 && (
                <div className="px-6 py-4 bg-white border-t border-gray-200 flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Showing {(page - 1) * 20 + 1} to{" "}
                    {Math.min(page * 20, pagination.total)} of{" "}
                    {pagination.total} receipts
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() =>
                        setPage((p) => Math.min(pagination.pages, p + 1))
                      }
                      disabled={page === pagination.pages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </CrmLayout>
  );
};

export default Receipts;
