import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import userReducer from './userSlice';
import projectReducer from './projectSlice';
import invitationReducer from './invitationSlice';
import notificationReducer from './notificationSlice';
import companyReducer from './companySlice';
import leadReducer from './leadSlice';
import customerReducer from './customerSlice';
import dealReducer from './dealSlice';
import taskReducer from './taskSlice';
import calendarReducer from './calendarSlice';
import dashboardReducer from './dashboardSlice';
import settingsReducer from './settingsSlice';
import systemAdminReducer from './systemAdminSlice';
import activityReducer from './activitySlice';
import invoiceReducer from './invoiceSlice';
import paymentReducer from './paymentSlice';
import receiptReducer from './receiptSlice';
import financialReducer from './financialSlice';

// Configure store with reducers
const store = configureStore({
  reducer: {
    auth: authReducer,
    users: userReducer,
    projects: projectReducer,
    invitations: invitationReducer,
    notifications: notificationReducer,
    companies: companyReducer,
    leads: leadReducer,
    customers: customerReducer,
    deals: dealReducer,
    tasks: taskReducer,
    calendar: calendarReducer,
    dashboard: dashboardReducer,
    settings: settingsReducer,
    systemAdmin: systemAdminReducer,
    activity: activityReducer,
    invoices: invoiceReducer,
    payments: paymentReducer,
    receipts: receiptReducer,
    financial: financialReducer,
  },
  devTools: import.meta.env.DEV, // Enable Redux DevTools only in development
});

export default store;