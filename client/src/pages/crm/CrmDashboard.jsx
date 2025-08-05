import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import CrmLayout from '../../layouts/CrmLayout';
import { getProjectById } from '../../store/projectSlice';
import { getProjectPipelines } from '../../store/projectSlice';
import Alert from '../../components/ui/Alert';
import CompanyOverviewCard from './components/CompanyOverviewCard';

// Stats card component
const StatCard = ({ title, value, icon, change, changeType }) => {
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className={`p-3 rounded-md ${
              changeType === 'increase' ? 'bg-green-100' : 
              changeType === 'decrease' ? 'bg-red-100' : 'bg-blue-100'
            }`}>
              {icon}
            </div>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd>
                <div className="text-lg font-medium text-gray-900">{value}</div>
              </dd>
            </dl>
          </div>
        </div>
      </div>
      {change && (
        <div className="bg-gray-50 px-5 py-3">
          <div className="text-sm">
            <span className={`font-medium ${
              changeType === 'increase' ? 'text-green-600' : 
              changeType === 'decrease' ? 'text-red-600' : 'text-blue-600'
            } hover:text-green-900`}>
              {changeType === 'increase' ? '↑' : changeType === 'decrease' ? '↓' : '•'} {change}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

// Activity item component
const ActivityItem = ({ type, title, description, time, user }) => {
  const getTypeIcon = () => {
    switch (type) {
      case 'deal':
        return (
          <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
            <svg className="h-5 w-5 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      case 'contact':
        return (
          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
            <svg className="h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        );
      case 'task':
        return (
          <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
            <svg className="h-5 w-5 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
        );
      case 'pipeline':
        return (
          <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
            <svg className="h-5 w-5 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
            <svg className="h-5 w-5 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
    }
  };

  return (
    <div className="relative pb-8">
      <div className="relative flex space-x-3">
        <div>
          {getTypeIcon()}
        </div>
        <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
          <div>
            <p className="text-sm text-gray-800">{title}</p>
            {description && (
              <p className="mt-1 text-sm text-gray-500">{description}</p>
            )}
          </div>
          <div className="text-right text-sm whitespace-nowrap text-gray-500">
            <time dateTime={time}>{time}</time>
            {user && (
              <div className="mt-1 text-xs text-gray-400">{user}</div>
            )}
          </div>
        </div>
      </div>
      <div className="absolute left-4 top-8 -ml-px h-full w-0.5 bg-gray-200"></div>
    </div>
  );
};

// Pipeline summary component
const PipelineSummary = ({ pipeline }) => {
  const totalStages = pipeline.stages?.length || 0;
  const stagesWithDeals = pipeline.stages?.filter(stage => stage.dealsCount > 0).length || 0;
  const totalDeals = pipeline.stages?.reduce((sum, stage) => sum + (stage.dealsCount || 0), 0) || 0;
  const totalValue = pipeline.stages?.reduce((sum, stage) => sum + (stage.value || 0), 0) || 0;

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <h3 className="text-lg leading-6 font-medium text-gray-900">{pipeline.name}</h3>
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-indigo-100 text-indigo-800">
          {totalDeals} deals
        </span>
      </div>
      <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
        <dl className="sm:divide-y sm:divide-gray-200">
          <div className="py-3 sm:py-5 sm:grid sm:grid-cols-2 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Total Value</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0">${totalValue.toLocaleString()}</dd>
          </div>
          <div className="py-3 sm:py-5 sm:grid sm:grid-cols-2 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Stages</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0">{totalStages}</dd>
          </div>
          <div className="py-3 sm:py-5 sm:grid sm:grid-cols-2 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Active Stages</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0">{stagesWithDeals}</dd>
          </div>
        </dl>
      </div>
      <div className="bg-gray-50 px-4 py-4 sm:px-6">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Last updated: {new Date(pipeline.updatedAt).toLocaleDateString()}
          </div>
          <div>
            <span className="inline-flex rounded-md shadow-sm">
              <button type="button" className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                View Pipeline
              </button>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main CRM Dashboard component
const CrmDashboard = () => {
  const { projectId } = useParams();
  const dispatch = useDispatch();
  const { currentProject, pipelines, isLoading, isError, message } = useSelector((state) => state.projects);
  const [recentActivities, setRecentActivities] = useState([]);
  
  // Fetch project and pipelines data
  useEffect(() => {
    if (projectId) {
      dispatch(getProjectById(projectId));
      dispatch(getProjectPipelines(projectId));
      
      // Mock recent activities data (replace with API call in production)
      setRecentActivities([
        {
          id: 1,
          type: 'deal',
          title: 'New deal created: Enterprise Software License',
          description: 'Value: $25,000',
          time: '2 hours ago',
          user: 'Jane Smith'
        },
        {
          id: 2,
          type: 'contact',
          title: 'New contact added: John Doe',
          description: 'Company: Acme Inc.',
          time: '4 hours ago',
          user: 'Mike Johnson'
        },
        {
          id: 3,
          type: 'task',
          title: 'Task completed: Follow up with client',
          time: 'Yesterday',
          user: 'Jane Smith'
        },
        {
          id: 4,
          type: 'pipeline',
          title: 'Deal moved to "Negotiation" stage',
          description: 'Deal: Cloud Migration Project',
          time: '2 days ago',
          user: 'Mike Johnson'
        }
      ]);
    }
  }, [dispatch, projectId]);

  if (isLoading) {
    return (
      <CrmLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      </CrmLayout>
    );
  }

  return (
    <CrmLayout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
              <p className="mt-1 text-sm text-gray-500">
                Overview of your CRM project: {currentProject?.name}
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <span className="inline-flex rounded-md shadow-sm">
                <button type="button" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                  <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add New Deal
                </button>
              </span>
            </div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          {isError && <Alert variant="danger" message={message} className="mt-6" />}
          
          {/* Stats overview */}
          <div className="mt-8">
            <h2 className="text-lg leading-6 font-medium text-gray-900 mb-4">Overview</h2>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard 
                title="Total Deals" 
                value="12" 
                icon={
                  <svg className="h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
                change="2 new this month"
                changeType="increase"
              />
              <StatCard 
                title="Total Contacts" 
                value="48" 
                icon={
                  <svg className="h-6 w-6 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                }
                change="5 new this month"
                changeType="increase"
              />
              <StatCard 
                title="Pipeline Value" 
                value="$125,000" 
                icon={
                  <svg className="h-6 w-6 text-yellow-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
                change="15% increase"
                changeType="increase"
              />
              <StatCard 
                title="Tasks Due" 
                value="8" 
                icon={
                  <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
                change="3 due today"
                changeType="warning"
              />
            </div>
          </div>
          
          {/* Company Overview */}
          <div className="mt-8">
            <h2 className="text-lg leading-6 font-medium text-gray-900 mb-4">Company Management</h2>
            <CompanyOverviewCard projectId={projectId} />
          </div>

          {/* Main content area */}
          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Pipelines summary */}
            <div className="lg:col-span-2">
              <h2 className="text-lg leading-6 font-medium text-gray-900 mb-4">Pipelines</h2>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                {pipelines && pipelines.length > 0 ? (
                  pipelines.slice(0, 2).map((pipeline) => (
                    <PipelineSummary key={pipeline._id} pipeline={pipeline} />
                  ))
                ) : (
                  <div className="sm:col-span-2 bg-white shadow rounded-lg p-6 text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No pipelines</h3>
                    <p className="mt-1 text-sm text-gray-500">Get started by creating a new pipeline.</p>
                    <div className="mt-6">
                      <button type="button" className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                        <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Create Pipeline
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Recent activity */}
            <div>
              <h2 className="text-lg leading-6 font-medium text-gray-900 mb-4">Recent Activity</h2>
              <div className="bg-white shadow rounded-lg p-6">
                <div className="flow-root">
                  <ul className="-mb-8">
                    {recentActivities.map((activity, activityIdx) => (
                      <li key={activity.id}>
                        <ActivityItem 
                          type={activity.type}
                          title={activity.title}
                          description={activity.description}
                          time={activity.time}
                          user={activity.user}
                        />
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-6 text-center">
                  <button type="button" className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    View all activity
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Project info */}
          <div className="mt-8">
            <h2 className="text-lg leading-6 font-medium text-gray-900 mb-4">Project Details</h2>
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  {currentProject?.name}
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Project details and information.
                </p>
              </div>
              <div className="border-t border-gray-200">
                <dl>
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Project name</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{currentProject?.name}</dd>
                  </div>
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Description</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {currentProject?.description || 'No description provided.'}
                    </dd>
                  </div>
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Owner</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {currentProject?.owner?.name || 'Unknown'}
                    </dd>
                  </div>
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Members</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {currentProject?.members?.length || 0} team members
                    </dd>
                  </div>
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Created</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {currentProject?.createdAt ? new Date(currentProject.createdAt).toLocaleString() : 'Unknown'}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
    </CrmLayout>
  );
};

export default CrmDashboard;