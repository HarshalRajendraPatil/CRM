import React from 'react';
import ContactListItem from './ContactListItem';
import ContactGridItem from './ContactGridItem';
import ContactKanbanBoard from './ContactKanbanBoard';

const ContactList = ({
  contacts,
  isLoading,
  viewMode,
  selectedContacts,
  onContactSelect,
  onSelectAll,
  onContactClick,
  onLoadMore,
  hasMore,
  pagination
}) => {
  if (isLoading && contacts.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-sm text-gray-500">Loading contacts...</p>
        </div>
      </div>
    );
  }

  if (contacts.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-12 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No contacts found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating your first contact.
          </p>
        </div>
      </div>
    );
  }

  const allSelected = contacts.length > 0 && selectedContacts.length === contacts.length;
  const someSelected = selectedContacts.length > 0 && selectedContacts.length < contacts.length;

  return (
    <div className="bg-white shadow rounded-lg">
      {/* List View */}
      {viewMode === 'list' && (
        <div className="overflow-hidden">
          {/* Table Header */}
          <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={allSelected}
                ref={input => {
                  if (input) input.indeterminate = someSelected;
                }}
                onChange={onSelectAll}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <span className="ml-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                {selectedContacts.length > 0 ? `${selectedContacts.length} selected` : 'Select all'}
              </span>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Company
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stage
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lead Score
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assigned To
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Activity
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {contacts.map((contact) => (
                  <ContactListItem
                    key={contact._id}
                    contact={contact}
                    isSelected={selectedContacts.includes(contact._id)}
                    onSelect={() => onContactSelect(contact._id)}
                    onClick={() => onContactClick(contact)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {contacts.map((contact) => (
              <ContactGridItem
                key={contact._id}
                contact={contact}
                isSelected={selectedContacts.includes(contact._id)}
                onSelect={() => onContactSelect(contact._id)}
                onClick={() => onContactClick(contact)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Kanban View */}
      {viewMode === 'kanban' && (
        <ContactKanbanBoard
          contacts={contacts}
          selectedContacts={selectedContacts}
          onContactSelect={onContactSelect}
          onContactClick={onContactClick}
        />
      )}

      {/* Load More */}
      {hasMore && (
        <div className="px-6 py-4 border-t border-gray-200">
          <button
            onClick={onLoadMore}
            disabled={isLoading}
            className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                Loading...
              </>
            ) : (
              'Load more contacts'
            )}
          </button>
        </div>
      )}

      {/* Pagination Info */}
      {pagination && (
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>
              Showing {contacts.length} of {pagination.total} contacts
            </span>
            {pagination.hasMore && (
              <span>
                {pagination.total - contacts.length} more available
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactList;
