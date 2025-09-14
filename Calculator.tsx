import React, { useState, useEffect } from 'react';

interface AdditionalSupportItem {
  id: string;
  name: string;
  quantity: number;
  unitCost: number;
  total: number;
}

interface ProductSoR {
  id: string;
  name: string;
  materials: number;
  tasks: number;
  labour: number;
  baseCost: number;
  description?: string;
  unit?: string;
  regionalPricing?: { [region: string]: number };
}

const Calculator: React.FC = () => {
  const [client, setClient] = useState('');
  const [region, setRegion] = useState('');
  const [productSoR, setProductSoR] = useState('');
  const [riskUplift, setRiskUplift] = useState(0);
  const [additionalSupportItems, setAdditionalSupportItems] = useState<AdditionalSupportItem[]>([]);
  const [showFormula, setShowFormula] = useState(false);
  const [showProductPopup, setShowProductPopup] = useState(false);
  const [selectedProductForPopup, setSelectedProductForPopup] = useState<ProductSoR | null>(null);
  const [sorCode, setSorCode] = useState('');
  const [sorDescription, setSorDescription] = useState('');

  // Check for pre-selected product from dashboard
  useEffect(() => {
    const selectedProductData = localStorage.getItem('selectedProduct');
    if (selectedProductData) {
      try {
        const product = JSON.parse(selectedProductData);
        setProductSoR(product.id);
        setRegion('NSW'); // Default region
        // Clear the stored product after using it
        localStorage.removeItem('selectedProduct');
      } catch (error) {
        console.error('Error parsing selected product:', error);
      }
    }
  }, []);

  // Sample data
  const regions = ['NSW', 'VIC', 'QLD', 'SA', 'WA', 'TAS', 'NT', 'ACT'];
  const products: ProductSoR[] = [
    { 
      id: '1', 
      name: 'Standard Demolition', 
      materials: 500, 
      tasks: 800, 
      labour: 1200, 
      baseCost: 2500,
      description: 'Complete demolition of standard residential and commercial structures',
      unit: 'per sqm',
      regionalPricing: {
        'NSW': 2500,
        'VIC': 2400,
        'QLD': 2300,
        'SA': 2450,
        'WA': 2550,
        'TAS': 2600,
        'NT': 2700,
        'ACT': 2500
      }
    },
    { 
      id: '2', 
      name: 'Hazardous Material Removal', 
      materials: 1200, 
      tasks: 1500, 
      labour: 2000, 
      baseCost: 4700,
      description: 'Safe removal and disposal of hazardous materials including asbestos',
      unit: 'per sqm',
      regionalPricing: {
        'NSW': 4700,
        'VIC': 4600,
        'QLD': 4500,
        'SA': 4650,
        'WA': 4750,
        'TAS': 4800,
        'NT': 4900,
        'ACT': 4700
      }
    },
    { 
      id: '3', 
      name: 'Structural Demolition', 
      materials: 800, 
      tasks: 2000, 
      labour: 3000, 
      baseCost: 5800,
      description: 'Heavy structural demolition requiring specialized equipment',
      unit: 'per sqm',
      regionalPricing: {
        'NSW': 5800,
        'VIC': 5700,
        'QLD': 5600,
        'SA': 5750,
        'WA': 5850,
        'TAS': 5900,
        'NT': 6000,
        'ACT': 5800
      }
    },
    // Dashboard project data
    { 
      id: 'P001', 
      name: 'Site A Construction', 
      materials: 15000, 
      tasks: 20000, 
      labour: 15000, 
      baseCost: 50000,
      description: 'Complete construction project for Site A development',
      unit: 'per project',
      regionalPricing: {
        'NSW': 50000,
        'VIC': 49000,
        'QLD': 48000,
        'SA': 49500,
        'WA': 50500,
        'TAS': 51000,
        'NT': 52000,
        'ACT': 50000
      }
    },
    { 
      id: 'P002', 
      name: 'Equipment Installation', 
      materials: 8000, 
      tasks: 10000, 
      labour: 5000, 
      baseCost: 25000,
      description: 'Installation and setup of specialized equipment',
      unit: 'per unit',
      regionalPricing: {
        'NSW': 25000,
        'VIC': 24500,
        'QLD': 24000,
        'SA': 24750,
        'WA': 25250,
        'TAS': 25500,
        'NT': 26000,
        'ACT': 25000
      }
    },
    { 
      id: 'P003', 
      name: 'Infrastructure Setup', 
      materials: 25000, 
      tasks: 30000, 
      labour: 20000, 
      baseCost: 75000,
      description: 'Complete infrastructure development and setup',
      unit: 'per project',
      regionalPricing: {
        'NSW': 75000,
        'VIC': 73500,
        'QLD': 72000,
        'SA': 74250,
        'WA': 75750,
        'TAS': 76500,
        'NT': 78000,
        'ACT': 75000
      }
    }
  ];

  const selectedProduct = products.find(p => p.id === productSoR);
  const baseCost = selectedProduct?.baseCost || 0;
  const additionalSupportCost = additionalSupportItems.reduce((sum, item) => sum + item.total, 0);
  const subtotal = baseCost + additionalSupportCost;
  const riskMultiplier = 1 + (riskUplift / 100);
  const total = subtotal * riskMultiplier;

  const addAdditionalSupportItem = () => {
    const newItem: AdditionalSupportItem = {
      id: Date.now().toString(),
      name: '',
      quantity: 1,
      unitCost: 0,
      total: 0
    };
    setAdditionalSupportItems([...additionalSupportItems, newItem]);
  };

  const updateAdditionalSupportItem = (id: string, field: keyof AdditionalSupportItem, value: string | number) => {
    setAdditionalSupportItems(items => 
      items.map(item => {
        if (item.id === id) {
          const updated = { ...item, [field]: value };
          if (field === 'quantity' || field === 'unitCost') {
            updated.total = updated.quantity * updated.unitCost;
          }
          return updated;
        }
        return item;
      })
    );
  };

  const removeAdditionalSupportItem = (id: string) => {
    setAdditionalSupportItems(items => items.filter(item => item.id !== id));
  };

  // Handle product selection and show popup
  const handleProductSelection = (productName: string) => {
    const selectedProduct = products.find(p => p.name === productName);
    if (selectedProduct) {
      setSelectedProductForPopup(selectedProduct);
      setShowProductPopup(true);
    }
  };

  // Handle clicking on the product input to change selection
  const handleProductInputClick = () => {
    if (selectedProduct) {
      // If there's already a selected product, clear it to allow selection of a different one
      setProductSoR('');
    }
  };

  // Confirm product selection
  const confirmProductSelection = () => {
    if (selectedProductForPopup) {
      setProductSoR(selectedProductForPopup.id);
      setShowProductPopup(false);
      setSelectedProductForPopup(null);
    }
  };

  // Cancel product selection
  const cancelProductSelection = () => {
    setShowProductPopup(false);
    setSelectedProductForPopup(null);
  };

  // Get regional cost for selected product
  const getRegionalCost = (product: ProductSoR, region: string) => {
    if (product.regionalPricing && product.regionalPricing[region]) {
      return product.regionalPricing[region];
    }
    return product.baseCost;
  };

  const getCurrentTimestamp = () => {
    const now = new Date();
    return now.toLocaleString('en-AU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  const generatePDF = () => {
    // Create a new window for PDF generation
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleString('en-AU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });

    // Generate sample data for the PDF (matching the image format)
    const sampleMaterials = [
      { name: '10m CAT5', qty: 1, unitCost: 11.95, lineTotal: 11.95 },
      { name: 'Consumables', qty: 1, unitCost: 100.00, lineTotal: 100.00 },
      { name: '10m CAT5', qty: 1, unitCost: 11.95, lineTotal: 11.95 },
      { name: '10m CAT5', qty: 1, unitCost: 11.95, lineTotal: 11.95 },
      { name: 'Consumables', qty: 1, unitCost: 100.00, lineTotal: 100.00 },
      { name: '6mm^2 Red', qty: 1, unitCost: 10.00, lineTotal: 10.00 },
      { name: '6mm^2 Blue', qty: 1, unitCost: 10.00, lineTotal: 10.00 }
    ];

    const sampleTasks = [
      { name: 'Unit Swap Out', qty: 1, unitCost: 0.00, lineTotal: 0.00 },
      { name: 'R&C Control Unit Install', qty: 1, unitCost: 0.00, lineTotal: 0.00 }
    ];

    const sampleLabour = [
      { name: 'Labour Normal', qty: 8, unitCost: 75.00, lineTotal: 600.00 },
      { name: 'Labour Normal', qty: 8, unitCost: 75.00, lineTotal: 600.00 },
      { name: 'Test/Commission', qty: 6, unitCost: 95.00, lineTotal: 570.00 }
    ];

    const materialsTotal = sampleMaterials.reduce((sum, item) => sum + item.lineTotal, 0);
    const tasksTotal = sampleTasks.reduce((sum, item) => sum + item.lineTotal, 0);
    const labourTotal = sampleLabour.reduce((sum, item) => sum + item.lineTotal, 0);
    const baseCost = materialsTotal + tasksTotal + labourTotal;
    const supportCost = additionalSupportItems.reduce((sum, item) => sum + item.total, 0);
    const subtotal = baseCost + supportCost;
    const riskAmount = subtotal * (riskUplift / 100);
    const total = subtotal + riskAmount;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Quote Summary </title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background: white;
            color: #333;
            line-height: 1.4;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 30px;
            border-bottom: 2px solid #1BA2C4;
            padding-bottom: 20px;
          }
          .logo-container {
            display: flex;
            align-items: center;
            gap: 15px;
          }
          .company-logo {
            height: 60px;
            width: auto;
            object-fit: contain;
          }
          .company-text h1 {
            margin: 0;
            font-size: 24px;
            font-weight: bold;
            color: #1BA2C4;
          }
          .quote-title {
            font-size: 20px;
            font-weight: bold;
            margin: 10px 0 0 0;
            color: #333;
          }
          .date-info {
            text-align: right;
            font-size: 14px;
            color: #666;
          }
          .summary-boxes {
            display: flex;
            gap: 20px;
            margin-bottom: 30px;
            flex-wrap: wrap;
          }
          .summary-box {
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            padding: 15px;
            text-align: center;
            min-width: 120px;
            background: #f9fafb;
          }
          .summary-box.total-box {
            border-color: #1BA2C4;
            background: #eff6ff;
            font-weight: bold;
          }
          .box-label {
            font-size: 14px;
            color: #666;
            margin-bottom: 5px;
          }
          .box-value {
            font-size: 18px;
            font-weight: bold;
            color: #333;
          }
          .total-box .box-value {
            color: #1BA2C4;
            font-size: 20px;
          }
          .details-section {
            margin-bottom: 30px;
          }
          .details-section h3 {
            margin: 0 0 15px 0;
            font-size: 18px;
            color: #333;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 5px;
          }
          .detail-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            padding: 5px 0;
          }
          .detail-label {
            font-weight: 500;
            color: #374151;
          }
          .detail-value {
            color: #6b7280;
            text-align: right;
          }
          .breakdown-section {
            margin-bottom: 20px;
          }
          .breakdown-section h3 {
            margin: 0 0 10px 0;
            font-size: 16px;
            color: #333;
            background: #f3f4f6;
            padding: 8px 12px;
            border-radius: 4px;
          }
          .breakdown-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
          }
          .breakdown-table th,
          .breakdown-table td {
            padding: 8px 12px;
            text-align: left;
            border-bottom: 1px solid #e5e7eb;
          }
          .breakdown-table th {
            background: #f9fafb;
            font-weight: 600;
            color: #374151;
          }
          .breakdown-table td:last-child,
          .breakdown-table th:last-child {
            text-align: right;
          }
          .subtotal-row {
            font-weight: bold;
            background: #f3f4f6;
            border-top: 2px solid #d1d5db;
          }
          .total-row {
            font-weight: bold;
            background: #eff6ff;
            border-top: 2px solid #1BA2C4;
            font-size: 16px;
          }
          @media print {
            body { margin: 0; padding: 15px; }
            .summary-boxes { page-break-inside: avoid; }
            .breakdown-section { page-break-inside: avoid; }
            .company-logo { 
              height: 50px; 
              max-width: 200px;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .logo-container { 
              page-break-inside: avoid; 
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-info">
            <div class="logo-container">
              <img src="/decon-logo.png" alt="DC DECON Logo" class="company-logo" />
              <div class="company-text">
                <h1></h1>
                <p class="quote-title">Quote Summary</p>
              </div>
            </div>
          </div>
          <div class="date-info">
            ${formattedDate}
      </div>
          </div>

        <div class="summary-boxes">
          <div class="summary-box">
            <div class="box-label">Base</div>
            <div class="box-value">$${baseCost.toFixed(2)}</div>
                    </div>
          <div class="summary-box">
            <div class="box-label">Support</div>
            <div class="box-value">$${supportCost.toFixed(2)}</div>
                  </div>
          <div class="summary-box">
            <div class="box-label">Subtotal</div>
            <div class="box-value">$${subtotal.toFixed(2)}</div>
              </div>
          <div class="summary-box total-box">
            <div class="box-label">Total</div>
            <div class="box-value">$${total.toFixed(2)}</div>
                  </div>
              </div>

        <div class="details-section">
          <h3>Details</h3>
          <div class="detail-row">
            <span class="detail-label">Client:</span>
            <span class="detail-value">${client || '—'}</span>
                    </div>
          <div class="detail-row">
            <span class="detail-label">Region:</span>
            <span class="detail-value">${region || 'New South Wales'}</span>
                  </div>
          <div class="detail-row">
            <span class="detail-label">Product / SoR:</span>
            <span class="detail-value">${selectedProduct?.name || 'DCOOL RAC'} [SOR: sor_559]</span>
              </div>
          <div class="detail-row">
            <span class="detail-label">SOR Code:</span>
            <span class="detail-value">${sorCode || '—'}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Description:</span>
            <span class="detail-value">${sorDescription || '—'}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Risk:</span>
            <span class="detail-value">${riskUplift}% (x${riskMultiplier.toFixed(2)})</span>
          </div>
        </div>

        <div class="breakdown-section">
          <h3>Materials:</h3>
          <table class="breakdown-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Qty</th>
                <th>Unit cost</th>
                <th>Line total</th>
              </tr>
            </thead>
            <tbody>
              ${sampleMaterials.map(item => `
                <tr>
                  <td>${item.name}</td>
                  <td>${item.qty}</td>
                  <td>$${item.unitCost.toFixed(2)}</td>
                  <td>$${item.lineTotal.toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="breakdown-section">
          <h3>Tasks:</h3>
          <table class="breakdown-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Qty</th>
                <th>Unit cost</th>
                <th>Line total</th>
              </tr>
            </thead>
            <tbody>
              ${sampleTasks.map(item => `
                <tr>
                  <td>${item.name}</td>
                  <td>${item.qty}</td>
                  <td>$${item.unitCost.toFixed(2)}</td>
                  <td>$${item.lineTotal.toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="breakdown-section">
          <h3>Labour:</h3>
          <table class="breakdown-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Qty</th>
                <th>Unit cost</th>
                <th>Line total</th>
              </tr>
            </thead>
            <tbody>
              ${sampleLabour.map(item => `
                <tr>
                  <td>${item.name}</td>
                  <td>${item.qty}</td>
                  <td>$${item.unitCost.toFixed(2)}</td>
                  <td>$${item.lineTotal.toFixed(2)}</td>
                </tr>
              `).join('')}
              <tr class="subtotal-row">
                <td colspan="3">Base cost</td>
                <td>$${baseCost.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
              </div>

        ${additionalSupportItems.length > 0 ? `
        <div class="breakdown-section">
          <h3>Additional support:</h3>
          <table class="breakdown-table">
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Qty</th>
                <th>Unit cost</th>
                <th>Line total</th>
                    </tr>
                  </thead>
                  <tbody>
              ${additionalSupportItems.map(item => `
                <tr>
                  <td>${item.name || 'Unnamed item'}</td>
                  <td>${item.quantity}</td>
                  <td>$${item.unitCost.toFixed(2)}</td>
                  <td>$${item.total.toFixed(2)}</td>
                </tr>
              `).join('')}
              <tr class="subtotal-row">
                <td colspan="3">Additional support cost</td>
                <td>$${supportCost.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>
        ` : ''}

        <div class="breakdown-section">
          <table class="breakdown-table">
            <tbody>
              <tr class="total-row">
                <td colspan="3">Subtotal (before risk):</td>
                <td>$${subtotal.toFixed(2)}</td>
                      </tr>
                  </tbody>
                </table>
              </div>

        <script>
          // Auto-print when window loads
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 500);
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  return (
    <div className="rate-card-calculator">
      <div className="calculator-layout">
        {/* Left Panel - Form */}
        <div className="form-panel">
          <h2>Form - Rate Card Calculator</h2>
          
          <div className="form-group">
            <label>CLIENT:</label>
            <div className="input-with-dropdown">
              <input 
                type="text" 
                placeholder="Search or create a client..."
                value={client}
                onChange={(e) => setClient(e.target.value)}
              />
              <span className="dropdown-arrow">▼</span>
            </div>
          </div>

          <div className="form-group">
            <label>REGION:</label>
            <div className="input-with-dropdown">
              <input 
                type="text" 
                placeholder="Search or pick a region..."
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                list="regions"
              />
              <datalist id="regions">
                {regions.map(region => (
                  <option key={region} value={region} />
                ))}
              </datalist>
              <span className="dropdown-arrow">▼</span>
            </div>
          </div>

          <div className="form-group">
            <label>PRODUCT / SOR:</label>
            <div className="input-with-dropdown" style={{ position: 'relative' }}>
              <input 
                type="text" 
                placeholder={region ? "Select a product..." : "Select a region first..."}
                value={selectedProduct?.name || productSoR}
                onChange={(e) => {
                  const selectedProduct = products.find(p => p.name === e.target.value);
                  if (selectedProduct) {
                    // Always show popup when a valid product is selected, whether new or changing
                    handleProductSelection(selectedProduct.name);
                  } else {
                    // If typing a custom value, update directly
                    setProductSoR(e.target.value);
                  }
                }}
                onClick={handleProductInputClick}
                onFocus={() => {
                  // Clear the input when focusing to allow easy selection of different products
                  if (selectedProduct) {
                    setProductSoR('');
                  }
                }}
                disabled={!region}
                list="products"
                style={{
                  cursor: region ? 'pointer' : 'not-allowed',
                  paddingRight: selectedProduct ? '120px' : '40px'
                }}
              />
              <datalist id="products">
                {products.map(product => (
                  <option key={product.id} value={product.name} />
                ))}
              </datalist>
              {selectedProduct && (
                <div style={{
                  position: 'absolute',
                  right: '40px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: '12px',
                  color: '#6b7280',
                  pointerEvents: 'none',
                  fontStyle: 'italic'
                }}>
                  Click to change
                </div>
              )}
              <span className="dropdown-arrow">▼</span>
            </div>
          </div>

          <div className="form-group">
            <label>RISK UPLIFT (%):</label>
            <div className="risk-input-group">
              <input 
                type="number" 
                placeholder="e.g. 10"
                value={riskUplift}
                onChange={(e) => setRiskUplift(Number(e.target.value))}
                min="0"
              />
              <span className="multiplier-display">% Multiplier: x{riskMultiplier.toFixed(2)}</span>
            </div>
          </div>

          <div className="form-group">
            <label>ADDITIONAL SUPPORT:</label>
            <button className="add-item-btn" onClick={addAdditionalSupportItem}>
              + Add item
            </button>
            <p className="help-text">Each line: name, qty, unit cost.</p>
            
            {additionalSupportItems.map(item => (
              <div key={item.id} className="support-item">
                <input 
                  type="text" 
                  placeholder="Item name"
                  value={item.name}
                  onChange={(e) => updateAdditionalSupportItem(item.id, 'name', e.target.value)}
                />
                          <input 
                            type="number" 
                  placeholder="Qty"
                            value={item.quantity}
                  onChange={(e) => updateAdditionalSupportItem(item.id, 'quantity', Number(e.target.value))}
                            min="1"
                          />
                          <input 
                            type="number" 
                  placeholder="Unit cost"
                  value={item.unitCost}
                  onChange={(e) => updateAdditionalSupportItem(item.id, 'unitCost', Number(e.target.value))}
                            min="0"
                            step="0.01"
                          />
                <span className="item-total">${item.total.toFixed(2)}</span>
                          <button 
                  className="remove-btn"
                  onClick={() => removeAdditionalSupportItem(item.id)}
                          >
                  ×
                          </button>
              </div>
            ))}
          </div>

          <div className="form-actions">
            <button className="btn-save">Save</button>
            <button className="btn-draft">Draft</button>
          </div>
        </div>

        {/* Right Panel - Quote Summary */}
        <div className="quote-summary-panel">
          <div className="summary-header">
            <h2>Quote Summary</h2>
            <button className="download-pdf" onClick={generatePDF}>Download PDF</button>
          </div>

          <div className="summary-boxes">
            <div className="summary-box">
              <div className="box-label">Base</div>
              <div className="box-value">${baseCost.toFixed(2)}</div>
            </div>
            <div className="summary-box">
              <div className="box-label">Support</div>
              <div className="box-value">${additionalSupportCost.toFixed(2)}</div>
            </div>
            <div className="summary-box">
              <div className="box-label">Subtotal</div>
              <div className="box-value">${subtotal.toFixed(2)}</div>
            </div>
            <div className="summary-box total-box">
              <div className="box-label">Total</div>
              <div className="box-value">${total.toFixed(2)}</div>
              </div>
          </div>

          <div className="summary-details">
            <div className="detail-row">
              <span className="detail-label">Timestamp:</span>
              <span className="detail-value">{getCurrentTimestamp()}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Client:</span>
              <span className="detail-value">{client || '-'}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Region:</span>
              <span className="detail-value">{region || '-'}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Product / SoR:</span>
              <span className="detail-value">{selectedProduct?.name || '-'}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Risk (input):</span>
              <span className="detail-value">{riskUplift}% (x{riskMultiplier.toFixed(2)})</span>
            </div>
          </div>

          <div className="cost-breakdown">
            <h3>Base (from Product/SoR):</h3>
            <div className="breakdown-item">
              <span>Materials:</span>
              <span>{selectedProduct ? `$${selectedProduct.materials.toFixed(2)}` : 'No items'}</span>
            </div>
            <div className="breakdown-item">
              <span>Tasks:</span>
              <span>{selectedProduct ? `$${selectedProduct.tasks.toFixed(2)}` : 'No items'}</span>
            </div>
            <div className="breakdown-item">
              <span>Labour:</span>
              <span>{selectedProduct ? `$${selectedProduct.labour.toFixed(2)}` : 'No items'}</span>
            </div>
            <div className="breakdown-item">
              <span>Base cost:</span>
              <span>${baseCost.toFixed(2)}</span>
            </div>

            <h3>Additional support:</h3>
            {additionalSupportItems.length === 0 ? (
              <div className="breakdown-item">
                <span>No items</span>
              </div>
            ) : (
              additionalSupportItems.map(item => (
                <div key={item.id} className="breakdown-item">
                  <span>{item.name || 'Unnamed item'}:</span>
                  <span>${item.total.toFixed(2)}</span>
                </div>
              ))
            )}
            <div className="breakdown-item">
              <span>Additional support cost:</span>
              <span>${additionalSupportCost.toFixed(2)}</span>
            </div>

            <div className="breakdown-item">
              <span>Subtotal (before risk):</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="breakdown-item">
              <span>Risk multiplier:</span>
              <span>x{riskMultiplier.toFixed(2)}</span>
            </div>
            <div className="breakdown-item total-breakdown">
              <span>Total:</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>

          <div className="formula-section">
            <button 
              className="formula-toggle"
              onClick={() => setShowFormula(!showFormula)}
            >
              <span className={`arrow ${showFormula ? 'down' : 'right'}`}>▶</span>
              Show formula
            </button>
            {showFormula && (
              <div className="formula-content">
                <p>Total = (Base Cost + Additional Support) × (1 + Risk Uplift%)</p>
                <p>Total = (${baseCost.toFixed(2)} + ${additionalSupportCost.toFixed(2)}) × {riskMultiplier.toFixed(2)}</p>
                <p>Total = ${total.toFixed(2)}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Product Selection Popup */}
      {showProductPopup && selectedProductForPopup && (
        <div className="product-popup-overlay" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="product-popup" style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '32px',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          }}>
            <div style={{ marginBottom: '24px' }}>
              <h2 style={{ 
                margin: '0 0 8px 0', 
                fontSize: '24px', 
                fontWeight: '600', 
                color: '#1f2937' 
              }}>
                {selectedProduct ? 'Change Product Selection' : 'Product Details'}
              </h2>
              <p style={{ 
                margin: '0', 
                fontSize: '16px', 
                color: '#6b7280' 
              }}>
                {selectedProduct 
                  ? 'Review the new SOR details before confirming the change'
                  : 'Review the SOR details before confirming selection'
                }
              </p>
          </div>

            <div style={{ marginBottom: '24px' }}>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr', 
                gap: '16px',
                marginBottom: '20px'
              }}>
                <div>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '14px', 
                    fontWeight: '500', 
                    color: '#374151', 
                    marginBottom: '4px' 
                  }}>
                    SOR Code
                  </label>
                  <div style={{ 
                    padding: '12px', 
                    backgroundColor: '#f9fafb', 
                    borderRadius: '6px', 
                    border: '1px solid #e5e7eb',
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#1f2937'
                  }}>
                    {selectedProductForPopup.id}
                  </div>
                </div>
                <div>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '14px', 
                    fontWeight: '500', 
                    color: '#374151', 
                    marginBottom: '4px' 
                  }}>
                    Unit
                  </label>
                  <div style={{ 
                    padding: '12px', 
                    backgroundColor: '#f9fafb', 
                    borderRadius: '6px', 
                    border: '1px solid #e5e7eb',
                    fontSize: '16px',
                    color: '#1f2937'
                  }}>
                    {selectedProductForPopup.unit || 'per unit'}
            </div>
            </div>
          </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ 
                  display: 'block', 
                  fontSize: '14px', 
                  fontWeight: '500', 
                  color: '#374151', 
                  marginBottom: '4px' 
                }}>
                  Description
                </label>
                <div style={{ 
                  padding: '12px', 
                  backgroundColor: '#f9fafb', 
                  borderRadius: '6px', 
                  border: '1px solid #e5e7eb',
                  fontSize: '16px',
                  color: '#1f2937',
                  minHeight: '60px'
                }}>
                  {selectedProductForPopup.description || 'No description available'}
            </div>
            </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ 
                  display: 'block', 
                  fontSize: '14px', 
                  fontWeight: '500', 
                  color: '#374151', 
                  marginBottom: '4px' 
                }}>
                  Cost for {region || 'Selected Region'}
                </label>
                <div style={{ 
                  padding: '12px', 
                  backgroundColor: '#f0f9ff', 
                  borderRadius: '6px', 
                  border: '1px solid #0ea5e9',
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#0c4a6e'
                }}>
                  ${getRegionalCost(selectedProductForPopup, region || 'NSW').toLocaleString()}
            </div>
          </div>

              {region && selectedProductForPopup.regionalPricing && (
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '14px', 
                    fontWeight: '500', 
                    color: '#374151', 
                    marginBottom: '8px' 
                  }}>
                    Regional Pricing
                  </label>
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', 
                    gap: '8px' 
                  }}>
                    {Object.entries(selectedProductForPopup.regionalPricing).map(([reg, cost]) => (
                      <div key={reg} style={{
                        padding: '8px 12px',
                        backgroundColor: reg === region ? '#dbeafe' : '#f9fafb',
                        borderRadius: '4px',
                        border: reg === region ? '1px solid #3b82f6' : '1px solid #e5e7eb',
                        textAlign: 'center',
                        fontSize: '14px'
                      }}>
                        <div style={{ fontWeight: '500', color: '#374151' }}>{reg}</div>
                        <div style={{ fontWeight: '600', color: reg === region ? '#1d4ed8' : '#1f2937' }}>
                          ${cost.toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div style={{ 
              display: 'flex', 
              gap: '12px', 
              justifyContent: 'flex-end' 
            }}>
              <button 
                onClick={cancelProductSelection}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#f3f4f6',
                  color: '#374151',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '16px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => {
                  e.target.style.backgroundColor = '#e5e7eb';
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = '#f3f4f6';
                }}
              >
                Cancel
              </button>
              <button 
                onClick={confirmProductSelection}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#27A5C5',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '16px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => {
                  e.target.style.backgroundColor = '#1BA2C4';
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = '#27A5C5';
                }}
              >
                {selectedProduct ? 'Confirm Change' : 'Confirm Selection'}
              </button>
          </div>
        </div>
      </div>
      )}
    </div>
  );
};

export default Calculator;