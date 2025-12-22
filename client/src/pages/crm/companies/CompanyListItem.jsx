import React from "react";
import { Link } from "react-router-dom";
import { Menu, Transition } from "@headlessui/react";
import { Fragment } from "react";
import useProjectAccess from "../../../hooks/useProjectAccess";

const CompanyListItem = ({ company, projectId, isSelected, onSelect }) => {
  // Get status color based on company status
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

  const { hasSalesExecutiveAccess } = useProjectAccess(projectId);
  return (
    <tr>
      <td className="px-6 py-4 whitespace-nowrap">
        <input
          type="checkbox"
          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          checked={isSelected}
          onChange={() => onSelect(company._id)}
        />
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10">
            {company.logo ? (
              <img
                className="h-10 w-10 rounded-md object-cover"
                src={company.logo}
                alt={company.name}
              />
            ) : (
              <div className="h-10 w-10 rounded-md bg-indigo-100 flex items-center justify-center">
                <span className="text-indigo-700 font-medium text-lg">
                  {company.name.charAt(0)}
                </span>
              </div>
            )}
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">
              <Link
                to={`/crm/${projectId}/companies/${company._id}`}
                className="hover:text-indigo-600"
              >
                {company.name.length > 20
                  ? company.name.slice(0, 20) + "..."
                  : company.name}
              </Link>
            </div>
            {company.website && (
              <div className="text-sm text-gray-500">
                <a
                  href={
                    company.website.startsWith("http")
                      ? company.website
                      : `https://${company.website}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-indigo-600"
                >
                  {company.website
                    .replace(/^https?:\/\//, "")
                    .replace(/\/$/, "")}
                </a>
              </div>
            )}
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{company.industry || "-"}</div>
        {company.size && (
          <div className="text-sm text-gray-500">{company.size}</div>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">
          {company.email ? (
            <a
              href={`mailto:${company.email}`}
              className="hover:text-indigo-600"
            >
              {company.email}
            </a>
          ) : (
            "-"
          )}
        </div>
        <div className="text-sm text-gray-500">
          {company.phone ? (
            <a href={`tel:${company.phone}`} className="hover:text-indigo-600">
              {company.phone}
            </a>
          ) : (
            ""
          )}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span
          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
            company.status
          )}`}
        >
          {company.status || "Unknown"}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-blue-600 text-left">
          <Link
            to={`/crm/${projectId}/companies/${company._id}`}
            className="hover:text-indigo-600"
          >
            View
          </Link>
        </div>
      </td>
    </tr>
  );
};

export default CompanyListItem;
