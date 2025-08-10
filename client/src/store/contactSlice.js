import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import contactService from '../services/contactService';

// Initial state
const initialState = {
  contacts: [],
  contact: null,
  notes: [],
  stats: null,
  insights: null,
  isLoading: false,
  isSuccess: false,
  isError: false,
  message: '',
  pagination: {
    total: 0,
    limit: 20,
    skip: 0,
    hasMore: false
  }
};

// Get contacts for a project
export const getProjectContacts = createAsyncThunk(
  'contacts/getProjectContacts',
  async ({ projectId, params }, thunkAPI) => {
    try {
      return await contactService.getProjectContacts(projectId, params);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch contacts';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get contacts for a company
export const getCompanyContacts = createAsyncThunk(
  'contacts/getCompanyContacts',
  async ({ companyId, params }, thunkAPI) => {
    try {
      return await contactService.getCompanyContacts(companyId, params);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch company contacts';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get contact by ID
export const getContactById = createAsyncThunk(
  'contacts/getContactById',
  async (contactId, thunkAPI) => {
    try {
      return await contactService.getContactById(contactId);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch contact';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Create a new contact
export const createContact = createAsyncThunk(
  'contacts/createContact',
  async (contactData, thunkAPI) => {
    try {
      return await contactService.createContact(contactData);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to create contact';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Update a contact
export const updateContact = createAsyncThunk(
  'contacts/updateContact',
  async ({ contactId, contactData }, thunkAPI) => {
    try {
      return await contactService.updateContact(contactId, contactData);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to update contact';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Delete a contact
export const deleteContact = createAsyncThunk(
'contacts/deleteContact',
  async (contactId, thunkAPI) => {
    try {
      return await contactService.deleteContact(contactId);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to delete contact';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Add a note to a contact
export const addContactNote = createAsyncThunk(
  'contacts/addContactNote',
  async ({ contactId, noteData }, thunkAPI) => {
    try {
      return await contactService.addContactNote(contactId, noteData);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to add note';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get notes for a contact
export const getContactNotes = createAsyncThunk(
  'contacts/getContactNotes',
  async (contactId, thunkAPI) => {
    try {
      return await contactService.getContactNotes(contactId);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch notes';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Add a tag to a contact
export const addContactTag = createAsyncThunk(
  'contacts/addContactTag',
  async ({ contactId, tagData }, thunkAPI) => {
    try {
      return await contactService.addContactTag(contactId, tagData);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to add tag';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Remove a tag from a contact
export const removeContactTag = createAsyncThunk(
  'contacts/removeContactTag',
  async ({ contactId, tag }, thunkAPI) => {
    try {
      return await contactService.removeContactTag(contactId, tag);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to remove tag';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Add a custom field to a contact
export const addContactCustomField = createAsyncThunk(
  'contacts/addContactCustomField',
  async ({ contactId, fieldData }, thunkAPI) => {
    try {
      return await contactService.addContactCustomField(contactId, fieldData);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to add custom field';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Remove a custom field from a contact
export const removeContactCustomField = createAsyncThunk(
'contacts/removeContactCustomField',
  async ({ contactId, key }, thunkAPI) => {
    try {
      return await contactService.removeContactCustomField(contactId, key);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to remove custom field';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Add a social link to a contact
export const addContactSocialLink = createAsyncThunk(
  'contacts/addContactSocialLink',
  async ({ contactId, socialLinkData }, thunkAPI) => {
    try {
      return await contactService.addContactSocialLink(contactId, socialLinkData);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to add social link';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Remove a social link from a contact
export const removeContactSocialLink = createAsyncThunk(
  'contacts/removeContactSocialLink',
  async ({ contactId, linkId }, thunkAPI) => {
    try {
      return await contactService.removeContactSocialLink(contactId, linkId);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to remove social link';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Update contact stage
export const updateContactStage = createAsyncThunk(
  'contacts/updateContactStage',
  async ({ contactId, stageData }, thunkAPI) => {
    try {
      return await contactService.updateContactStage(contactId, stageData);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to update stage';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Update contact lead score
export const updateContactLeadScore = createAsyncThunk(
  'contacts/updateContactLeadScore',
  async ({ contactId, scoreData }, thunkAPI) => {
    try {
      return await contactService.updateContactLeadScore(contactId, scoreData);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to update lead score';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get contact statistics for a project
export const getContactStats = createAsyncThunk(
  'contacts/getContactStats',
  async (projectId, thunkAPI) => {
    try {
      return await contactService.getContactStats(projectId);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch contact statistics';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get contact insights for a project
export const getContactInsights = createAsyncThunk(
'contacts/getContactInsights',
  async ({ projectId, params }, thunkAPI) => {
    try {
      return await contactService.getContactInsights(projectId, params);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch contact insights';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// CRM slice
const contactSlice = createSlice({
  name: 'contacts',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
    },
    clearContact: (state) => {
      state.contact = null;
    },
    clearContacts: (state) => {
      state.contacts = [];
      state.pagination = {
        total: 0,
        limit: 20,
        skip: 0,
        hasMore: false
      };
    },
    clearStats: (state) => {
      state.stats = null;
    },
    clearInsights: (state) => {
      state.insights = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Get project contacts
      .addCase(getProjectContacts.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getProjectContacts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        
        // If skip is 0, replace contacts; otherwise append
        if (action.meta.arg.params?.skip === 0 || !action.meta.arg.params?.skip) {
          state.contacts = action.payload.data.contacts;
        } else {
          state.contacts = [...state.contacts, ...action.payload.data.contacts];
        }
        
        state.pagination = action.payload.data.pagination;
      })
      .addCase(getProjectContacts.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Get company contacts
      .addCase(getCompanyContacts.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getCompanyContacts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        
        // If skip is 0, replace contacts; otherwise append
        if (action.meta.arg.params?.skip === 0 || !action.meta.arg.params?.skip) {
          state.contacts = action.payload.data.contacts;
        } else {
          state.contacts = [...state.contacts, ...action.payload.data.contacts];
        }
        
        state.pagination = action.payload.data.pagination;
      })
      .addCase(getCompanyContacts.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Get contact by ID
      .addCase(getContactById.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getContactById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.contact = action.payload.data.contact;
      })
      .addCase(getContactById.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Create contact
      .addCase(createContact.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createContact.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.contacts.unshift(action.payload.data.contact);
        state.pagination.total += 1;
      })
      .addCase(createContact.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Update contact
      .addCase(updateContact.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateContact.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.contact = action.payload.data.contact;
        
        // Update in the contacts list if present
        const index = state.contacts.findIndex(contact => contact._id === action.payload.data.contact._id);
        if (index !== -1) {
          state.contacts[index] = action.payload.data.contact;
        }
      })
      .addCase(updateContact.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Delete contact
      .addCase(deleteContact.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteContact.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.contacts = state.contacts.filter(contact => contact._id !== action.meta.arg);
        state.pagination.total -= 1;
        if (state.contact && state.contact._id === action.meta.arg) {
          state.contact = null;
        }
      })
      .addCase(deleteContact.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Add contact note
      .addCase(addContactNote.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(addContactNote.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.notes.unshift(action.payload.data.note);
      })
      .addCase(addContactNote.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Get contact notes
      .addCase(getContactNotes.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getContactNotes.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.notes = action.payload.data.notes;
      })
      .addCase(getContactNotes.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Add contact tag
      .addCase(addContactTag.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(addContactTag.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.contact = action.payload.data.contact;
        
        // Update in the contacts list if present
        const index = state.contacts.findIndex(contact => contact._id === action.payload.data.contact._id);
        if (index !== -1) {
          state.contacts[index] = action.payload.data.contact;
        }
      })
      .addCase(addContactTag.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Remove contact tag
      .addCase(removeContactTag.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(removeContactTag.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.contact = action.payload.data.contact;
        
        // Update in the contacts list if present
        const index = state.contacts.findIndex(contact => contact._id === action.payload.data.contact._id);
        if (index !== -1) {
          state.contacts[index] = action.payload.data.contact;
        }
      })
      .addCase(removeContactTag.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Add custom field
      .addCase(addContactCustomField.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(addContactCustomField.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.contact = action.payload.data.contact;
        
        // Update in the contacts list if present
        const index = state.contacts.findIndex(contact => contact._id === action.payload.data.contact._id);
        if (index !== -1) {
          state.contacts[index] = action.payload.data.contact;
        }
      })
      .addCase(addContactCustomField.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Remove custom field
      .addCase(removeContactCustomField.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(removeContactCustomField.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.contact = action.payload.data.contact;
        
        // Update in the contacts list if present
        const index = state.contacts.findIndex(contact => contact._id === action.payload.data.contact._id);
        if (index !== -1) {
          state.contacts[index] = action.payload.data.contact;
        }
      })
      .addCase(removeContactCustomField.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Add social link
      .addCase(addContactSocialLink.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(addContactSocialLink.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.contact = action.payload.data.contact;
        
        // Update in the contacts list if present
        const index = state.contacts.findIndex(contact => contact._id === action.payload.data.contact._id);
        if (index !== -1) {
          state.contacts[index] = action.payload.data.contact;
        }
      })
      .addCase(addContactSocialLink.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Remove social link
      .addCase(removeContactSocialLink.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(removeContactSocialLink.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.contact = action.payload.data.contact;
        
        // Update in the contacts list if present
        const index = state.contacts.findIndex(contact => contact._id === action.payload.data.contact._id);
        if (index !== -1) {
          state.contacts[index] = action.payload.data.contact;
        }
      })
      .addCase(removeContactSocialLink.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Update contact stage
      .addCase(updateContactStage.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateContactStage.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.contact = action.payload.data.contact;
        
        // Update in the contacts list if present
        const index = state.contacts.findIndex(contact => contact._id === action.payload.data.contact._id);
        if (index !== -1) {
          state.contacts[index] = action.payload.data.contact;
        }
      })
      .addCase(updateContactStage.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Update contact lead score
      .addCase(updateContactLeadScore.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateContactLeadScore.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.contact = action.payload.data.contact;
        
        // Update in the contacts list if present
        const index = state.contacts.findIndex(contact => contact._id === action.payload.data.contact._id);
        if (index !== -1) {
          state.contacts[index] = action.payload.data.contact;
        }
      })
      .addCase(updateContactLeadScore.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Get contact stats
      .addCase(getContactStats.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getContactStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.stats = action.payload.data;
      })
      .addCase(getContactStats.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Get contact insights
      .addCase(getContactInsights.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getContactInsights.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.insights = action.payload.data;
      })
      .addCase(getContactInsights.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  }
});

export const { reset, clearContact, clearContacts, clearStats, clearInsights } = contactSlice.actions;
export default contactSlice.reducer;