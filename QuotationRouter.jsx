import React from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Dashboard from './Dashboard';
import Calculator from './Calculator';
import Quotes from './Quotes';
import './quote.css';

const QuotationRouter = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Handle navigation between quotation sub-pages
  const handleQuotationNavigation = (subPage) => {
    console.log('Button clicked, navigating to:', subPage);
    if (subPage === 'dashboard') {
      console.log('Navigating to dashboard');
      navigate('/dashboard');
    } else if (subPage === 'calculator') {
      console.log('Navigating to calculator');
      navigate('/calculator');
    } else if (subPage === 'quotes') {
      console.log('Navigating to quotes');
      navigate('/quotes');
    }
  };

  // Get current active page for button styling
  const getCurrentPage = () => {
    const path = location.pathname;
    if (path.includes('/calculator')) return 'calculator';
    if (path.includes('/quotes')) return 'quotes';
    return 'dashboard'; // default
  };

  const currentPage = getCurrentPage();

  // Debug logging
  console.log('Current location:', location.pathname);
  console.log('Current page:', currentPage);

  return (
    <>
      {/* Quotation Navigation Buttons */}
      <div className="quotation-nav-buttons" style={{display:'flex', gap:'16px', marginBottom:'32px', flexWrap:'wrap'}}>
        <button 
          className="btn btn-primary"
          style={{
            padding:'16px 24px',
            fontSize:'16px',
            fontWeight:'600',
            background: currentPage === 'dashboard' 
              ? 'linear-gradient(135deg,rgb(33, 35, 39) 0%,rgb(45, 55, 72) 100%)' 
              : 'linear-gradient(135deg,rgb(43, 45, 49) 0%,rgb(45, 48, 53) 100%)',
            border:'none',
            borderRadius:'12px',
            color:'white',
            cursor:'pointer',
            display:'flex',
            alignItems:'center',
            gap:'8px',
            boxShadow:'0 4px 12px rgba(165, 165, 165, 0.3)',
            transition:'all 0.2s ease'
          }}
          onClick={() => handleQuotationNavigation('dashboard')}
          onMouseOver={(e) => {
            if (currentPage !== 'dashboard') {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 20px rgba(167, 167, 167, 0.4)';
            }
          }}
          onMouseOut={(e) => {
            if (currentPage !== 'dashboard') {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 12px rgba(211, 211, 211, 0.3)';
            }
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <path d="M9 9h6v6H9z"></path>
          </svg>
          Dashboard
        </button>
        <button 
          className="btn btn-quotes"
          style={{
            padding:'16px 24px',
            fontSize:'16px',
            fontWeight:'600',
            background: currentPage === 'quotes' 
              ? 'linear-gradient(135deg,rgb(33, 35, 39) 0%,rgb(45, 55, 72) 100%)' 
              : 'linear-gradient(135deg,rgb(43, 45, 49) 0%,rgb(45, 48, 53) 100%)',
            border:'none',
            borderRadius:'12px',
            color:'white',
            cursor:'pointer',
            display:'flex',
            alignItems:'center',
            gap:'8px',
            boxShadow:'0 4px 12px rgba(74, 85, 104, 0.3)',
            transition:'all 0.2s ease'
          }}
          onClick={() => handleQuotationNavigation('quotes')}
          onMouseOver={(e) => {
            if (currentPage !== 'quotes') {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 20px rgba(74, 85, 104, 0.4)';
            }
          }}
          onMouseOut={(e) => {
            if (currentPage !== 'quotes') {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 12px rgba(74, 85, 104, 0.3)';
            }
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14,2 14,8 20,8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10,9 9,9 8,9"></polyline>
          </svg>
          Quotes
        </button>
      
        
        
        <button 
          className="btn btn-accent"
          style={{
            padding:'16px 24px',
            fontSize:'16px',
            fontWeight:'600',
            background: currentPage === 'calculator' 
              ? 'linear-gradient(135deg,rgb(33, 35, 39) 0%,rgb(45, 55, 72) 100%)' 
              : 'linear-gradient(135deg,rgb(43, 45, 49) 0%,rgb(45, 48, 53) 100%)',
            border:'none',
            borderRadius:'12px',
            color:'white',
            cursor:'pointer',
            display:'flex',
            alignItems:'center',
            gap:'8px',
            boxShadow:'0 4px 12px rgba(74, 85, 104, 0.3)',
            transition:'all 0.2s ease'
          }}
          onClick={() => handleQuotationNavigation('calculator')}
          onMouseOver={(e) => {
            if (currentPage !== 'calculator') {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 20px rgba(74, 85, 104, 0.4)';
            }
          }}
          onMouseOut={(e) => {
            if (currentPage !== 'calculator') {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 12px rgba(74, 85, 104, 0.3)';
            }
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <path d="M9 9h6v6H9z"></path>
            <path d="M9 1v6M15 1v6M9 17v6M15 17v6"></path>
          </svg>
          Calculator
        </button>
        </div>


             {/* Routes for different quotation pages */}
       <Routes>
         <Route path="/" element={<Dashboard />} />
         <Route path="/dashboard" element={<Dashboard />} />
         <Route path="/calculator" element={<Calculator />} />
         <Route path="/quotes" element={<Quotes />} />
       </Routes>
    </>
  );
};

export default QuotationRouter;
