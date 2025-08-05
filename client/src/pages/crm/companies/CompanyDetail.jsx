import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getCompanyById, getCompanyNotes, addCompanyNote, deleteCompany, clearCompany } from '../../../store/companySlice';
import CrmLayout from '../../../layouts/CrmLayout';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Alert from '../../../components/ui/Alert';
import CompanySidebar from './CompanySidebar';

const CompanyDetail = () => {
  const { projectId, companyId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { company, notes, isLoading, isError, message } = useSelector((state) => state.companies);
  
  const [showEditSidebar, setShowEditSidebar] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [noteContent, setNoteContent] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch company data on mount
  useEffect(() => {
    if (companyId) {
      dispatch(getCompanyById(companyId));
      dispatch(getCompanyNotes(companyId));
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
      dispatch(addCompanyNote({ id: companyId, noteData: { content: noteContent } }))
        .then(() => {
          setNoteContent('');
        });
    }
  };

  // Handle company deletion
  const handleDeleteCompany = () => {
    dispatch(deleteCompany(companyId))
      .unwrap()
      .then(() => {
        navigate(`/crm/${projectId}/companies`);
      });
  };

  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'lead':
        return 'bg-yellow-100 text-yellow-800';
      case 'customer':
        return 'bg-blue-100 text-blue-800';
      case 'partner':
        return 'bg-purple-100 text-purple-800';
      case 'vendor':
        return 'bg-orange-100 text-orange-800';
      case 'competitor':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
          <Alert variant="danger" message={message || 'Failed to load company details'} />
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
              <h1 className="text-2xl font-semibold text-gray-900">{company.name}</h1>
              <div className="flex items-center mt-1">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(company.status)}`}>
                  {company.status || 'Unknown'}
                </span>
                {company.industry && (
                  <span className="ml-2 text-sm text-gray-500">
                    {company.industry}
                  </span>
                )}
              </div>
            </div>
          </div>
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
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`${
                activeTab === 'overview'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('notes')}
              className={`${
                activeTab === 'notes'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Notes
            </button>
            <button
              onClick={() => setActiveTab('deals')}
              className={`${
                activeTab === 'deals'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Deals
            </button>
            <button
              onClick={() => setActiveTab('contacts')}
              className={`${
                activeTab === 'contacts'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Contacts
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-sm">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Company Information</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <dl className="divide-y divide-gray-200">
                      {company.website && (
                        <div className="py-3 flex justify-between">
                          <dt className="text-sm font-medium text-gray-500">Website</dt>
                          <dd className="text-sm text-gray-900">
                            <a 
                              href={company.website.startsWith('http') ? company.website : `https://${company.website}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-indigo-600 hover:text-indigo-500"
                            >
                              {company.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                            </a>
                          </dd>
                        </div>
                      )}
                      {company.email && (
                        <div className="py-3 flex justify-between">
                          <dt className="text-sm font-medium text-gray-500">Email</dt>
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
                          <dt className="text-sm font-medium text-gray-500">Phone</dt>
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
                          <dt className="text-sm font-medium text-gray-500">Company Size</dt>
                          <dd className="text-sm text-gray-900">{company.size}</dd>
                        </div>
                      )}
                      {company.annualRevenue && (
                        <div className="py-3 flex justify-between">
                          <dt className="text-sm font-medium text-gray-500">Annual Revenue</dt>
                          <dd className="text-sm text-gray-900">{company.annualRevenue}</dd>
                        </div>
                      )}
                      {company.foundedYear && (
                        <div className="py-3 flex justify-between">
                          <dt className="text-sm font-medium text-gray-500">Founded</dt>
                          <dd className="text-sm text-gray-900">{company.foundedYear}</dd>
                        </div>
                      )}
                      <div className="py-3 flex justify-between">
                        <dt className="text-sm font-medium text-gray-500">Created</dt>
                        <dd className="text-sm text-gray-900">{formatDate(company.createdAt)}</dd>
                      </div>
                      <div className="py-3 flex justify-between">
                        <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                        <dd className="text-sm text-gray-900">{formatDate(company.updatedAt)}</dd>
                      </div>
                    </dl>
                  </div>

                  {/* Tags */}
                  {company.tags && company.tags.length > 0 && (
                    <div className="mt-6">
                      <h4 className="text-sm font-medium text-gray-500 mb-2">Tags</h4>
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
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Address</h3>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <address className="not-italic">
                          {company.address.street && <div className="text-sm text-gray-900">{company.address.street}</div>}
                          {(company.address.city || company.address.state || company.address.zipCode) && (
                            <div className="text-sm text-gray-900">
                              {company.address.city && `${company.address.city}, `}
                              {company.address.state && `${company.address.state} `}
                              {company.address.zipCode && company.address.zipCode}
                            </div>
                          )}
                          {company.address.country && <div className="text-sm text-gray-900">{company.address.country}</div>}
                        </address>
                      </div>
                    </div>
                  )}

                  {/* Description */}
                  {company.description && (
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Description</h3>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-gray-900 whitespace-pre-wrap">{company.description}</p>
                      </div>
                    </div>
                  )}

                  {/* Custom Fields */}
                  {company.customFields && Object.keys(company.customFields).length > 0 && (
                    <div className="mt-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Additional Information</h3>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <dl className="divide-y divide-gray-200">
                          {Object.entries(company.customFields).map(([key, value]) => (
                            <div key={key} className="py-3 flex justify-between">
                              <dt className="text-sm font-medium text-gray-500">{key}</dt>
                              <dd className="text-sm text-gray-900">{value}</dd>
                            </div>
                          ))}
                        </dl>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Notes Tab */}
          {activeTab === 'notes' && (
            <div className="p-6">
              {/* Add Note Form */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Add Note</h3>
                <form onSubmit={handleNoteSubmit}>
                  <div className="mb-3">
                    <textarea
                      value={noteContent}
                      onChange={(e) => setNoteContent(e.target.value)}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
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

              {/* Notes List */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Notes</h3>
                {notes.length === 0 ? (
                  <div className="bg-gray-50 rounded-lg p-6 text-center">
                    <p className="text-gray-500">No notes yet. Add your first note above.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {notes.map((note) => (
                      <div key={note._id} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="text-sm text-gray-900 whitespace-pre-wrap">{note.content}</p>
                            <div className="mt-2 flex items-center text-xs text-gray-500">
                              <span>{formatDate(note.createdAt)}</span>
                              {note.createdBy && (
                                <>
                                  <span className="mx-1">•</span>
                                  <span>{note.createdBy.name}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Deals Tab */}
          {activeTab === 'deals' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Deals</h3>
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                  }
                >
                  Add Deal
                </Button>
              </div>
              <div className="bg-gray-50 rounded-lg p-6 text-center">
                <p className="text-gray-500">No deals associated with this company yet.</p>
              </div>
            </div>
          )}

          {/* Contacts Tab */}
          {activeTab === 'contacts' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Contacts</h3>
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                  }
                >
                  Add Contact
                </Button>
              </div>
              <div className="bg-gray-50 rounded-lg p-6 text-center">
                <p className="text-gray-500">No contacts associated with this company yet.</p>
              </div>
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
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setShowDeleteConfirm(false)}></div>
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
              <div className="text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mt-4">Delete Company</h3>
                <p className="text-sm text-gray-500 mt-2">
                  Are you sure you want to delete <span className="font-semibold">{company.name}</span>? This action cannot be undone.
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