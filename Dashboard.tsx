import React, { useState } from 'react';

interface DashboardProps {
  // Add props as needed
}

interface ProjectData {
  id: string;
  name: string;
  client: string;
  sorCode: string;
  sorDescription: string;
  sorType: string;
  status: string;
  quoteDate: string;
  validUntil: string;
  totalValue: number;
  materialsCount: number;
  laborCount: number;
  equipmentCount: number;
  materialsCost: number;
  laborCost: number;
  equipmentCost: number;
  subtotal: number;
  tax: number;
  total: number;
}

const Dashboard: React.FC<DashboardProps> = () => {
  // Sample project data
  const [projects] = useState<ProjectData[]>([
    {
      id: '1',
      name: 'Office Building Renovation',
      client: 'ABC Construction Ltd',
      sorCode: 'SOR-2024-001',
      sorDescription: 'Complete office renovation including electrical, plumbing, and structural upgrades',
      sorType: 'Renovation',
      status: 'Pending Approval',
      quoteDate: 'December 15, 2024',
      validUntil: 'January 15, 2025',
      totalValue: 292325,
      materialsCount: 7,
      laborCount: 5,
      equipmentCount: 6,
      materialsCost: 125400,
      laborCost: 89200,
      equipmentCost: 51150,
      subtotal: 265750,
      tax: 26575,
      total: 292325
    },
    {
      id: '2',
      name: 'Warehouse Electrical Upgrade',
      client: 'XYZ Industries',
      sorCode: 'SOR-2024-002',
      sorDescription: 'Electrical system upgrade and safety improvements for warehouse facility',
      sorType: 'Electrical',
      status: 'Draft',
      quoteDate: 'December 20, 2024',
      validUntil: 'January 20, 2025',
      totalValue: 156750,
      materialsCount: 4,
      laborCount: 3,
      equipmentCount: 2,
      materialsCost: 85000,
      laborCost: 45000,
      equipmentCost: 15000,
      subtotal: 145000,
      tax: 14500,
      total: 159500
    },
    {
      id: '3',
      name: 'Data Center Infrastructure',
      client: 'Tech Solutions Inc',
      sorCode: 'SOR-2024-003',
      sorDescription: 'Data center construction with cooling and power systems',
      sorType: 'Infrastructure',
      status: 'Approved',
      quoteDate: 'November 10, 2024',
      validUntil: 'December 10, 2024',
      totalValue: 485000,
      materialsCount: 12,
      laborCount: 8,
      equipmentCount: 10,
      materialsCost: 250000,
      laborCost: 150000,
      equipmentCost: 75000,
      subtotal: 475000,
      tax: 47500,
      total: 522500
    }
  ]);

  const [selectedProjectId, setSelectedProjectId] = useState<string>('1');

  const selectedProject = projects.find(p => p.id === selectedProjectId) || projects[0];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return { bg: '#dcfce7', color: '#166534' };
      case 'pending approval':
        return { bg: '#fef3c7', color: '#d97706' };
      case 'draft':
        return { bg: '#e5e7eb', color: '#374151' };
      default:
        return { bg: '#e5e7eb', color: '#374151' };
    }
  };
  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Quotation Dashboard</h1>
        <p>Overview of all quotation activities and performance metrics</p>
      </div>

      {/* Key Metrics */}
      <div className="metrics-grid">
        <div className="metric-card">
          <h3>Total Quotes</h3>
          <div className="metric-value">24</div>
          <div className="metric-change positive">+12% from last month</div>
        </div>
        <div className="metric-card">
          <h3>Approval Rate</h3>
          <div className="metric-value">75%</div>
          <div className="metric-change positive">+5% from last month</div>
        </div>
        <div className="metric-card">
          <h3>Average Quote Value</h3>
          <div className="metric-value">$85,250</div>
          <div className="metric-change positive">+8% from last month</div>
        </div>
        <div className="metric-card">
          <h3>Pending Quotes</h3>
          <div className="metric-value">4</div>
          <div className="metric-change negative">-2 from last week</div>
        </div>
      </div>

      {/* Quote Summary Container */}
      <div style={{
        background: 'white',
        padding: '32px',
        borderRadius: '16px',
        border: '2px solid #e5e7eb',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        marginBottom: '32px'
      }}>
        {/* Header Section */}
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px'}}>
          <h2 style={{fontSize: '1.75rem', fontWeight: '700', color: '#1f2937', margin: '0'}}>Quote Summary</h2>
          <div style={{
            padding: '8px 16px',
            backgroundColor: getStatusColor(selectedProject.status).bg,
            color: getStatusColor(selectedProject.status).color,
            borderRadius: '20px',
            fontSize: '14px',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            {selectedProject.status}
          </div>
        </div>

        {/* Project Selector */}
        <div style={{
          background: '#f8fafc',
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid #e5e7eb',
          marginBottom: '32px'
        }}>
          <h3 style={{fontSize: '16px', fontWeight: '600', color: '#1f2937', margin: '0 0 16px 0'}}>Select Project</h3>
          <div style={{position: 'relative', maxWidth: '400px'}}>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                backgroundColor: 'white',
                color: '#374151',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                appearance: 'none',
                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                backgroundPosition: 'right 12px center',
                backgroundRepeat: 'no-repeat',
                backgroundSize: '16px',
                paddingRight: '40px'
              }}
            >
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name} - {project.client}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Project Information Cards */}
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '24px'}}>
          {/* Client & Project Card */}
          <div style={{
            background: 'white',
            padding: '24px',
            borderRadius: '12px',
            border: '1px solid #e5e7eb',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)'
          }}>
            <div style={{display: 'flex', alignItems: 'center', marginBottom: '20px'}}>
              <div style={{
                width: '40px',
                height: '40px',
                backgroundColor: '#6b7280',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '12px'
              }}>
                <span style={{color: 'white', fontSize: '14px', fontWeight: '600'}}>CP</span>
              </div>
              <h3 style={{fontSize: '18px', fontWeight: '600', color: '#1f2937', margin: '0'}}>Client & Project</h3>
            </div>
            <div style={{marginBottom: '16px'}}>
              <span style={{color: '#6b7280', fontSize: '14px', display: 'block', marginBottom: '4px'}}>Client</span>
              <span style={{fontWeight: '600', color: '#1f2937', fontSize: '16px'}}>{selectedProject.client}</span>
            </div>
            <div>
              <span style={{color: '#6b7280', fontSize: '14px', display: 'block', marginBottom: '4px'}}>Project</span>
              <span style={{fontWeight: '600', color: '#1f2937', fontSize: '16px'}}>{selectedProject.name}</span>
            </div>
          </div>

          {/* SOR Details Card */}
          <div style={{
            background: 'white',
            padding: '24px',
            borderRadius: '12px',
            border: '1px solid #e5e7eb',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)'
          }}>
            <div style={{display: 'flex', alignItems: 'center', marginBottom: '20px'}}>
              <div style={{
                width: '40px',
                height: '40px',
                backgroundColor: '#6b7280',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '12px'
              }}>
                <span style={{color: 'white', fontSize: '14px', fontWeight: '600'}}>SOR</span>
              </div>
              <h3 style={{fontSize: '18px', fontWeight: '600', color: '#1f2937', margin: '0'}}>SOR Details</h3>
            </div>
            <div style={{marginBottom: '16px'}}>
              <span style={{color: '#6b7280', fontSize: '14px', display: 'block', marginBottom: '4px'}}>SOR Code</span>
              <span style={{fontWeight: '600', color: '#1f2937', fontSize: '16px'}}>{selectedProject.sorCode}</span>
            </div>
            <div style={{marginBottom: '16px'}}>
              <span style={{color: '#6b7280', fontSize: '14px', display: 'block', marginBottom: '4px'}}>Type</span>
              <span style={{fontWeight: '600', color: '#1f2937', fontSize: '16px'}}>{selectedProject.sorType}</span>
            </div>
            <div>
              <span style={{color: '#6b7280', fontSize: '14px', display: 'block', marginBottom: '4px'}}>Description</span>
              <span style={{fontWeight: '500', color: '#1f2937', fontSize: '14px', lineHeight: '1.4'}}>{selectedProject.sorDescription}</span>
            </div>
          </div>

          {/* Timeline Card */}
          <div style={{
            background: 'white',
            padding: '24px',
            borderRadius: '12px',
            border: '1px solid #e5e7eb',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)'
          }}>
            <div style={{display: 'flex', alignItems: 'center', marginBottom: '20px'}}>
              <div style={{
                width: '40px',
                height: '40px',
                backgroundColor: '#6b7280',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '12px'
              }}>
                <span style={{color: 'white', fontSize: '14px', fontWeight: '600'}}>TL</span>
              </div>
              <h3 style={{fontSize: '18px', fontWeight: '600', color: '#1f2937', margin: '0'}}>Timeline</h3>
            </div>
            <div style={{marginBottom: '16px'}}>
              <span style={{color: '#6b7280', fontSize: '14px', display: 'block', marginBottom: '4px'}}>Quote Date</span>
              <span style={{fontWeight: '600', color: '#1f2937', fontSize: '16px'}}>{selectedProject.quoteDate}</span>
            </div>
            <div style={{marginBottom: '16px'}}>
              <span style={{color: '#6b7280', fontSize: '14px', display: 'block', marginBottom: '4px'}}>Valid Until</span>
              <span style={{fontWeight: '600', color: '#1f2937', fontSize: '16px'}}>{selectedProject.validUntil}</span>
            </div>
            <div>
              <span style={{color: '#6b7280', fontSize: '14px', display: 'block', marginBottom: '4px'}}>Duration</span>
              <span style={{fontWeight: '600', color: '#1f2937', fontSize: '16px'}}>30 days</span>
            </div>
          </div>
        </div>

        {/* Financial Summary Cards */}
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '24px'}}>
          {/* Total Value Card */}
          <div style={{
            background: '#f8fafc',
            padding: '24px',
            borderRadius: '12px',
            border: '1px solid #e5e7eb',
            textAlign: 'center'
          }}>
            <div style={{fontSize: '32px', fontWeight: '700', marginBottom: '8px', color: '#1f2937'}}>{formatCurrency(selectedProject.total)}</div>
            <div style={{fontSize: '14px', color: '#6b7280', fontWeight: '500'}}>Total Quote Value</div>
          </div>

          {/* Items Count Card */}
          <div style={{
            background: '#f8fafc',
            padding: '24px',
            borderRadius: '12px',
            border: '1px solid #e5e7eb',
            textAlign: 'center'
          }}>
            <div style={{fontSize: '32px', fontWeight: '700', marginBottom: '8px', color: '#1f2937'}}>{selectedProject.materialsCount + selectedProject.laborCount + selectedProject.equipmentCount}</div>
            <div style={{fontSize: '14px', color: '#6b7280', fontWeight: '500'}}>Items Included</div>
          </div>

          {/* Materials Card */}
          <div style={{
            background: '#f8fafc',
            padding: '24px',
            borderRadius: '12px',
            border: '1px solid #e5e7eb',
            textAlign: 'center'
          }}>
            <div style={{fontSize: '32px', fontWeight: '700', marginBottom: '8px', color: '#1f2937'}}>{selectedProject.materialsCount}</div>
            <div style={{fontSize: '14px', color: '#6b7280', fontWeight: '500'}}>Materials</div>
          </div>

          {/* Labor Card */}
          <div style={{
            background: '#f8fafc',
            padding: '24px',
            borderRadius: '12px',
            border: '1px solid #e5e7eb',
            textAlign: 'center'
          }}>
            <div style={{fontSize: '32px', fontWeight: '700', marginBottom: '8px', color: '#1f2937'}}>{selectedProject.laborCount}</div>
            <div style={{fontSize: '14px', color: '#6b7280', fontWeight: '500'}}>Labor Items</div>
          </div>

          {/* Equipment Card */}
          <div style={{
            background: '#f8fafc',
            padding: '24px',
            borderRadius: '12px',
            border: '1px solid #e5e7eb',
            textAlign: 'center'
          }}>
            <div style={{fontSize: '32px', fontWeight: '700', marginBottom: '8px', color: '#1f2937'}}>{selectedProject.equipmentCount}</div>
            <div style={{fontSize: '14px', color: '#6b7280', fontWeight: '500'}}>Equipment</div>
          </div>
        </div>

        {/* Cost Breakdown Card */}
        <div style={{
          background: 'white',
          padding: '24px',
          borderRadius: '12px',
          border: '1px solid #e5e7eb',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
          marginBottom: '24px'
        }}>
          <div style={{display: 'flex', alignItems: 'center', marginBottom: '20px'}}>
            <div style={{
              width: '40px',
              height: '40px',
              backgroundColor: '#6b7280',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '12px'
            }}>
              <span style={{color: 'white', fontSize: '14px', fontWeight: '600'}}>CB</span>
            </div>
            <h3 style={{fontSize: '18px', fontWeight: '600', color: '#1f2937', margin: '0'}}>Cost Breakdown</h3>
          </div>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px'}}>
              <span style={{color: '#6b7280', fontSize: '14px'}}>Materials</span>
              <span style={{fontWeight: '600', color: '#1f2937'}}>{formatCurrency(selectedProject.materialsCost)}</span>
            </div>
            <div style={{display: 'flex', justifyContent: 'space-between', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px'}}>
              <span style={{color: '#6b7280', fontSize: '14px'}}>Labor</span>
              <span style={{fontWeight: '600', color: '#1f2937'}}>{formatCurrency(selectedProject.laborCost)}</span>
            </div>
            <div style={{display: 'flex', justifyContent: 'space-between', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px'}}>
              <span style={{color: '#6b7280', fontSize: '14px'}}>Equipment</span>
              <span style={{fontWeight: '600', color: '#1f2937'}}>{formatCurrency(selectedProject.equipmentCost)}</span>
            </div>
            <div style={{display: 'flex', justifyContent: 'space-between', padding: '12px', backgroundColor: '#f1f5f9', borderRadius: '8px', border: '1px solid #e2e8f0'}}>
              <span style={{color: '#6b7280', fontSize: '14px'}}>Subtotal</span>
              <span style={{fontWeight: '600', color: '#1f2937'}}>{formatCurrency(selectedProject.subtotal)}</span>
            </div>
            <div style={{display: 'flex', justifyContent: 'space-between', padding: '12px', backgroundColor: '#f1f5f9', borderRadius: '8px', border: '1px solid #e2e8f0'}}>
              <span style={{color: '#6b7280', fontSize: '14px'}}>Tax (10%)</span>
              <span style={{fontWeight: '600', color: '#1f2937'}}>{formatCurrency(selectedProject.tax)}</span>
            </div>
            <div style={{display: 'flex', justifyContent: 'space-between', padding: '12px', backgroundColor: '#f1f5f9', borderRadius: '8px', border: '2px solid #6b7280'}}>
              <span style={{fontWeight: '700', color: '#1f2937', fontSize: '16px'}}>Total</span>
              <span style={{fontWeight: '700', color: '#1f2937', fontSize: '18px'}}>{formatCurrency(selectedProject.total)}</span>
            </div>
          </div>
        </div>

        <div style={{display: 'flex', gap: '16px', justifyContent: 'flex-end'}}>
          <button style={{
            padding: '12px 24px',
            backgroundColor: '#27A5C5',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}>
            Edit Quote
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="recent-activity">
        <h2>Recent Quote Activity</h2>
        <div className="activity-list">
          <div className="activity-item">
            <div className="activity-icon approved" style={{backgroundColor: '#10b981', color: 'white'}}></div>
            <div className="activity-content">
              <div className="activity-title">Quote Q-2024-001 approved by ABC Corp</div>
              <div className="activity-time">2 hours ago</div>
            </div>
            <div className="activity-amount">$125,000</div>
          </div>
          <div className="activity-item">
            <div className="activity-icon pending" style={{backgroundColor: '#f59e0b', color: 'white'}}></div>
            <div className="activity-content">
              <div className="activity-title">New quote Q-2024-004 created for XYZ Ltd</div>
              <div className="activity-time">4 hours ago</div>
            </div>
            <div className="activity-amount">$95,500</div>
          </div>
          <div className="activity-item">
            <div className="activity-icon rejected" style={{backgroundColor: '#ef4444', color: 'white'}}></div>
            <div className="activity-content">
              <div className="activity-title">Quote Q-2024-003 rejected by DEF Inc</div>
              <div className="activity-time">1 day ago</div>
            </div>
            <div className="activity-amount">$45,200</div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;