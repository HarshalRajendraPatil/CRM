import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchProjectInvoices,
  fetchInvoiceStats,
  setFilters,
  setSorting,
  clearError,
} from "../../../store/invoiceSlice";
import InvoiceListItem from "./InvoiceListItem";
import InvoiceFilters from "./InvoiceFilters";
import CreateInvoiceSidebar from "./CreateInvoiceSidebar";
import EditInvoiceSidebar from "./EditInvoiceSidebar";
import InvoiceStats from "./InvoiceStats";
import Button from "../../../components/ui/Button";
import Alert from "../../../components/ui/Alert";
import CrmLayout from "../../../layouts/CrmLayout";
import { useProjectAccess } from "../../../hooks/useProjectAccess";

const Invoices = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { hasSupportExecutiveAccess } = useProjectAccess();

  const {
    invoices,
    stats,
    loading,
    error,
    filters,
    sortBy,
    sortOrder,
    pagination,
  } = useSelector((state) => state.invoices);

  const [page, setPage] = useState(1);
  const [showCreateSidebar, setShowCreateSidebar] = useState(false);
  const [showEditSidebar, setShowEditSidebar] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [currentView, setCurrentView] = useState("list"); // list, stats

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
    dispatch(fetchProjectInvoices({ projectId, params }));
    dispatch(fetchInvoiceStats(projectId));
  }, [dispatch, projectId, filters, sortBy, sortOrder, page]);

  const handleFilterChange = (newFilters) => {
    dispatch(setFilters(newFilters));
    setPage(1);
  };

  const handleSortChange = (field) => {
    if (sortBy === field) {
      dispatch(
        setSorting({
          sortBy: field,
          sortOrder: sortOrder === "asc" ? "desc" : "asc",
        })
      );
    } else {
      dispatch(setSorting({ sortBy: field, sortOrder: "desc" }));
    }
  };

  const handleViewInvoice = (invoiceId) => {
    navigate(`/crm/${projectId}/invoices/${invoiceId}`);
  };

  const handleEditInvoice = (invoice) => {
    setEditingInvoice({ ...invoice, projectId });
    setShowEditSidebar(true);
  };

  const handleDeleteInvoice = async (projectId) => {
    if (window.confirm("Are you sure you want to delete this invoice?")) {
      // Delete logic will be in the detail page
      const params = {
        page,
        limit: 20,
        sortBy,
        sortOrder,
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, v]) => v !== "")
        ),
      };
      dispatch(fetchProjectInvoices({ projectId, params }));
      dispatch(fetchInvoiceStats(projectId));
    }
  };

  const handleInvoiceCreated = () => {
    setShowCreateSidebar(false);
    const params = {
      page,
      limit: 20,
      sortBy,
      sortOrder,
      ...Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== "")
      ),
    };
    dispatch(fetchProjectInvoices({ projectId, params }));
    dispatch(fetchInvoiceStats(projectId));
  };

  const handleInvoiceUpdated = () => {
    setShowEditSidebar(false);
    setEditingInvoice(null);
    const params = {
      page,
      limit: 20,
      sortBy,
      sortOrder,
      ...Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== "")
      ),
    };
    dispatch(fetchProjectInvoices({ projectId, params }));
    dispatch(fetchInvoiceStats(projectId));
  };

  useEffect(() => {
    if (error) {
      dispatch(clearError());
    }
  }, [dispatch, error]);

  return (
    <CrmLayout>
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
              <p className="text-sm text-gray-500 mt-1">
                Manage invoices and track payments
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                  />
                </svg>
                Filters
              </Button>
              {hasSupportExecutiveAccess && (
                <Button onClick={() => setShowCreateSidebar(true)}>
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Create Invoice
                </Button>
              )}
            </div>
          </div>

          {/* View Toggle */}
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

        {/* Filters */}
        {showFilters && (
          <InvoiceFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            onClose={() => setShowFilters(false)}
          />
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto bg-gray-50">
          {error && (
            <div className="px-6 py-4">
              <Alert type="error" message={error} />
            </div>
          )}

          {currentView === "stats" ? (
            <InvoiceStats stats={stats} loading={loading} />
          ) : (
            <>
              {/* Table Header */}
              <div className="bg-white border-b border-gray-200 px-6 py-3">
                <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-700">
                  <div className="col-span-2">Invoice Number</div>
                  <div className="col-span-2">Customer</div>
                  <div className="col-span-2">Deal</div>
                  <div className="col-span-1 text-right">Amount</div>
                  <div className="col-span-1 text-center">Status</div>
                  <div className="col-span-1">Due Date</div>
                  <div className="col-span-1 text-right">Paid</div>
                  <div className="col-span-1 text-right">Remaining</div>
                  <div className="col-span-1 text-right">Actions</div>
                </div>
              </div>

              {/* Invoice List */}
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
              ) : invoices.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">No invoices found</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {invoices.map((invoice) => (
                    <InvoiceListItem
                      key={invoice._id}
                      invoice={invoice}
                      onView={() => handleViewInvoice(invoice._id)}
                      onEdit={() => handleEditInvoice(invoice)}
                      onDelete={() => handleDeleteInvoice(invoice._id)}
                    />
                  ))}
                </div>
              )}

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="px-6 py-4 bg-white border-t border-gray-200 flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Showing {(page - 1) * 20 + 1} to{" "}
                    {Math.min(page * 20, pagination.total)} of{" "}
                    {pagination.total} invoices
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

      {/* Sidebars */}
      {showCreateSidebar && (
        <CreateInvoiceSidebar
          isOpen={showCreateSidebar}
          onClose={() => setShowCreateSidebar(false)}
          projectId={projectId}
          onSuccess={handleInvoiceCreated}
        />
      )}

      {showEditSidebar && editingInvoice && (
        <EditInvoiceSidebar
          isOpen={showEditSidebar}
          onClose={() => {
            setShowEditSidebar(false);
            setEditingInvoice(null);
          }}
          projectId={projectId}
          invoice={editingInvoice}
          onSuccess={handleInvoiceUpdated}
        />
      )}
    </CrmLayout>
  );
};

export default Invoices;
