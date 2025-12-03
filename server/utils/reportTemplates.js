// HTML Templates for Beautiful PDF Reports

export const getReportHTML = (data, reportName, reportType) => {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${reportName}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      color: #333;
      line-height: 1.6;
      background: #f8f9fa;
      padding: 40px;
    }
    
    .report-container {
      max-width: 1200px;
      margin: 0 auto;
      background: white;
      box-shadow: 0 0 20px rgba(0,0,0,0.1);
      border-radius: 8px;
      overflow: hidden;
    }
    
    .report-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 40px;
      text-align: center;
    }
    
    .report-header h1 {
      font-size: 32px;
      font-weight: 700;
      margin-bottom: 10px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    
    .report-header .subtitle {
      font-size: 16px;
      opacity: 0.9;
      font-weight: 300;
    }
    
    .report-meta {
      background: #f8f9fa;
      padding: 20px 40px;
      border-bottom: 2px solid #e9ecef;
      display: flex;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 20px;
    }
    
    .meta-item {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .meta-label {
      font-weight: 600;
      color: #6c757d;
      font-size: 14px;
    }
    
    .meta-value {
      color: #212529;
      font-size: 14px;
    }
    
    .report-content {
      padding: 40px;
    }
    
    .section {
      margin-bottom: 40px;
    }
    
    .section-title {
      font-size: 24px;
      font-weight: 700;
      color: #667eea;
      margin-bottom: 20px;
      padding-bottom: 10px;
      border-bottom: 3px solid #667eea;
    }
    
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }
    
    .stat-card {
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      padding: 25px;
      border-radius: 8px;
      text-align: center;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      transition: transform 0.3s;
    }
    
    .stat-card.primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }
    
    .stat-card.success {
      background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
      color: white;
    }
    
    .stat-card.warning {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      color: white;
    }
    
    .stat-card.info {
      background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
      color: white;
    }
    
    .stat-value {
      font-size: 36px;
      font-weight: 700;
      margin-bottom: 5px;
    }
    
    .stat-label {
      font-size: 14px;
      opacity: 0.9;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .table-container {
      overflow-x: auto;
      margin-top: 20px;
      page-break-inside: avoid;
    }
    
    tbody tr {
      page-break-inside: avoid;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      background: white;
      box-shadow: 0 2px 10px rgba(0,0,0,0.05);
    }
    
    thead {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }
    
    th {
      padding: 8px;
      text-align: left;
      font-weight: 600;
      text-transform: uppercase;
      font-size: 10px;
      letter-spacing: 0.5px;
      white-space: nowrap;
    }
    
    td {
      padding: 8px;
      border-bottom: 1px solid #e9ecef;
      font-size: 10px;
      word-wrap: break-word;
      max-width: 200px;
    }
    
    tbody tr:hover {
      background: #f8f9fa;
    }
    
    tbody tr:last-child td {
      border-bottom: none;
    }
    
    .badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
    }
    
    .badge-success {
      background: #d4edda;
      color: #155724;
    }
    
    .badge-warning {
      background: #fff3cd;
      color: #856404;
    }
    
    .badge-danger {
      background: #f8d7da;
      color: #721c24;
    }
    
    .badge-info {
      background: #d1ecf1;
      color: #0c5460;
    }
    
    .badge-primary {
      background: #cfe2ff;
      color: #084298;
    }
    
    .summary-box {
      background: #f8f9fa;
      border-left: 4px solid #667eea;
      padding: 20px;
      margin: 20px 0;
      border-radius: 4px;
    }
    
    .summary-box h3 {
      color: #667eea;
      margin-bottom: 15px;
      font-size: 18px;
    }
    
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 15px;
    }
    
    .summary-item {
      display: flex;
      flex-direction: column;
    }
    
    .summary-label {
      font-size: 12px;
      color: #6c757d;
      text-transform: uppercase;
      margin-bottom: 5px;
    }
    
    .summary-value {
      font-size: 20px;
      font-weight: 700;
      color: #212529;
    }
    
    .item-card {
      background: white;
      border: 1px solid #e9ecef;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 15px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.05);
    }
    
    .item-card h4 {
      color: #667eea;
      margin-bottom: 10px;
      font-size: 18px;
    }
    
    .item-details {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 10px;
      margin-top: 10px;
    }
    
    .detail-item {
      display: flex;
      flex-direction: column;
    }
    
    .detail-label {
      font-size: 12px;
      color: #6c757d;
      text-transform: uppercase;
      margin-bottom: 3px;
    }
    
    .detail-value {
      font-size: 14px;
      color: #212529;
      font-weight: 500;
    }
    
    .footer {
      background: #f8f9fa;
      padding: 20px 40px;
      text-align: center;
      color: #6c757d;
      font-size: 12px;
      border-top: 2px solid #e9ecef;
    }
    
    .chart-placeholder {
      background: #f8f9fa;
      border: 2px dashed #dee2e6;
      border-radius: 8px;
      padding: 40px;
      text-align: center;
      color: #6c757d;
      margin: 20px 0;
    }
    
    .progress-bar {
      background: #e9ecef;
      border-radius: 10px;
      height: 20px;
      overflow: hidden;
      margin: 5px 0;
    }
    
    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 11px;
      font-weight: 600;
    }
    
    @media print {
      body {
        padding: 0;
        background: white;
      }
      
      .report-container {
        box-shadow: none;
      }
    }
  </style>
