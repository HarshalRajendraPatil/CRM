import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import DashboardLayout from '../layouts/DashboardLayout';

const Dashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [timeframe, setTimeframe] = useState('month'); // week, month, quarter, year

  // Mock data for dashboard
  const stats = [
    {
      title: 'Total Leads',
      value: '3,721',
      change: '+5.2%',
      isPositive: true,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
        </svg>
      ),
    },
    {
      title: 'Deals Won',
      value: '284',
      change: '+3.1%',
      isPositive: true,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      ),
    },
    {
      title: 'Revenue',
      value: '$428,651',
      change: '+8.7%',
      isPositive: true,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      ),
    },
    {
      title: 'Conversion Rate',
      value: '7.6%',
      change: '-0.4%',
      isPositive: false,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
        </svg>
      ),
    },
  ];

  const recentDeals = [
    {
      id: 1,
      name: 'Enterprise Software Solution',
      company: 'Acme Corporation',
      value: '$125,000',
      stage: 'Won',
      stageColor: 'bg-green-100 text-green-800',
      date: '2023-10-15',
    },
    {
      id: 2,
      name: 'CRM Implementation',
      company: 'TechGiant Inc.',
      value: '$85,000',
      stage: 'Negotiation',
      stageColor: 'bg-yellow-100 text-yellow-800',
      date: '2023-10-12',
    },
    {
      id: 3,
      name: 'Cloud Migration Services',
      company: 'Global Enterprises',
      value: '$210,000',
      stage: 'Proposal',
      stageColor: 'bg-blue-100 text-blue-800',
      date: '2023-10-08',
    },
    {
      id: 4,
      name: 'Security Assessment',
      company: 'Secure Systems Ltd.',
      value: '$45,000',
      stage: 'Demo',
      stageColor: 'bg-purple-100 text-purple-800',
      date: '2023-10-05',
    },
    {
      id: 5,
      name: 'Mobile App Development',
      company: 'InnoTech Startups',
      value: '$78,000',
      stage: 'Won',
      stageColor: 'bg-green-100 text-green-800',
      date: '2023-10-01',
    },
  ];

  const upcomingTasks = [
    {
      id: 1,
      title: 'Call with TechGiant Inc.',
      dueDate: 'Today, 2:30 PM',
      priority: 'High',
      priorityColor: 'bg-red-100 text-red-800',
    },
    {
      id: 2,
      title: 'Prepare proposal for Global Enterprises',
      dueDate: 'Tomorrow, 10:00 AM',
      priority: 'Medium',
      priorityColor: 'bg-yellow-100 text-yellow-800',
    },
    {
      id: 3,
      title: 'Follow up with InnoTech Startups',
      dueDate: 'Oct 20, 2023',
      priority: 'Low',
      priorityColor: 'bg-green-100 text-green-800',
    },
    {
      id: 4,
      title: 'Team meeting - Sales strategy',
      dueDate: 'Oct 21, 2023',
      priority: 'Medium',
      priorityColor: 'bg-yellow-100 text-yellow-800',
    },
  ];

  return (
    <DashboardLayout>
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-600">
          Welcome back, {user?.name || 'User'}! Here's what's happening with your CRM today.
        </p>
      </div>

      {/* Time frame selector */}
      <div className="mt-6 flex justify-end">
        <div className="inline-flex shadow-sm rounded-md">
          <button
            type="button"
            onClick={() => setTimeframe('week')}
            className={`px-4 py-2 text-sm font-medium rounded-l-md ${
              timeframe === 'week'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            } border border-gray-300`}
          >
            Week
          </button>
          <button
            type="button"
            onClick={() => setTimeframe('month')}
            className={`px-4 py-2 text-sm font-medium ${
              timeframe === 'month'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            } border-t border-b border-gray-300`}
          >
            Month
          </button>
          <button
            type="button"
            onClick={() => setTimeframe('quarter')}
            className={`px-4 py-2 text-sm font-medium ${
              timeframe === 'quarter'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            } border-t border-b border-gray-300`}
          >
            Quarter
          </button>
          <button
            type="button"
            onClick={() => setTimeframe('year')}
            className={`px-4 py-2 text-sm font-medium rounded-r-md ${
              timeframe === 'year'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            } border border-gray-300`}
          >
            Year
          </button>
        </div>
      </div>

      {/* Stats cards */}
      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`p-3 rounded-md ${stat.isPositive ? 'bg-green-500' : 'bg-red-500'} bg-opacity-10`}>
                    <div className={`${stat.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                      {stat.icon}
                    </div>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">{stat.title}</dt>
                    <dd>
                      <div className="text-lg font-semibold text-gray-900">{stat.value}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <span className={`font-medium ${stat.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  {stat.change}
                </span>{' '}
                <span className="text-gray-500">from previous {timeframe}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts and tables section */}
      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Sales Pipeline Chart */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Sales Pipeline</h3>
            <div className="mt-2">
              <p className="text-sm text-gray-500">Current distribution of deals across stages</p>
            </div>
            <div className="mt-6 h-64 flex items-end space-x-2">
              <div className="flex-1 bg-indigo-50 rounded-t-md relative" style={{ height: '40%' }}>
                <div className="absolute bottom-0 inset-x-0 h-full bg-indigo-500 opacity-75 rounded-t-md" style={{ height: '100%' }}></div>
                <div className="absolute bottom-0 inset-x-0 text-xs font-medium text-center py-1 text-white">New</div>
              </div>
              <div className="flex-1 bg-indigo-50 rounded-t-md relative" style={{ height: '60%' }}>
                <div className="absolute bottom-0 inset-x-0 h-full bg-indigo-500 opacity-75 rounded-t-md" style={{ height: '100%' }}></div>
                <div className="absolute bottom-0 inset-x-0 text-xs font-medium text-center py-1 text-white">Contacted</div>
              </div>
              <div className="flex-1 bg-indigo-50 rounded-t-md relative" style={{ height: '75%' }}>
                <div className="absolute bottom-0 inset-x-0 h-full bg-indigo-500 opacity-75 rounded-t-md" style={{ height: '100%' }}></div>
                <div className="absolute bottom-0 inset-x-0 text-xs font-medium text-center py-1 text-white">Qualified</div>
              </div>
              <div className="flex-1 bg-indigo-50 rounded-t-md relative" style={{ height: '50%' }}>
                <div className="absolute bottom-0 inset-x-0 h-full bg-indigo-500 opacity-75 rounded-t-md" style={{ height: '100%' }}></div>
                <div className="absolute bottom-0 inset-x-0 text-xs font-medium text-center py-1 text-white">Demo</div>
              </div>
              <div className="flex-1 bg-indigo-50 rounded-t-md relative" style={{ height: '35%' }}>
                <div className="absolute bottom-0 inset-x-0 h-full bg-indigo-500 opacity-75 rounded-t-md" style={{ height: '100%' }}></div>
                <div className="absolute bottom-0 inset-x-0 text-xs font-medium text-center py-1 text-white">Proposal</div>
              </div>
              <div className="flex-1 bg-indigo-50 rounded-t-md relative" style={{ height: '25%' }}>
                <div className="absolute bottom-0 inset-x-0 h-full bg-indigo-500 opacity-75 rounded-t-md" style={{ height: '100%' }}></div>
                <div className="absolute bottom-0 inset-x-0 text-xs font-medium text-center py-1 text-white">Negotiation</div>
              </div>
              <div className="flex-1 bg-indigo-50 rounded-t-md relative" style={{ height: '30%' }}>
                <div className="absolute bottom-0 inset-x-0 h-full bg-green-500 opacity-75 rounded-t-md" style={{ height: '100%' }}></div>
                <div className="absolute bottom-0 inset-x-0 text-xs font-medium text-center py-1 text-white">Won</div>
              </div>
              <div className="flex-1 bg-indigo-50 rounded-t-md relative" style={{ height: '15%' }}>
                <div className="absolute bottom-0 inset-x-0 h-full bg-red-500 opacity-75 rounded-t-md" style={{ height: '100%' }}></div>
                <div className="absolute bottom-0 inset-x-0 text-xs font-medium text-center py-1 text-white">Lost</div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Deals */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Deals</h3>
            <div className="mt-2">
              <p className="text-sm text-gray-500">Latest deals updated in your CRM</p>
            </div>
            <div className="mt-6 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deal</th>
                      <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                      <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stage</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentDeals.map((deal) => (
                      <tr key={deal.id}>
                        <td className="px-3 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{deal.name}</div>
                          <div className="text-sm text-gray-500">{deal.company}</div>
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{deal.value}</div>
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${deal.stageColor}`}>
                            {deal.stage}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Tasks */}
      <div className="mt-8 bg-white shadow rounded-lg">
        <div className="px-6 py-5 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Upcoming Tasks</h3>
        </div>
        <ul className="divide-y divide-gray-200">
          {upcomingTasks.map((task) => (
            <li key={task.id} className="px-6 py-4">
              <div className="flex items-center">
                <input
                  id={`task-${task.id}`}
                  name={`task-${task.id}`}
                  type="checkbox"
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor={`task-${task.id}`} className="ml-3 block">
                  <span className="text-sm font-medium text-gray-900">{task.title}</span>
                  <div className="flex mt-1">
                    <span className="text-xs text-gray-500 mr-3">
                      <svg className="inline-block h-3 w-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                      </svg>
                      {task.dueDate}
                    </span>
                    <span className={`text-xs px-2 inline-flex items-center rounded-full ${task.priorityColor}`}>
                      {task.priority}
                    </span>
                  </div>
                </label>
                <div className="ml-auto">
                  <button
                    type="button"
                    className="inline-flex items-center p-1 border border-transparent rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"></path>
                    </svg>
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
        <div className="px-6 py-3 bg-gray-50 text-right">
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none"
          >
            <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            Add New Task
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard; 