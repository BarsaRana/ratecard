import React, { useState } from 'react';


interface QuoteItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface QuotesDetailProps {
  quoteId?: string;
}

const QuotesDetail: React.FC<QuotesDetailProps> = ({ quoteId }) => {
  const [quoteItems, setQuoteItems] = useState<QuoteItem[]>([
    { id: '1', description: 'Concrete Foundation Work', quantity: 1, unitPrice: 15000, total: 15000 },
    { id: '2', description: 'Steel Framework Installation', quantity: 1, unitPrice: 25000, total: 25000 },
    { id: '3', description: 'Electrical Installation', quantity: 1, unitPrice: 12000, total: 12000 }
  ]);

  const [clientInfo, setClientInfo] = useState({
    name: 'ABC Corporation',
    email: 'contact@abccorp.com',
    phone: '+1 (555) 123-4567',
    address: '123 Business St, City, State 12345'
  });

  const [quoteInfo, setQuoteInfo] = useState({
    quoteNumber: 'Q-2024-001',
    date: '2024-01-15',
    validUntil: '2024-02-15',
    projectName: 'Office Building Construction',
    status: 'Pending'
  });

  const addQuoteItem = () => {
    const newItem: QuoteItem = {
      id: Date.now().toString(),
      description: '',
      quantity: 1,
      unitPrice: 0,
      total: 0
    };
    setQuoteItems([...quoteItems, newItem]);
  };

  const updateQuoteItem = (id: string, field: keyof QuoteItem, value: string | number) => {
    setQuoteItems(items => 
      items.map(item => {
        if (item.id === id) {
          const updated = { ...item, [field]: value };
          if (field === 'quantity' || field === 'unitPrice') {
            updated.total = updated.quantity * updated.unitPrice;
          }
          return updated;
        }
        return item;
      })
    );
  };

  const removeQuoteItem = (id: string) => {
    setQuoteItems(items => items.filter(item => item.id !== id));
  };

  const subtotal = quoteItems.reduce((sum, item) => sum + item.total, 0);
  const tax = subtotal * 0.1; // 10% tax
  const total = subtotal + tax;

  return (
    <div className="quotes-detail-container">
      <div className="quote-header">
        <h1>Quote Details - {quoteInfo.quoteNumber}</h1>
        <div className="quote-status">
          <span className={`status-badge ${quoteInfo.status.toLowerCase()}`}>
            {quoteInfo.status}
          </span>
        </div>
      </div>

      {/* Quote Information */}
      <div className="quote-info-section">
        <h2>Quote Information</h2>
        <div className="info-grid">
          <div className="info-item">
            <label>Quote Number:</label>
            <input 
              type="text" 
              value={quoteInfo.quoteNumber}
              onChange={(e) => setQuoteInfo({...quoteInfo, quoteNumber: e.target.value})}
            />
          </div>
          <div className="info-item">
            <label>Date:</label>
            <input 
              type="date" 
              value={quoteInfo.date}
              onChange={(e) => setQuoteInfo({...quoteInfo, date: e.target.value})}
            />
          </div>
          <div className="info-item">
            <label>Valid Until:</label>
            <input 
              type="date" 
              value={quoteInfo.validUntil}
              onChange={(e) => setQuoteInfo({...quoteInfo, validUntil: e.target.value})}
            />
          </div>
          <div className="info-item">
            <label>Project Name:</label>
            <input 
              type="text" 
              value={quoteInfo.projectName}
              onChange={(e) => setQuoteInfo({...quoteInfo, projectName: e.target.value})}
            />
          </div>
        </div>
      </div>

      {/* Client Information */}
      <div className="client-info-section">
        <h2>Client Information</h2>
        <div className="client-grid">
          <div className="client-item">
            <label>Company Name:</label>
            <input 
              type="text" 
              value={clientInfo.name}
              onChange={(e) => setClientInfo({...clientInfo, name: e.target.value})}
            />
          </div>
          <div className="client-item">
            <label>Email:</label>
            <input 
              type="email" 
              value={clientInfo.email}
              onChange={(e) => setClientInfo({...clientInfo, email: e.target.value})}
            />
          </div>
          <div className="client-item">
            <label>Phone:</label>
            <input 
              type="tel" 
              value={clientInfo.phone}
              onChange={(e) => setClientInfo({...clientInfo, phone: e.target.value})}
            />
          </div>
          <div className="client-item">
            <label>Address:</label>
            <textarea 
              value={clientInfo.address}
              onChange={(e) => setClientInfo({...clientInfo, address: e.target.value})}
              rows={3}
            />
          </div>
        </div>
      </div>

      {/* Quote Items */}
      <div className="quote-items-section">
        <div className="section-header">
          <h2>Quote Items</h2>
          <button className="btn btn-primary" onClick={addQuoteItem}>
            Add Item
          </button>
        </div>
        
        <div className="quote-items-table">
          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Total</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {quoteItems.map(item => (
                <tr key={item.id}>
                  <td>
                    <input 
                      type="text" 
                      value={item.description}
                      onChange={(e) => updateQuoteItem(item.id, 'description', e.target.value)}
                      placeholder="Item description"
                    />
                  </td>
                  <td>
                    <input 
                      type="number" 
                      value={item.quantity}
                      onChange={(e) => updateQuoteItem(item.id, 'quantity', Number(e.target.value))}
                      min="1"
                    />
                  </td>
                  <td>
                    <input 
                      type="number" 
                      value={item.unitPrice}
                      onChange={(e) => updateQuoteItem(item.id, 'unitPrice', Number(e.target.value))}
                      min="0"
                      step="0.01"
                    />
                  </td>
                  <td>${item.total.toLocaleString()}</td>
                  <td>
                    <button 
                      className="btn btn-danger btn-sm"
                      onClick={() => removeQuoteItem(item.id)}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quote Summary */}
      <div className="quote-summary">
        <div className="summary-item">
          <span>Subtotal:</span>
          <span>${subtotal.toLocaleString()}</span>
        </div>
        <div className="summary-item">
          <span>Tax (10%):</span>
          <span>${tax.toLocaleString()}</span>
        </div>
        <div className="summary-item total">
          <span>Total:</span>
          <span>${total.toLocaleString()}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="quote-actions">
        <button className="btn btn-secondary">Save Draft</button>
        <button className="btn btn-primary">Send Quote</button>
        <button className="btn btn-success">Approve Quote</button>
      </div>
    </div>
  );
};

export default QuotesDetail;