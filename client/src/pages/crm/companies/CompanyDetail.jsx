import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  getCompanyById,
  getCompanyNotes,
  addCompanyNote,
  updateCompanyNote,
  deleteCompanyNote,
  deleteCompany,
  clearCompany,
} from "../../../store/companySlice";
import { formatCurrency } from "../../../utils/dealUtils";
import { fetchProjectCustomers } from "../../../store/customerSlice";
import CrmLayout from "../../../layouts/CrmLayout";
import Button from "../../../components/ui/Button";
import Alert from "../../../components/ui/Alert";
import CompanySidebar from "./CompanySidebar";
import ActivityTimeline from "../../../components/activity/ActivityTimeline";
import useProjectAccess from "../../../hooks/useProjectAccess";
import { getProjectById } from "../../../store/projectSlice";
import { getProjectLeads } from "../../../store/leadSlice";

const CompanyDetail = () => {
  const { projectId, companyId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { company, notes, isLoading, isError, message } = useSelector(
    (state) => state.companies
  );
  const { customers } = useSelector((state) => state.customers);
  const { leads } = useSelector((state) => state.leads);
  const { user } = useSelector((state) => state.auth);
  const [showEditSidebar, setShowEditSidebar] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [noteContent, setNoteContent] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [editingNote, setEditingNote] = useState(null);
  const [editNoteContent, setEditNoteContent] = useState("");
  const { hasSalesExecutiveAccess } = useProjectAccess();

  // Fetch company data on mount
  useEffect(() => {
    if (companyId) {
      dispatch(getProjectById(projectId));
      dispatch(getCompanyById({ id: companyId, projectId }));
      dispatch(getCompanyNotes({ id: companyId, projectId }));
      dispatch(
        fetchProjectCustomers({ projectId, params: { company: companyId } })
      );
      dispatch(getProjectLeads({ projectId, params: { company: companyId } }));
    }

    // Cleanup on unmount
    return () => {
      dispatch(clearCompany());
    };
  }, [dispatch, companyId]);

  // Handle note submission
  const handleNoteSubmit = (e) => {
    e.preventDefault();
    if (noteContent.trim()) {
      dispatch(
        addCompanyNote({
          id: companyId,
          noteData: { content: noteContent },
          projectId,
        })
      ).then(() => {
        setNoteContent("");
      });
    }
  };

  // Handle note editing
  const handleEditNote = (note) => {
    setEditingNote(note._id);
    setEditNoteContent(note.content);
  };

  // Handle note update
  const handleUpdateNote = (e) => {
    e.preventDefault();
    if (editNoteContent.trim()) {
      dispatch(
        updateCompanyNote({
          id: companyId,
          projectId,
          noteId: editingNote,
          noteData: { content: editNoteContent },
        })
      ).then(() => {
        setEditingNote(null);
        setEditNoteContent("");
      });
    }
  };

  // Handle note deletion
  const handleDeleteNote = (noteId) => {
    if (window.confirm("Are you sure you want to delete this note?")) {
      dispatch(deleteCompanyNote({ id: companyId, noteId, projectId }));
    }
  };

  // Cancel note editing
  const cancelEditNote = () => {
    setEditingNote(null);
    setEditNoteContent("");
  };

  // Handle company deletion
  const handleDeleteCompany = () => {
    dispatch(deleteCompany({ id: companyId, projectId }))
      .unwrap()
      .then(() => {
        navigate(`/crm/${projectId}/companies`);
      });
  };

  // Format date
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-gray-100 text-gray-800";
      case "lead":
        return "bg-yellow-100 text-yellow-800";
      case "customer":
        return "bg-blue-100 text-blue-800";
      case "partner":
        return "bg-purple-100 text-purple-800";
      case "vendor":
        return "bg-orange-100 text-orange-800";
      case "competitor":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading && !company) {
    return (
      <CrmLayout>
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      </CrmLayout>
    );
  }

  if (isError) {
    return (
      <CrmLayout>
        <div className="p-6">
          <Alert
            variant="danger"
            message={message || "Failed to load company details"}
          />
          <div className="mt-4">
            <Button
              variant="secondary"
              onClick={() => navigate(`/crm/${projectId}/companies`)}
            >
              Back to Companies
            </Button>
          </div>
        </div>
      </CrmLayout>
    );
  }

  if (!company) {
    return (
      <CrmLayout>
        <div className="p-6">
          <Alert variant="warning" message="Company not found" />
          <div className="mt-4">
            <Button
              variant="secondary"
              onClick={() => navigate(`/crm/${projectId}/companies`)}
            >
              Back to Companies
            </Button>
          </div>
        </div>
      </CrmLayout>
    );
  }

  return (
    <CrmLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div className="flex items-center">
            <div className="mr-4">
              {company.logo ? (
                <img
                  src={company.logo}
                  alt={company.name}
                  className="h-16 w-16 rounded-md object-cover"
                />
              ) : (
                <div className="h-16 w-16 rounded-md bg-indigo-100 flex items-center justify-center">
                  <span className="text-indigo-700 font-bold text-2xl">
                    {company.name.charAt(0)}
                  </span>
                </div>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                {company.name}
              </h1>
              <div className="flex items-center mt-1">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                    company.status
                  )}`}
                >
                  {company.status || "Unknown"}
                </span>
                {company.industry && (
                  <span className="ml-2 text-sm text-gray-500">
                    {company.industry}
                  </span>
                )}
              </div>
            </div>
          </div>
          {hasSalesExecutiveAccess && (
            <div className="mt-4 md:mt-0 flex space-x-3">
              <Button
                variant="secondary"
                onClick={() => setShowEditSidebar(true)}
              >
                Edit
              </Button>
              <Button
                variant="danger"
                onClick={() => setShowDeleteConfirm(true)}
              >
                Delete
              </Button>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("overview")}
              className={`${
                activeTab === "overview"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("notes")}
              className={`${
                activeTab === "notes"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Notes
            </button>
            <button
              onClick={() => setActiveTab("deals")}
              className={`${
                activeTab === "deals"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Deals
            </button>
            <button
              onClick={() => setActiveTab("contacts")}
              className={`${
                activeTab === "contacts"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Contacts
            </button>
            <button
              onClick={() => setActiveTab("leads")}
              className={`${
                activeTab === "leads"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Leads
            </button>
            <button
              onClick={() => setActiveTab("activity")}
              className={`${
                activeTab === "activity"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Activity
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-sm">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Company Information
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <dl className="divide-y divide-gray-200">
                      {company.website && (
                        <div className="py-3 flex justify-between">
                          <dt className="text-sm font-medium text-gray-500">
                            Website
                          </dt>
                          <dd className="text-sm text-gray-900">
                            <a
                              href={
                                company.website.startsWith("http")
                                  ? company.website
                                  : `https://${company.website}`
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-indigo-600 hover:text-indigo-500"
                            >
                              {company.website
                                .replace(/^https?:\/\//, "")
                                .replace(/\/$/, "")}
                            </a>
                          </dd>
                        </div>
                      )}
                      {company.email && (
                        <div className="py-3 flex justify-between">
                          <dt className="text-sm font-medium text-gray-500">
                            Email
                          </dt>
                          <dd className="text-sm text-gray-900">
                            <a
                              href={`mailto:${company.email}`}
                              className="text-indigo-600 hover:text-indigo-500"
                            >
                              {company.email}
                            </a>
                          </dd>
                        </div>
                      )}
                      {company.phone && (
                        <div className="py-3 flex justify-between">
                          <dt className="text-sm font-medium text-gray-500">
                            Phone
                          </dt>
                          <dd className="text-sm text-gray-900">
                            <a
                              href={`tel:${company.phone}`}
                              className="text-indigo-600 hover:text-indigo-500"
                            >
                              {company.phone}
                            </a>
                          </dd>
                        </div>
                      )}
                      {company.size && (
                        <div className="py-3 flex justify-between">
                          <dt className="text-sm font-medium text-gray-500">
                            Company Size
                          </dt>
                          <dd className="text-sm text-gray-900">
                            {company.size}
                          </dd>
                        </div>
                      )}
                      {company.annualRevenue && (
                        <div className="py-3 flex justify-between">
                          <dt className="text-sm font-medium text-gray-500">
                            Annual Revenue
                          </dt>
                          <dd className="text-sm text-gray-900">
                            {company.annualRevenue}
                          </dd>
                        </div>
                      )}
                      {company.founded && (
                        <div className="py-3 flex justify-between">
                          <dt className="text-sm font-medium text-gray-500">
                            Founded
                          </dt>
                          <dd className="text-sm text-gray-900">
                            {company.founded}
                          </dd>
                        </div>
                      )}
                      <div className="py-3 flex justify-between">
                        <dt className="text-sm font-medium text-gray-500">
                          Created
                        </dt>
                        <dd className="text-sm text-gray-900">
                          {formatDate(company.createdAt)}
                        </dd>
                      </div>
                      <div className="py-3 flex justify-between">
                        <dt className="text-sm font-medium text-gray-500">
                          Last Updated
                        </dt>
                        <dd className="text-sm text-gray-900">
                          {formatDate(company.updatedAt)}
                        </dd>
                      </div>
                    </dl>
                  </div>

                  {/* Tags */}
                  {company.tags && company.tags.length > 0 && (
                    <div className="mt-6">
                      <h4 className="text-sm font-medium text-gray-500 mb-2">
                        Tags
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {company.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-indigo-100 text-indigo-800"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  {/* Address */}
                  {company.address && (
                    <div className="mb-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">
                        Address
                      </h3>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <address className="not-italic">
                          {company.address.street && (
                            <div className="text-sm text-gray-900">
                              {company.address.street}
                            </div>
                          )}
                          {(company.address.city ||
                            company.address.state ||
                            company.address.zipCode) && (
                            <div className="text-sm text-gray-900">
                              {company.address.city &&
                                `${company.address.city}, `}
                              {company.address.state &&
                                `${company.address.state} `}
                              {company.address.zipCode &&
                                company.address.zipCode}
                            </div>
                          )}
                          {company.address.country && (
                            <div className="text-sm text-gray-900">
                              {company.address.country}
                            </div>
                          )}
                        </address>
                      </div>
                    </div>
                  )}

                  {/* Description */}
                  {company.description && (
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">
                        Description
                      </h3>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-gray-900 whitespace-pre-wrap">
                          {company.description}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Social Media */}
                  {company.socialMedia && company.socialMedia.length > 0 && (
                    <div className="mt-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">
                        Social Media
                      </h3>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="space-y-3">
                          {company.socialMedia.map((social, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between"
                            >
                              <div className="flex items-center">
                                <span className="text-sm font-medium text-gray-500 capitalize mr-2">
                                  {social.platform}:
                                </span>
                                <a
                                  href={social.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-indigo-600 hover:text-indigo-500"
                                >
                                  {social.handle
                                    ? `@${social.handle}`
                                    : social.url}
                                </a>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Custom Fields */}
                  {company.customFields &&
                    Object.keys(company.customFields).length > 0 && (
                      <div className="mt-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                          Additional Information
                        </h3>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <dl className="divide-y divide-gray-200">
                            {Object.entries(company.customFields).map(
                              ([key, value]) => (
                                <div
                                  key={key}
                                  className="py-3 flex justify-between"
                                >
                                  <dt className="text-sm font-medium text-gray-500">
                                    {key}
                                  </dt>
                                  <dd className="text-sm text-gray-900">
                                    {value}
                                  </dd>
                                </div>
                              )
                            )}
                          </dl>
                        </div>
                      </div>
                    )}
                </div>
              </div>
            </div>
          )}

          {/* Notes Tab */}
          {activeTab === "notes" && (
            <div className="p-6">
              {/* Add Note Form */}
              {hasSalesExecutiveAccess && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Add Note
                  </h3>
                  <form onSubmit={handleNoteSubmit}>
                    <div className="mb-3">
                      <textarea
                        value={noteContent}
                        onChange={(e) => setNoteContent(e.target.value)}
                        className="shadow-sm focus:ring-indigo-500 border border-gray-300 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-1"
                        placeholder="Add a note about this company..."
                        rows={3}
                        required
                      />
                    </div>
                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        variant="primary"
                        disabled={isLoading || !noteContent.trim()}
                      >
                        Add Note
                      </Button>
                    </div>
                  </form>
                </div>
              )}

              {/* Notes List */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Notes
                </h3>
                {notes.length === 0 ? (
                  <div className="bg-gray-50 rounded-lg p-6 text-center">
                    <p className="text-gray-500">
                      No notes yet. Add your first note above.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {notes.map((note) => (
                      <div key={note._id} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            {editingNote === note._id ? (
                              <form
                                onSubmit={handleUpdateNote}
                                className="space-y-3"
                              >
                                <textarea
                                  value={editNoteContent}
                                  onChange={(e) =>
                                    setEditNoteContent(e.target.value)
                                  }
                                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                  rows={3}
                                  required
                                />
                                <div className="flex space-x-2">
                                  <Button
                                    type="submit"
                                    variant="primary"
                                    size="sm"
                                  >
                                    Save
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="secondary"
                                    size="sm"
                                    onClick={cancelEditNote}
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </form>
                            ) : (
                              <>
                                <p className="text-sm text-gray-900 whitespace-pre-wrap">
                                  {note.content}
                                </p>
                                <div className="mt-2 flex items-center justify-between">
                                  <div className="flex items-center text-xs text-gray-500">
                                    <span>{formatDate(note.createdAt)}</span>
                                    {note.createdBy && (
                                      <>
                                        <span className="mx-1">•</span>
                                        <span>{note.createdBy.name}</span>
                                      </>
                                    )}
                                  </div>
                                  {user?._id === note.createdBy?._id && (
                                    <div className="flex space-x-2">
                                      <button
                                        onClick={() => handleEditNote(note)}
                                        className="text-xs text-indigo-600 hover:text-indigo-800"
                                      >
                                        Edit
                                      </button>
                                      <button
                                        onClick={() =>
                                          handleDeleteNote(note._id)
                                        }
                                        className="text-xs text-red-600 hover:text-red-800"
                                      >
                                        Delete
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Activity Tab */}
          {activeTab === "activity" && (
            <div className="p-6">
              <ActivityTimeline
                entityType="Company"
                entityId={companyId}
                projectId={projectId}
              />
            </div>
          )}

          {/* Deals Tab */}
          {activeTab === "deals" && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Company Deals
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {company.deals?.length || 0} deal
                    {company.deals?.length !== 1 ? "s" : ""} associated with
                    this company
                  </p>
                </div>
              </div>

              {/* Deals List */}
              {company.deals && company.deals.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {company.deals.map((deal) => (
                    <div
                      key={deal._id}
                      onClick={() =>
                        navigate(`/crm/${projectId}/deals/${deal._id}`)
                      }
                      className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-lg hover:border-indigo-300 transition-all duration-200 cursor-pointer group"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="text-base font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                            {deal.name}
                          </h4>
                        </div>
                        <div className="ml-2">
                          <svg
                            className="w-5 h-5 text-gray-400 group-hover:text-indigo-600 transition-colors"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </div>
                      </div>

                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-2xl font-bold text-gray-900">
                            {formatCurrency(deal.value, deal.currency)}
                          </span>
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                              deal.status === "closed-won"
                                ? "bg-green-100 text-green-800"
                                : deal.status === "closed-lost"
                                ? "bg-red-100 text-red-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {deal.status
                              ?.replace("-", " ")
                              .replace(/\b\w/g, (l) => l.toUpperCase())}
                          </span>
                        </div>
                        {deal.priority && (
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                              deal.priority === "high"
                                ? "bg-orange-100 text-orange-800"
                                : deal.priority === "urgent"
                                ? "bg-red-100 text-red-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {deal.priority.charAt(0).toUpperCase() +
                              deal.priority.slice(1)}{" "}
                            Priority
                          </span>
                        )}
                      </div>

                      <div className="space-y-2 border-t border-gray-100 pt-3">
                        {deal.stage && (
                          <div className="flex items-center text-sm text-gray-600">
                            <svg
                              className="w-4 h-4 mr-2 text-gray-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                              />
                            </svg>
                            <span className="font-medium">Stage:</span>
                            <span className="ml-1">
                              {deal.stage.name || deal.stage}
                            </span>
                          </div>
                        )}
                        {deal.expectedCloseDate && (
                          <div className="flex items-center text-sm text-gray-600">
                            <svg
                              className="w-4 h-4 mr-2 text-gray-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                            <span className="font-medium">Expected Close:</span>
                            <span className="ml-1">
                              {formatDate(deal.expectedCloseDate)}
                            </span>
                          </div>
                        )}
                        {deal.assignedTo && (
                          <div className="flex items-center text-sm text-gray-600">
                            <svg
                              className="w-4 h-4 mr-2 text-gray-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                              />
                            </svg>
                            <span className="font-medium">Assigned:</span>
                            <span className="ml-1">
                              {deal.assignedTo.name ||
                                deal.assignedTo.email ||
                                "Unassigned"}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <h3 className="mt-4 text-sm font-medium text-gray-900">
                    No deals yet
                  </h3>
                  <p className="mt-2 text-sm text-gray-500 max-w-sm mx-auto">
                    Create a deal to start tracking sales opportunities for this
                    company.
                  </p>
                  <div className="mt-6">
                    {hasSalesExecutiveAccess && (
                      <Button
                        onClick={() =>
                          navigate(
                            `/crm/${projectId}/deals?company=${companyId}`
                          )
                        }
                      >
                        Create First Deal
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Contacts Tab */}
          {activeTab === "contacts" && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Contacts
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {customers.length} contact
                    {customers.length !== 1 ? "s" : ""} associated with this
                    company
                  </p>
                </div>
              </div>
              {customers.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  <h3 className="mt-4 text-sm font-medium text-gray-900">
                    No contacts yet
                  </h3>
                  <p className="mt-2 text-sm text-gray-500 max-w-sm mx-auto">
                    No contacts are currently associated with this company.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {customers.map((customer) => {
                    const getInitials = (firstName, lastName) => {
                      const first = firstName
                        ? firstName.charAt(0).toUpperCase()
                        : "";
                      const last = lastName
                        ? lastName.charAt(0).toUpperCase()
                        : "";
                      return first + last || "?";
                    };

                    return (
                      <Link
                        to={`/crm/${projectId}/customers/${customer._id}`}
                        key={customer._id}
                        className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-lg hover:border-indigo-300 transition-all duration-200 group"
                      >
                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0">
                            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
                              <span className="text-white font-semibold text-lg">
                                {getInitials(
                                  customer.firstName,
                                  customer.lastName
                                )}
                              </span>
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-base font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors truncate">
                              {customer.firstName} {customer.lastName}
                            </h4>
                            {customer.jobTitle && (
                              <p className="text-sm text-gray-500 mt-0.5 truncate">
                                {customer.jobTitle}
                              </p>
                            )}
                          </div>
                          <svg
                            className="w-5 h-5 text-gray-400 group-hover:text-indigo-600 transition-colors flex-shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </div>

                        <div className="mt-4 space-y-2 border-t border-gray-100 pt-3">
                          {customer.email && (
                            <div className="flex items-center text-sm text-gray-600">
                              <svg
                                className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                />
                              </svg>
                              <span className="truncate">{customer.email}</span>
                            </div>
                          )}
                          {customer.phone && (
                            <div className="flex items-center text-sm text-gray-600">
                              <svg
                                className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                                />
                              </svg>
                              <span>{customer.phone}</span>
                            </div>
                          )}
                          {customer.lifecycleStage && (
                            <div className="flex items-center mt-2">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  customer.lifecycleStage === "customer"
                                    ? "bg-green-100 text-green-800"
                                    : customer.lifecycleStage === "lead"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-blue-100 text-blue-800"
                                }`}
                              >
                                {customer.lifecycleStage
                                  .charAt(0)
                                  .toUpperCase() +
                                  customer.lifecycleStage.slice(1)}
                              </span>
                            </div>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Leads Tab */}
          {activeTab === "leads" && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Company Leads
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {leads.length} lead{leads.length !== 1 ? "s" : ""}{" "}
                    associated with this company
                  </p>
                </div>
              </div>

              {leads.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                  <h3 className="mt-4 text-sm font-medium text-gray-900">
                    No leads yet
                  </h3>
                  <p className="mt-2 text-sm text-gray-500 max-w-sm mx-auto">
                    Create a lead to start tracking potential opportunities for
                    this company.
                  </p>
                  <div className="mt-6">
                    {hasSalesExecutiveAccess && (
                      <Button
                        onClick={() =>
                          navigate(
                            `/crm/${projectId}/leads?company=${companyId}`
                          )
                        }
                      >
                        Create First Lead
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {leads.map((lead) => {
                    const getInitials = (name) => {
                      if (!name) return "?";
                      const parts = name.split(" ");
                      if (parts.length >= 2) {
                        return (
                          parts[0].charAt(0) + parts[parts.length - 1].charAt(0)
                        ).toUpperCase();
                      }
                      return name.charAt(0).toUpperCase();
                    };

                    const getStageColor = (stage) => {
                      switch (stage) {
                        case "new":
                          return "bg-blue-100 text-blue-800";
                        case "contacted":
                          return "bg-yellow-100 text-yellow-800";
                        case "qualified":
                          return "bg-green-100 text-green-800";
                        case "disqualified":
                          return "bg-red-100 text-red-800";
                        default:
                          return "bg-gray-100 text-gray-800";
                      }
                    };

                    return (
                      <div
                        key={lead._id}
                        onClick={() =>
                          navigate(`/crm/${projectId}/leads/${lead._id}`)
                        }
                        className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-lg hover:border-indigo-300 transition-all duration-200 cursor-pointer group"
                      >
                        <div className="flex items-start space-x-4 mb-4">
                          <div className="flex-shrink-0">
                            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-md">
                              <span className="text-white font-semibold text-lg">
                                {getInitials(lead.name)}
                              </span>
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <h4 className="text-base font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors truncate">
                                {lead.name}
                              </h4>
                              <svg
                                className="w-5 h-5 text-gray-400 group-hover:text-indigo-600 transition-colors flex-shrink-0 ml-2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 5l7 7-7 7"
                                />
                              </svg>
                            </div>
                            {lead.jobTitle && (
                              <p className="text-sm text-gray-500 mt-0.5 truncate">
                                {lead.jobTitle}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="mb-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStageColor(
                              lead.stage || lead.status || "new"
                            )}`}
                          >
                            {(lead.stage || lead.status || "new")
                              .charAt(0)
                              .toUpperCase() +
                              (lead.stage || lead.status || "new").slice(1)}
                          </span>
                          {lead.score !== undefined && lead.score !== null && (
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800">
                              Score: {lead.score}
                            </span>
                          )}
                        </div>

                        <div className="space-y-2 border-t border-gray-100 pt-3">
                          {lead.email && (
                            <div className="flex items-center text-sm text-gray-600">
                              <svg
                                className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                />
                              </svg>
                              <span className="truncate">{lead.email}</span>
                            </div>
                          )}
                          {lead.phone && (
                            <div className="flex items-center text-sm text-gray-600">
                              <svg
                                className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                                />
                              </svg>
                              <span>{lead.phone}</span>
                            </div>
                          )}
                          {lead.source && (
                            <div className="flex items-center text-sm text-gray-600">
                              <svg
                                className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                                />
                              </svg>
                              <span className="font-medium">Source:</span>
                              <span className="ml-1 capitalize">
                                {lead.source}
                              </span>
                            </div>
                          )}
                          {lead.assignedTo && (
                            <div className="flex items-center text-sm text-gray-600">
                              <svg
                                className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                />
                              </svg>
                              <span className="font-medium">Assigned:</span>
                              <span className="ml-1">
                                {lead.assignedTo.name ||
                                  lead.assignedTo.email ||
                                  "Unassigned"}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Edit Company Sidebar */}
      <CompanySidebar
        isOpen={showEditSidebar}
        onClose={() => setShowEditSidebar(false)}
        projectId={projectId}
        company={company}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <>
          <div
            className="fixed inset-0 bg-transparent backdrop-blur-sm bg-opacity-50 z-40"
            onClick={() => setShowDeleteConfirm(false)}
          ></div>
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
              <div className="text-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 mx-auto text-red-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mt-4">
                  Delete Company
                </h3>
                <p className="text-sm text-gray-500 mt-2">
                  Are you sure you want to delete{" "}
                  <span className="font-semibold">{company.name}</span>? This
                  action cannot be undone.
                </p>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <Button
                  variant="secondary"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  onClick={handleDeleteCompany}
                  isLoading={isLoading}
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </CrmLayout>
  );
};

export default CompanyDetail;
