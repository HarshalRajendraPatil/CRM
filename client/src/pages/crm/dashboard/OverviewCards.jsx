import React from 'react';
import { 
  BuildingOfficeIcon, 
  UserGroupIcon, 
  CurrencyDollarIcon, 
  UserPlusIcon, 
  ClipboardDocumentListIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline';

const OverviewCards = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-8 bg-gray-200 rounded mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!data) return null;

  const cards = [
    {
      title: 'Companies',
      value: data.overview?.totalCompanies || 0,
      change: data.overview?.recentCompanies || 0,
      icon: BuildingOfficeIcon,
      color: 'blue',
      changeLabel: 'This period'
    },
    {
      title: 'Customers',
      value: data.overview?.totalCustomers || 0,
      change: data.overview?.recentCustomers || 0,
      icon: UserGroupIcon,
      color: 'green',
      changeLabel: 'This period'
    },
    {
      title: 'Deals',
      value: data.overview?.totalDeals || 0,
      change: data.overview?.recentDeals || 0,
      icon: CurrencyDollarIcon,
      color: 'purple',
      changeLabel: 'This period'
    },
    {
      title: 'Leads',
      value: data.overview?.totalLeads || 0,
      change: data.overview?.recentLeads || 0,
      icon: UserPlusIcon,
      color: 'orange',
      changeLabel: 'This period'
    },
    {
      title: 'Tasks',
      value: data.overview?.totalTasks || 0,
      change: data.overview?.recentTasks || 0,
      icon: ClipboardDocumentListIcon,
      color: 'indigo',
      changeLabel: 'This period'
    },
    {
      title: 'Events',
      value: data.overview?.totalEvents || 0,
      change: data.overview?.recentEvents || 0,
      icon: CalendarDaysIcon,
      color: 'pink',
      changeLabel: 'This period'
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: 'bg-blue-50 text-blue-600',
      green: 'bg-green-50 text-green-600',
      purple: 'bg-purple-50 text-purple-600',
      orange: 'bg-orange-50 text-orange-600',
      indigo: 'bg-indigo-50 text-indigo-600',
      pink: 'bg-pink-50 text-pink-600'
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div key={index} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">{card.title}</p>
                <p className="text-2xl font-bold text-gray-900">{card.value.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">
                  +{card.change} {card.changeLabel}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${getColorClasses(card.color)}`}>
                <Icon className="h-6 w-6" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default OverviewCards;
