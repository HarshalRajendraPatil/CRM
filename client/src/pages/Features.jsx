import React from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';

const Features = () => {
  const features = [
    {
      title: 'Multi-Tenant Architecture',
      description: 'Create and manage multiple independent CRM instances from a single platform. Perfect for agencies, multi-brand businesses, or organizations with distinct departments.',
      icon: (
        <svg className="h-10 w-10 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
        </svg>
      ),
      details: [
        'Complete data isolation between CRM instances',
        'Unified admin dashboard for managing all instances',
        'Seamless switching between different CRM environments',
        'Custom branding and domain options for each instance'
      ]
    },
    {
      title: 'Advanced Contact Management',
      description: 'Comprehensive contact management with powerful segmentation, tagging, and relationship mapping to keep your customer data organized and actionable.',
      icon: (
        <svg className="h-10 w-10 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
        </svg>
      ),
      details: [
        'Custom fields and properties for contacts',
        'Advanced filtering and segmentation',
        'Contact activity tracking and history',
        'Relationship mapping between contacts and organizations'
      ]
    },
    {
      title: 'Sales Pipeline Management',
      description: 'Visualize and manage your sales process with customizable pipelines. Track deals from lead to close with powerful analytics and forecasting tools.',
      icon: (
        <svg className="h-10 w-10 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
        </svg>
      ),
      details: [
        'Customizable deal stages and pipelines',
        'Drag-and-drop deal management',
        'Probability-based forecasting',
        'Sales analytics and performance tracking'
      ]
    },
    {
      title: 'Task & Project Management',
      description: 'Keep your team organized with integrated task and project management. Assign tasks, set deadlines, and track progress all within your CRM.',
      icon: (
        <svg className="h-10 w-10 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
        </svg>
      ),
      details: [
        'Task assignment and tracking',
        'Project timelines and milestones',
        'Calendar integration',
        'Automated task reminders and notifications'
      ]
    },
    {
      title: 'Powerful Automation',
      description: 'Streamline your workflows with powerful automation tools. Set up triggers and actions to automate repetitive tasks and ensure consistent processes.',
      icon: (
        <svg className="h-10 w-10 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
        </svg>
      ),
      details: [
        'Workflow automation with triggers and actions',
        'Email sequence automation',
        'Lead scoring and routing',
        'Automated data entry and enrichment'
      ]
    },
    {
      title: 'Comprehensive Reporting',
      description: 'Gain insights into your business with customizable reports and dashboards. Track key metrics and make data-driven decisions.',
      icon: (
        <svg className="h-10 w-10 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
        </svg>
      ),
      details: [
        'Customizable dashboards and reports',
        'Real-time performance metrics',
        'Cross-CRM instance reporting',
        'Export and sharing options'
      ]
    },
  ];

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Powerful Features for Modern Businesses</h1>
          <p className="text-xl md:text-2xl text-indigo-100 max-w-3xl mx-auto">
            Our CRM platform combines powerful features with unmatched flexibility to help you build stronger customer relationships.
          </p>
        </div>
      </section>

      {/* Features Overview */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Key Features</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our platform offers a comprehensive suite of features designed to help you manage customer relationships more effectively.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                <div className="p-3 bg-indigo-100 rounded-full inline-block mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 mb-4">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Detailed Feature Sections */}
      {features.map((feature, index) => (
        <section 
          key={index} 
          className={`py-16 ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}
          id={feature.title.toLowerCase().replace(/\s+/g, '-')}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${index % 2 === 0 ? '' : 'lg:flex-row-reverse'}`}>
              <div className={index % 2 === 0 ? 'lg:order-1' : 'lg:order-2'}>
                <div className="p-3 bg-indigo-100 rounded-full inline-block mb-4">
                  {feature.icon}
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">{feature.title}</h2>
                <p className="text-lg text-gray-600 mb-6">{feature.description}</p>
                <ul className="space-y-2">
                  {feature.details.map((detail, detailIndex) => (
                    <li key={detailIndex} className="flex items-start">
                      <svg className="h-6 w-6 text-indigo-600 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span className="text-gray-700">{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className={`relative ${index % 2 === 0 ? 'lg:order-2' : 'lg:order-1'}`}>
                <div className="absolute -top-10 -left-10 w-40 h-40 bg-indigo-100 rounded-full opacity-50"></div>
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-purple-100 rounded-full opacity-50"></div>
                <img 
                  src={`https://source.unsplash.com/random/800x600?crm,${feature.title.toLowerCase().replace(/\s+/g, ',')}`} 
                  alt={feature.title} 
                  className="rounded-lg shadow-xl relative z-10"
                />
              </div>
            </div>
          </div>
        </section>
      ))}

      {/* Integration Section */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Seamless Integrations</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our platform integrates with your favorite tools to create a unified workflow.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 items-center justify-items-center">
            {['Google', 'Microsoft', 'Slack', 'Zoom', 'HubSpot', 'Mailchimp', 'Zapier', 'Salesforce', 'QuickBooks', 'Shopify', 'Stripe', 'PayPal'].map((integration) => (
              <div key={integration} className="bg-white p-4 rounded-lg shadow-md w-full h-24 flex items-center justify-center">
                <span className="text-gray-700 font-medium">{integration}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Experience These Features?
          </h2>
          <p className="text-xl text-indigo-100 mb-8 max-w-3xl mx-auto">
            Start your free trial today and discover how our CRM platform can transform your business.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link to="/register" className="px-8 py-4 bg-white text-indigo-700 font-medium rounded-md shadow-md hover:bg-indigo-50 transition-colors duration-300">
              Start Free Trial
            </Link>
            <Link to="/contact" className="px-8 py-4 border border-white text-white font-medium rounded-md hover:bg-white hover:bg-opacity-10 transition-colors duration-300">
              Request Demo
            </Link>
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default Features; 