</head>
<body>
  ${getReportContent(data, reportName, reportType)}
</body>
</html>
  `;
  return html;
};

const getReportContent = (data, reportName, reportType) => {
  const header = `
    <div class="report-container">
      <div class="report-header">
        <h1>${reportName}</h1>
        <div class="subtitle">${data.project?.name || 'CRM Report'}</div>
        ${data.project?.description ? `<div class="subtitle" style="margin-top: 10px; font-size: 14px;">${data.project.description}</div>` : ''}
      </div>
      <div class="report-meta">
        <div class="meta-item">
          <span class="meta-label">Generated At:</span>
          <span class="meta-value">${formatDate(data.generatedAt)}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">Generated By:</span>
          <span class="meta-value">${data.generatedBy || 'System'}</span>
        </div>
        ${data.project?.createdAt ? `
        <div class="meta-item">
          <span class="meta-label">Project Created:</span>
          <span class="meta-value">${formatDate(data.project.createdAt)}</span>
        </div>
        ` : ''}
      </div>
      <div class="report-content">
  `;

  let content = '';

  switch (reportType) {
    case 'overview':
      content = getOverviewContent(data);
      break;
    case 'companies':
      content = getCompaniesContent(data);
      break;
    case 'customers':
      content = getCustomersContent(data);
      break;
    case 'deals':
      content = getDealsContent(data);
      break;
    case 'leads':
      content = getLeadsContent(data);
      break;
    case 'tasks':
      content = getTasksContent(data);
      break;
    case 'activities':
      content = getActivitiesContent(data);
      break;
    case 'performance':
      content = getPerformanceContent(data);
      break;
    case 'financial':
      content = getFinancialContent(data);
      break;
    default:
      content = '<div class="section"><p>Report content not available.</p></div>';
  }

  const footer = `
      </div>
      <div class="footer">
        <p>This report was generated automatically by the CRM Platform</p>
        <p style="margin-top: 5px;">© ${new Date().getFullYear()} CRM Platform. All rights reserved.</p>
      </div>
    </div>
  `;

  return header + content + footer;
};

const getOverviewContent = (data) => {
  const overview = data.overview || {};
  return `
    <div class="section">
      <h2 class="section-title">📊 Overview Statistics</h2>
      <div class="stats-grid">
        <div class="stat-card primary">
          <div class="stat-value">${overview.companies || 0}</div>
          <div class="stat-label">Companies</div>
        </div>
        <div class="stat-card success">
          <div class="stat-value">${overview.customers || 0}</div>
          <div class="stat-label">Customers</div>
        </div>
        <div class="stat-card warning">
          <div class="stat-value">${overview.deals || 0}</div>
          <div class="stat-label">Deals</div>
        </div>
        <div class="stat-card info">
          <div class="stat-value">${overview.leads || 0}</div>
          <div class="stat-label">Leads</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${overview.tasks || 0}</div>
          <div class="stat-label">Tasks</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${overview.events || 0}</div>
          <div class="stat-label">Events</div>
        </div>
      </div>
      
      <div class="summary-box">
        <h3>Financial Metrics</h3>
        <div class="summary-grid">
          <div class="summary-item">
            <span class="summary-label">Total Deal Value</span>
            <span class="summary-value">${formatCurrency(overview.totalDealValue || 0)}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">Won Deal Value</span>
            <span class="summary-value">${formatCurrency(overview.wonDealValue || 0)}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">Active Deals</span>
            <span class="summary-value">${overview.activeDeals || 0}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">Won Deals</span>
            <span class="summary-value">${overview.wonDeals || 0}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">Lost Deals</span>
            <span class="summary-value">${overview.lostDeals || 0}</span>
          </div>
          ${overview.dealWinRate ? `
          <div class="summary-item">
            <span class="summary-label">Deal Win Rate</span>
            <span class="summary-value">${overview.dealWinRate}%</span>
          </div>
          ` : ''}
        </div>
      </div>
      
      <div class="summary-box">
        <h3>Task Metrics</h3>
        <div class="summary-grid">
          <div class="summary-item">
            <span class="summary-label">Total Tasks</span>
            <span class="summary-value">${overview.tasks || 0}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">Completed Tasks</span>
            <span class="summary-value">${overview.completedTasks || 0}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">Pending Tasks</span>
            <span class="summary-value">${overview.pendingTasks || 0}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">In Progress</span>
            <span class="summary-value">${overview.inProgressTasks || 0}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">Overdue Tasks</span>
            <span class="summary-value">${overview.overdueTasks || 0}</span>
          </div>
          ${overview.taskCompletionRate ? `
          <div class="summary-item">
            <span class="summary-label">Completion Rate</span>
            <span class="summary-value">${overview.taskCompletionRate}%</span>
          </div>
          ` : ''}
        </div>
      </div>
      
      <div class="summary-box">
        <h3>Customer & Lead Metrics</h3>
        <div class="summary-grid">
          <div class="summary-item">
            <span class="summary-label">Active Customers</span>
            <span class="summary-value">${overview.activeCustomers || 0}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">New Leads</span>
            <span class="summary-value">${overview.newLeads || 0}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">Converted Leads</span>
            <span class="summary-value">${overview.convertedLeads || 0}</span>
          </div>
          ${overview.leadConversionRate ? `
          <div class="summary-item">
            <span class="summary-label">Lead Conversion Rate</span>
            <span class="summary-value">${overview.leadConversionRate}%</span>
          </div>
          ` : ''}
        </div>
      </div>
    </div>
  `;
};

const getCompaniesContent = (data) => {
  const companies = data.companies || [];
  const summary = data.summary || {};
  
  return `
    <div class="section">
      <h2 class="section-title">📈 Summary</h2>
      <div class="stats-grid">
        <div class="stat-card primary">
          <div class="stat-value">${summary.total || 0}</div>
          <div class="stat-label">Total Companies</div>
        </div>
      </div>
      
      ${Object.keys(summary.byStatus || {}).length > 0 ? `
      <div class="summary-box">
        <h3>Companies by Status</h3>
        <div class="summary-grid">
          ${Object.entries(summary.byStatus).map(([status, count]) => `
            <div class="summary-item">
              <span class="summary-label">${status}</span>
              <span class="summary-value">${count}</span>
            </div>
          `).join('')}
        </div>
      </div>
      ` : ''}
      
      ${Object.keys(summary.byIndustry || {}).length > 0 ? `
      <div class="summary-box">
        <h3>Companies by Industry</h3>
        <div class="summary-grid">
          ${Object.entries(summary.byIndustry).map(([industry, count]) => `
            <div class="summary-item">
              <span class="summary-label">${industry}</span>
              <span class="summary-value">${count}</span>
            </div>
          `).join('')}
        </div>
      </div>
      ` : ''}
    </div>
    
    <div class="section">
      <h2 class="section-title">🏢 Company Details</h2>
      ${companies.length > 0 ? `
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Industry</th>
              <th>Status</th>
              <th>Size</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Website</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            ${companies.map(company => `
              <tr>
                <td><strong>${escapeHtml(company.name || 'N/A')}</strong></td>
                <td>${escapeHtml(company.industry || 'N/A')}</td>
                <td>${getStatusBadge(company.status)}</td>
                <td>${escapeHtml(company.size || 'N/A')}</td>
                <td>${escapeHtml(company.email || 'N/A')}</td>
                <td>${escapeHtml(company.phone || 'N/A')}</td>
                <td>${company.website ? `<a href="${company.website}" target="_blank">${escapeHtml(company.website)}</a>` : 'N/A'}</td>
                <td>${formatDate(company.createdAt)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      ` : '<p>No companies found.</p>'}
    </div>
  `;
};

const getCustomersContent = (data) => {
  const customers = data.customers || [];
  const summary = data.summary || {};
  
  return `
    <div class="section">
      <h2 class="section-title">📈 Summary</h2>
      <div class="stats-grid">
        <div class="stat-card primary">
          <div class="stat-value">${summary.total || 0}</div>
          <div class="stat-label">Total Customers</div>
        </div>
        ${summary.averageScore ? `
        <div class="stat-card success">
          <div class="stat-value">${summary.averageScore}</div>
          <div class="stat-label">Avg Score</div>
        </div>
        ` : ''}
      </div>
      
      ${Object.keys(summary.byStatus || {}).length > 0 ? `
      <div class="summary-box">
        <h3>Customers by Status</h3>
        <div class="summary-grid">
          ${Object.entries(summary.byStatus).map(([status, count]) => `
            <div class="summary-item">
              <span class="summary-label">${status}</span>
              <span class="summary-value">${count}</span>
            </div>
          `).join('')}
        </div>
      </div>
      ` : ''}
    </div>
    
    <div class="section">
      <h2 class="section-title">👥 Customer Details</h2>
      ${customers.length > 0 ? `
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Company</th>
              <th>Status</th>
              <th>Stage</th>
              <th>Priority</th>
              <th>Score</th>
              <th>Assigned To</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            ${customers.map(customer => `
              <tr>
                <td><strong>${escapeHtml(customer.name || 'N/A')}</strong></td>
                <td>${escapeHtml(customer.email || 'N/A')}</td>
                <td>${escapeHtml(customer.phone || 'N/A')}</td>
                <td>${escapeHtml(customer.company || 'N/A')}</td>
                <td>${getStatusBadge(customer.status)}</td>
                <td>${getStatusBadge(customer.stage, 'info')}</td>
                <td>${getPriorityBadge(customer.priority)}</td>
                <td><strong>${customer.score || 0}</strong></td>
                <td>${escapeHtml(customer.assignedTo || 'Unassigned')}</td>
                <td>${formatDate(customer.createdAt)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      ` : '<p>No customers found.</p>'}
    </div>
  `;
};

const getDealsContent = (data) => {
  const deals = data.deals || [];
  const summary = data.summary || {};
  
  return `
    <div class="section">
      <h2 class="section-title">📈 Summary</h2>
      <div class="stats-grid">
        <div class="stat-card primary">
          <div class="stat-value">${summary.total || 0}</div>
          <div class="stat-label">Total Deals</div>
        </div>
        <div class="stat-card success">
          <div class="stat-value">${formatCurrency(summary.totalValue || 0)}</div>
          <div class="stat-label">Total Value</div>
        </div>
        <div class="stat-card warning">
          <div class="stat-value">${formatCurrency(summary.wonValue || 0)}</div>
          <div class="stat-label">Won Value</div>
        </div>
        ${summary.winRate ? `
        <div class="stat-card info">
          <div class="stat-value">${summary.winRate}%</div>
          <div class="stat-label">Win Rate</div>
        </div>
        ` : ''}
      </div>
      
      ${Object.keys(summary.byStatus || {}).length > 0 ? `
      <div class="summary-box">
        <h3>Deals by Status</h3>
        <div class="summary-grid">
          ${Object.entries(summary.byStatus).map(([status, count]) => `
            <div class="summary-item">
              <span class="summary-label">${status}</span>
              <span class="summary-value">${count}</span>
            </div>
          `).join('')}
        </div>
      </div>
      ` : ''}
      
      ${Object.keys(summary.byStage || {}).length > 0 ? `
      <div class="summary-box">
        <h3>Deals by Stage</h3>
        <div class="summary-grid">
          ${Object.entries(summary.byStage).map(([stage, count]) => `
            <div class="summary-item">
              <span class="summary-label">${stage}</span>
              <span class="summary-value">${count}</span>
            </div>
          `).join('')}
        </div>
      </div>
      ` : ''}
    </div>
    
    <div class="section">
      <h2 class="section-title">💰 Deal Details</h2>
      ${deals.length > 0 ? deals.map(deal => `
        <div class="item-card">
          <h4>${escapeHtml(deal.name || 'N/A')} ${deal.dealNumber ? `<span style="font-size: 12px; color: #6c757d;">(${deal.dealNumber})</span>` : ''}</h4>
          <div class="item-details">
            <div class="detail-item">
              <span class="detail-label">Deal Value</span>
              <span class="detail-value"><strong>${formatCurrency(deal.value || 0)} ${deal.currency || 'USD'}</strong></span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Status</span>
              <span class="detail-value">${getDealStatusBadge(deal.status)}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Stage</span>
              <span class="detail-value">${escapeHtml(deal.stage || 'N/A')}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Priority</span>
              <span class="detail-value">${getPriorityBadge(deal.priority || 'medium')}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Probability</span>
              <span class="detail-value">
                <div class="progress-bar" style="width: 100px; display: inline-block;">
                  <div class="progress-fill" style="width: ${deal.probability || 0}%">${deal.probability || 0}%</div>
                </div>
              </span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Customer</span>
              <span class="detail-value">${escapeHtml(deal.customer || 'N/A')}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Customer Email</span>
              <span class="detail-value">${escapeHtml(deal.customerEmail || 'N/A')}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Customer Phone</span>
              <span class="detail-value">${escapeHtml(deal.customerPhone || 'N/A')}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Company</span>
              <span class="detail-value">${escapeHtml(deal.company || 'N/A')}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Industry</span>
              <span class="detail-value">${escapeHtml(deal.companyIndustry || 'N/A')}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Assigned To</span>
              <span class="detail-value">${escapeHtml(deal.assignedTo || 'Unassigned')}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Assigned Email</span>
              <span class="detail-value">${escapeHtml(deal.assignedToEmail || 'N/A')}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Created By</span>
              <span class="detail-value">${escapeHtml(deal.createdBy || 'Unknown')}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Source</span>
              <span class="detail-value">${escapeHtml(deal.source || 'N/A')}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Expected Close Date</span>
              <span class="detail-value">${deal.expectedCloseDate ? formatDate(deal.expectedCloseDate) : 'N/A'}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Actual Close Date</span>
              <span class="detail-value">${deal.actualCloseDate ? formatDate(deal.actualCloseDate) : 'N/A'}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Tags</span>
              <span class="detail-value">${deal.tags && deal.tags.length > 0 ? deal.tags.map(tag => `<span class="badge badge-info">${escapeHtml(tag)}</span>`).join(' ') : 'None'}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Notes Count</span>
              <span class="detail-value">${deal.notes || 0}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Activities Count</span>
              <span class="detail-value">${deal.activities || 0}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Created</span>
              <span class="detail-value">${formatDate(deal.createdAt)}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Last Updated</span>
              <span class="detail-value">${formatDate(deal.updatedAt)}</span>
            </div>
            ${deal.description ? `
            <div class="detail-item" style="grid-column: 1 / -1;">
              <span class="detail-label">Description</span>
              <span class="detail-value">${escapeHtml(deal.description)}</span>
            </div>
            ` : ''}
          </div>
        </div>
      `).join('') : '<p>No deals found.</p>'}
    </div>
  `;
};

const getLeadsContent = (data) => {
  const leads = data.leads || [];
  const summary = data.summary || {};
  
  return `
    <div class="section">
      <h2 class="section-title">📈 Summary</h2>
      <div class="stats-grid">
        <div class="stat-card primary">
          <div class="stat-value">${summary.total || 0}</div>
          <div class="stat-label">Total Leads</div>
        </div>
        ${summary.averageScore ? `
        <div class="stat-card success">
          <div class="stat-value">${summary.averageScore}</div>
          <div class="stat-label">Avg Score</div>
        </div>
        ` : ''}
      </div>
      
      ${Object.keys(summary.byStatus || {}).length > 0 ? `
      <div class="summary-box">
        <h3>Leads by Status</h3>
        <div class="summary-grid">
          ${Object.entries(summary.byStatus).map(([status, count]) => `
            <div class="summary-item">
              <span class="summary-label">${status}</span>
              <span class="summary-value">${count}</span>
            </div>
          `).join('')}
        </div>
      </div>
      ` : ''}
      
      ${Object.keys(summary.bySource || {}).length > 0 ? `
      <div class="summary-box">
        <h3>Leads by Source</h3>
        <div class="summary-grid">
          ${Object.entries(summary.bySource).map(([source, count]) => `
            <div class="summary-item">
              <span class="summary-label">${source}</span>
              <span class="summary-value">${count}</span>
            </div>
          `).join('')}
        </div>
      </div>
      ` : ''}
    </div>
    
    <div class="section">
      <h2 class="section-title">💡 Lead Details</h2>
      ${leads.length > 0 ? `
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Company</th>
              <th>Status</th>
              <th>Source</th>
              <th>Score</th>
              <th>Assigned To</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            ${leads.map(lead => `
              <tr>
                <td><strong>${escapeHtml(lead.name || 'N/A')}</strong></td>
                <td>${escapeHtml(lead.email || 'N/A')}</td>
                <td>${escapeHtml(lead.phone || 'N/A')}</td>
                <td>${escapeHtml(lead.company || 'N/A')}</td>
                <td>${getStatusBadge(lead.status)}</td>
                <td>${escapeHtml(lead.source || 'N/A')}</td>
                <td><strong>${lead.score || 0}</strong></td>
                <td>${escapeHtml(lead.assignedTo || 'Unassigned')}</td>
                <td>${formatDate(lead.createdAt)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      ` : '<p>No leads found.</p>'}
    </div>
  `;
};

const getTasksContent = (data) => {
  const tasks = data.tasks || [];
  const summary = data.summary || {};
  
  return `
    <div class="section">
      <h2 class="section-title">📈 Summary</h2>
      <div class="stats-grid">
        <div class="stat-card primary">
          <div class="stat-value">${summary.total || 0}</div>
          <div class="stat-label">Total Tasks</div>
        </div>
        <div class="stat-card success">
          <div class="stat-value">${summary.completed || 0}</div>
          <div class="stat-label">Completed</div>
        </div>
        <div class="stat-card warning">
          <div class="stat-value">${summary.overdue || 0}</div>
          <div class="stat-label">Overdue</div>
        </div>
        ${summary.completionRate ? `
        <div class="stat-card info">
          <div class="stat-value">${summary.completionRate}%</div>
          <div class="stat-label">Completion Rate</div>
        </div>
        ` : ''}
      </div>
      
      ${Object.keys(summary.byStatus || {}).length > 0 ? `
      <div class="summary-box">
        <h3>Tasks by Status</h3>
        <div class="summary-grid">
          ${Object.entries(summary.byStatus).map(([status, count]) => `
            <div class="summary-item">
              <span class="summary-label">${status}</span>
              <span class="summary-value">${count}</span>
            </div>
          `).join('')}
        </div>
      </div>
      ` : ''}
    </div>
    
    <div class="section">
      <h2 class="section-title">✅ Task Details</h2>
      ${tasks.length > 0 ? `
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Type</th>
              <th>Assigned To</th>
              <th>Created By</th>
              <th>Due Date</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            ${tasks.map(task => `
              <tr>
                <td><strong>${escapeHtml(task.title || 'N/A')}</strong></td>
                <td>${getStatusBadge(task.status)}</td>
                <td>${getPriorityBadge(task.priority)}</td>
                <td>${escapeHtml(task.type || 'N/A')}</td>
                <td>${escapeHtml(task.assignedTo || 'Unassigned')}</td>
                <td>${escapeHtml(task.createdBy || 'N/A')}</td>
                <td>${task.dueDate ? formatDate(task.dueDate) : 'N/A'}</td>
                <td>${formatDate(task.createdAt)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      ` : '<p>No tasks found.</p>'}
    </div>
  `;
};

const getActivitiesContent = (data) => {
  const activities = data.activities || [];
  const summary = data.summary || {};
  
  return `
    <div class="section">
      <h2 class="section-title">📈 Summary</h2>
      <div class="stats-grid">
        <div class="stat-card primary">
          <div class="stat-value">${summary.total || 0}</div>
          <div class="stat-label">Total Activities</div>
        </div>
      </div>
      
      ${Object.keys(summary.byType || {}).length > 0 ? `
      <div class="summary-box">
        <h3>Activities by Type</h3>
        <div class="summary-grid">
          ${Object.entries(summary.byType).map(([type, count]) => `
            <div class="summary-item">
              <span class="summary-label">${type}</span>
              <span class="summary-value">${count}</span>
            </div>
          `).join('')}
        </div>
      </div>
      ` : ''}
      
      ${Object.keys(summary.byEntity || {}).length > 0 ? `
      <div class="summary-box">
        <h3>Activities by Entity</h3>
        <div class="summary-grid">
          ${Object.entries(summary.byEntity).map(([entity, count]) => `
            <div class="summary-item">
              <span class="summary-label">${entity}</span>
              <span class="summary-value">${count}</span>
            </div>
          `).join('')}
        </div>
      </div>
      ` : ''}
      
      ${Object.keys(summary.byCategory || {}).length > 0 ? `
      <div class="summary-box">
        <h3>Activities by Category</h3>
        <div class="summary-grid">
          ${Object.entries(summary.byCategory).map(([category, count]) => `
            <div class="summary-item">
              <span class="summary-label">${category}</span>
              <span class="summary-value">${count}</span>
            </div>
          `).join('')}
        </div>
      </div>
      ` : ''}
    </div>
    
    <div class="section">
      <h2 class="section-title">📝 Activity Details</h2>
      ${activities.length > 0 ? `
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Entity Type</th>
              <th>Entity Name</th>
              <th>Activity Type</th>
              <th>Description</th>
              <th>User</th>
              <th>Category</th>
              <th>Priority</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            ${activities.map(activity => `
              <tr>
                <td>${escapeHtml(activity.entityType || 'N/A')}</td>
                <td><strong>${escapeHtml(activity.entityName || 'N/A')}</strong></td>
                <td>${getStatusBadge(activity.type, 'info')}</td>
                <td>${escapeHtml(activity.description || 'N/A')}</td>
                <td>${escapeHtml(activity.user || 'N/A')}</td>
                <td>${escapeHtml(activity.category || 'N/A')}</td>
                <td>${getPriorityBadge(activity.priority || 'medium')}</td>
                <td>${formatDate(activity.createdAt)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      ` : '<p>No activities found.</p>'}
    </div>
  `;
};

const getPerformanceContent = (data) => {
  const members = data.members || [];
  const teamAverages = data.teamAverages || {};
  
  return `
    ${Object.keys(teamAverages).length > 0 ? `
    <div class="section">
      <h2 class="section-title">📊 Team Overview</h2>
      <div class="stats-grid">
        <div class="stat-card primary">
          <div class="stat-value">${teamAverages.averagePerformanceScore || 0}</div>
          <div class="stat-label">Avg Performance Score</div>
        </div>
        <div class="stat-card success">
          <div class="stat-value">${formatCurrency(teamAverages.totalRevenue || 0)}</div>
          <div class="stat-label">Total Revenue</div>
        </div>
        <div class="stat-card info">
          <div class="stat-value">${teamAverages.averageCompletionRate || 0}%</div>
          <div class="stat-label">Avg Completion Rate</div>
        </div>
        <div class="stat-card warning">
          <div class="stat-value">${teamAverages.averageWinRate || 0}%</div>
          <div class="stat-label">Avg Win Rate</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${teamAverages.totalDeals || 0}</div>
          <div class="stat-label">Total Deals</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${teamAverages.totalTasks || 0}</div>
          <div class="stat-label">Total Tasks</div>
        </div>
      </div>
    </div>
    ` : ''}
    
    <div class="section">
      <h2 class="section-title">👥 Individual Performance</h2>
      ${members.length > 0 ? `
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Score</th>
              <th>Tasks</th>
              <th>Completion</th>
              <th>On-Time</th>
              <th>Deals</th>
              <th>Win Rate</th>
              <th>Revenue</th>
              <th>Leads</th>
              <th>Conv. Rate</th>
              <th>Customers</th>
            </tr>
          </thead>
          <tbody>
            ${members.map(member => `
              <tr>
                <td><strong>${escapeHtml(member.name || 'N/A')}</strong></td>
                <td>${escapeHtml(member.email || 'N/A')}</td>
                <td>${escapeHtml(member.role || 'N/A')}</td>
                <td><strong>${member.performanceScore || 0}</strong></td>
                <td>${member.tasks?.total || 0}</td>
                <td>
                  <div class="progress-bar">
                    <div class="progress-fill" style="width: ${Math.min(member.tasks?.completionRate || 0, 100)}%">
                      ${member.tasks?.completed || 0}/${member.tasks?.total || 0} (${member.tasks?.completionRate || 0}%)
                    </div>
                  </div>
                </td>
                <td>${member.tasks?.onTimeRate || 0}%</td>
                <td>${member.deals?.total || 0}</td>
                <td>
                  <div class="progress-bar">
                    <div class="progress-fill" style="width: ${Math.min(member.deals?.winRate || 0, 100)}%">
                      ${member.deals?.won || 0}/${member.deals?.total || 0} (${member.deals?.winRate || 0}%)
                    </div>
                  </div>
                </td>
                <td><strong>${formatCurrency(member.deals?.wonValue || 0)}</strong></td>
                <td>${member.leads?.total || 0}</td>
                <td>${member.leads?.conversionRate || 0}%</td>
                <td>${member.customers?.total || 0}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      ` : '<p>No performance data available.</p>'}
    </div>
  `;
};

const getFinancialContent = (data) => {
  const financial = data.financial || {};
  const deals = data.deals || [];
  
  return `
    <div class="section">
      <h2 class="section-title">📈 Financial Summary</h2>
      <div class="stats-grid">
        <div class="stat-card primary">
          <div class="stat-value">${financial.totalDeals || 0}</div>
          <div class="stat-label">Total Deals</div>
        </div>
        <div class="stat-card success">
          <div class="stat-value">${formatCurrency(financial.wonValue || 0)}</div>
          <div class="stat-label">Won Value</div>
        </div>
        <div class="stat-card warning">
          <div class="stat-value">${formatCurrency(financial.lostValue || 0)}</div>
          <div class="stat-label">Lost Value</div>
        </div>
        <div class="stat-card info">
          <div class="stat-value">${formatCurrency(financial.openValue || 0)}</div>
          <div class="stat-label">Open Value</div>
        </div>
        ${financial.winRate ? `
        <div class="stat-card">
          <div class="stat-value">${financial.winRate}%</div>
          <div class="stat-label">Win Rate</div>
        </div>
        ` : ''}
        ${financial.averageDealValue ? `
        <div class="stat-card">
          <div class="stat-value">${formatCurrency(financial.averageDealValue)}</div>
          <div class="stat-label">Avg Deal Value</div>
        </div>
        ` : ''}
      </div>
      
      <div class="summary-box">
        <h3>Deal Breakdown</h3>
        <div class="summary-grid">
          <div class="summary-item">
            <span class="summary-label">Won Deals</span>
            <span class="summary-value">${financial.wonDeals || 0}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">Lost Deals</span>
            <span class="summary-value">${financial.lostDeals || 0}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">Open Deals</span>
            <span class="summary-value">${financial.openDeals || 0}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">Total Value</span>
            <span class="summary-value">${formatCurrency(financial.totalValue || 0)}</span>
          </div>
        </div>
      </div>
      
      ${Object.keys(financial.monthlyRevenue || {}).length > 0 ? `
      <div class="summary-box">
        <h3>Monthly Revenue</h3>
        <div class="summary-grid">
          ${Object.entries(financial.monthlyRevenue).sort().map(([month, revenue]) => `
            <div class="summary-item">
              <span class="summary-label">${formatMonth(month)}</span>
              <span class="summary-value">${formatCurrency(revenue)}</span>
            </div>
          `).join('')}
        </div>
      </div>
      ` : ''}
    </div>
    
    <div class="section">
      <h2 class="section-title">💰 Deal Details</h2>
      ${deals.length > 0 ? `
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Value</th>
              <th>Status</th>
              <th>Customer</th>
              <th>Assigned To</th>
              <th>Probability</th>
              <th>Expected Close</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            ${deals.map(deal => `
              <tr>
                <td><strong>${escapeHtml(deal.name || 'N/A')}</strong></td>
                <td><strong>${formatCurrency(deal.value || 0)} ${deal.currency || 'USD'}</strong></td>
                <td>${getDealStatusBadge(deal.status)}</td>
                <td>${escapeHtml(deal.customer || 'N/A')}</td>
                <td>${escapeHtml(deal.assignedTo || 'Unassigned')}</td>
                <td>
                  <div class="progress-bar">
                    <div class="progress-fill" style="width: ${deal.probability || 0}%">
                      ${deal.probability || 0}%
                    </div>
                  </div>
                </td>
                <td>${deal.expectedCloseDate ? formatDate(deal.expectedCloseDate) : 'N/A'}</td>
                <td>${formatDate(deal.createdAt)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      ` : '<p>No deals found.</p>'}
    </div>
  `;
};

// Helper functions
const formatDate = (date) => {
  if (!date) return 'N/A';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
};

const formatMonth = (monthStr) => {
  if (!monthStr) return 'N/A';
  const [year, month] = monthStr.split('-');
  const date = new Date(year, parseInt(month) - 1);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount || 0);
};

const escapeHtml = (text) => {
  if (!text) return 'N/A';
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return String(text).replace(/[&<>"']/g, m => map[m]);
};

const getStatusBadge = (status, type = 'primary') => {
  if (!status) return '<span class="badge badge-info">N/A</span>';
  const statusLower = status.toLowerCase();
  let badgeClass = 'badge-primary';
  
  if (statusLower === 'active' || statusLower === 'won' || statusLower === 'completed') {
    badgeClass = 'badge-success';
  } else if (statusLower === 'inactive' || statusLower === 'lost' || statusLower === 'pending') {
    badgeClass = 'badge-danger';
  } else if (statusLower === 'open' || statusLower === 'in-progress') {
    badgeClass = 'badge-warning';
  } else if (type === 'info') {
    badgeClass = 'badge-info';
  }
  
  return `<span class="badge ${badgeClass}">${escapeHtml(status)}</span>`;
};

const getDealStatusBadge = (status) => {
  if (!status) return '<span class="badge badge-info">N/A</span>';
  const statusLower = status.toLowerCase();
  let badgeClass = 'badge-primary';
  
  if (statusLower === 'won') {
    badgeClass = 'badge-success';
  } else if (statusLower === 'lost') {
    badgeClass = 'badge-danger';
  } else if (statusLower === 'open') {
    badgeClass = 'badge-warning';
  }
  
  return `<span class="badge ${badgeClass}">${escapeHtml(status)}</span>`;
};

const getPriorityBadge = (priority) => {
  if (!priority) return '<span class="badge badge-info">N/A</span>';
  const priorityLower = priority.toLowerCase();
  let badgeClass = 'badge-info';
  
  if (priorityLower === 'high') {
    badgeClass = 'badge-danger';
  } else if (priorityLower === 'medium') {
    badgeClass = 'badge-warning';
  } else if (priorityLower === 'low') {
    badgeClass = 'badge-success';
  }
  
  return `<span class="badge ${badgeClass}">${escapeHtml(priority)}</span>`;
};

