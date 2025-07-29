import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';

const Pricing = () => {
  const [billingCycle, setBillingCycle] = useState('yearly'); // 'monthly' or 'yearly'
  
  const plans = [
    {
      name: 'Starter',
      description: 'Perfect for small businesses or individuals just getting started with CRM.',
      monthlyPrice: 19,
      yearlyPrice: 190, // 2 months free
      features: [
        '1 CRM instance',
        'Up to 1,000 contacts',
        'Basic contact management',
        'Email integration',
        'Mobile app access',
        'Standard support',
      ],
      cta: 'Start Free Trial',
      highlight: false,
    },
    {
      name: 'Professional',
      description: 'Ideal for growing businesses that need multiple CRM instances and advanced features.',
      monthlyPrice: 49,
      yearlyPrice: 490, // 2 months free
      features: [
        'Up to 3 CRM instances',
        'Up to 10,000 contacts',
        'Advanced contact management',
        'Sales pipeline management',
        'Task & project management',
        'Basic automation',
        'Standard reporting',
        'Priority support',
      ],
      cta: 'Start Free Trial',
      highlight: true,
    },
    {
      name: 'Enterprise',
      description: 'For organizations requiring unlimited CRM instances and enterprise-grade features.',
      monthlyPrice: 99,
      yearlyPrice: 990, // 2 months free
      features: [
        'Unlimited CRM instances',
        'Unlimited contacts',
        'Advanced contact management',
        'Sales pipeline management',
        'Task & project management',
        'Advanced automation',
        'Custom reporting',
        'API access',
        'Dedicated account manager',
        'SSO & advanced security',
      ],
      cta: 'Contact Sales',
      highlight: false,
    },
  ];

  const featureComparison = [
    {
      category: 'Core Features',
      features: [
        {
          name: 'CRM Instances',
          starter: '1',
          professional: 'Up to 3',
          enterprise: 'Unlimited',
        },
        {
          name: 'Contacts',
          starter: 'Up to 1,000',
          professional: 'Up to 10,000',
          enterprise: 'Unlimited',
        },
        {
          name: 'Users',
          starter: 'Up to 3',
          professional: 'Up to 10',
          enterprise: 'Unlimited',
        },
        {
          name: 'Storage',
          starter: '5 GB',
          professional: '25 GB',
          enterprise: '100 GB',
        },
      ],
    },
    {
      category: 'Contact Management',
      features: [
        {
          name: 'Basic Contact Fields',
          starter: true,
          professional: true,
          enterprise: true,
        },
        {
          name: 'Custom Fields',
          starter: '5',
          professional: '20',
          enterprise: 'Unlimited',
        },
        {
          name: 'Contact Segmentation',
          starter: 'Basic',
          professional: 'Advanced',
          enterprise: 'Advanced',
        },
        {
          name: 'Activity Tracking',
          starter: 'Basic',
          professional: 'Advanced',
          enterprise: 'Advanced',
        },
      ],
    },
    {
      category: 'Sales Tools',
      features: [
        {
          name: 'Sales Pipeline',
          starter: 'Basic',
          professional: 'Advanced',
          enterprise: 'Advanced',
        },
        {
          name: 'Custom Deal Stages',
          starter: false,
          professional: true,
          enterprise: true,
        },
        {
          name: 'Sales Forecasting',
          starter: false,
          professional: 'Basic',
          enterprise: 'Advanced',
        },
        {
          name: 'Quote Generation',
          starter: false,
          professional: true,
          enterprise: true,
        },
      ],
    },
    {
      category: 'Automation',
      features: [
        {
          name: 'Email Sequences',
          starter: false,
          professional: 'Basic',
          enterprise: 'Advanced',
        },
        {
          name: 'Workflow Automation',
          starter: false,
          professional: '5 workflows',
          enterprise: 'Unlimited',
        },
        {
          name: 'Lead Scoring',
          starter: false,
          professional: 'Basic',
          enterprise: 'Advanced',
        },
        {
          name: 'Automated Reports',
          starter: false,
          professional: true,
          enterprise: true,
        },
      ],
    },
    {
      category: 'Support',
      features: [
        {
          name: 'Support Channels',
          starter: 'Email',
          professional: 'Email & Chat',
          enterprise: 'Email, Chat & Phone',
        },
        {
          name: 'Response Time',
          starter: '24 hours',
          professional: '8 hours',
          enterprise: '2 hours',
        },
        {
          name: 'Dedicated Account Manager',
          starter: false,
          professional: false,
          enterprise: true,
        },
        {
          name: 'Training Sessions',
          starter: false,
          professional: '1 session',
          enterprise: 'Unlimited',
        },
      ],
    },
  ];

  const renderFeatureValue = (value) => {
    if (typeof value === 'boolean') {
      return value ? (
        <svg className="h-5 w-5 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
        </svg>
      ) : (
        <svg className="h-5 w-5 text-gray-300 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      );
    }
    return value;
  };

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Simple, Transparent Pricing</h1>
          <p className="text-xl md:text-2xl text-indigo-100 max-w-3xl mx-auto">
            Choose the plan that's right for your business. All plans include a 14-day free trial.
          </p>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Billing Toggle */}
          <div className="flex justify-center mb-12">
            <div className="bg-gray-100 p-1 rounded-lg inline-flex">
              <button
                className={`px-4 py-2 rounded-md ${
                  billingCycle === 'monthly'
                    ? 'bg-white shadow-sm text-indigo-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setBillingCycle('monthly')}
              >
                Monthly
              </button>
              <button
                className={`px-4 py-2 rounded-md ${
                  billingCycle === 'yearly'
                    ? 'bg-white shadow-sm text-indigo-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setBillingCycle('yearly')}
              >
                Yearly <span className="text-green-500 text-xs font-medium">Save 20%</span>
              </button>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <div 
                key={index} 
                className={`bg-white rounded-lg overflow-hidden ${
                  plan.highlight 
                    ? 'ring-2 ring-indigo-600 shadow-xl' 
                    : 'border border-gray-200 shadow-md'
                }`}
              >
                {plan.highlight && (
                  <div className="bg-indigo-600 text-white text-center py-2 text-sm font-medium">
                    Most Popular
                  </div>
                )}
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
                  <p className="mt-2 text-gray-600 h-12">{plan.description}</p>
                  <div className="mt-6">
                    <p className="text-4xl font-bold text-gray-900">
                      ${billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice}
                      <span className="text-lg text-gray-500 font-normal">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                    </p>
                    {billingCycle === 'yearly' && (
                      <p className="mt-1 text-sm text-green-600">Save ${plan.monthlyPrice * 2} per year</p>
                    )}
                  </div>
                  <ul className="mt-6 space-y-4">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start">
                        <svg className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        <span className="text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-8">
                    <Link
                      to={plan.cta === 'Contact Sales' ? '/contact' : '/register'}
                      className={`block w-full px-4 py-3 text-center rounded-md font-medium ${
                        plan.highlight
                          ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                          : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                      }`}
                    >
                      {plan.cta}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Comparison */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Compare Plans</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              A detailed comparison of features available in each plan.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 divide-y divide-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Feature</th>
                  <th className="px-6 py-4 text-center text-sm font-medium text-gray-500 uppercase tracking-wider">Starter</th>
                  <th className="px-6 py-4 text-center text-sm font-medium text-indigo-600 uppercase tracking-wider">Professional</th>
                  <th className="px-6 py-4 text-center text-sm font-medium text-gray-500 uppercase tracking-wider">Enterprise</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {featureComparison.map((category, categoryIndex) => (
                  <React.Fragment key={categoryIndex}>
                    <tr className="bg-gray-50">
                      <td colSpan="4" className="px-6 py-4 text-sm font-medium text-gray-900">
                        {category.category}
                      </td>
                    </tr>
                    {category.features.map((feature, featureIndex) => (
                      <tr key={featureIndex} className={featureIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {feature.name}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700 text-center">
                          {renderFeatureValue(feature.starter)}
                        </td>
                        <td className="px-6 py-4 text-sm text-indigo-700 font-medium text-center bg-indigo-50">
                          {renderFeatureValue(feature.professional)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700 text-center">
                          {renderFeatureValue(feature.enterprise)}
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Find answers to common questions about our pricing and plans.
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-6">
            {[
              {
                question: 'Can I switch plans later?',
                answer: "Yes, you can upgrade or downgrade your plan at any time. When upgrading, you'll be charged the prorated difference. When downgrading, the new rate will apply at the start of your next billing cycle.",
              },
              {
                question: 'Is there a free trial?',
                answer: 'Yes, all plans come with a 14-day free trial. No credit card is required to start your trial.',
              },
              {
                question: 'What happens when I reach my contact limit?',
                answer: "You'll receive a notification when you're approaching your contact limit. You can upgrade to a higher plan to increase your limit or remove unused contacts.",
              },
              {
                question: 'Can I cancel my subscription anytime?',
                answer: "Yes, you can cancel your subscription at any time. You'll continue to have access to your plan until the end of your current billing period.",
              },
              {
                question: 'Do you offer discounts for nonprofits or educational institutions?',
                answer: 'Yes, we offer special pricing for nonprofits, educational institutions, and startups. Please contact our sales team for more information.',
              },
            ].map((faq, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{faq.question}</h3>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-indigo-100 mb-8 max-w-3xl mx-auto">
            Start your 14-day free trial today. No credit card required.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link to="/register" className="px-8 py-4 bg-white text-indigo-700 font-medium rounded-md shadow-md hover:bg-indigo-50 transition-colors duration-300">
              Start Free Trial
            </Link>
            <Link to="/contact" className="px-8 py-4 border border-white text-white font-medium rounded-md hover:bg-white hover:bg-opacity-10 transition-colors duration-300">
              Contact Sales
            </Link>
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default Pricing; 