import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000";
const fmtMoney = new Intl.NumberFormat(undefined, { style: "currency", currency: "AUD" });

export type QuoteRow = {
  id: number;
  client: string;
  region: string;
  product: string | null;
  risk: string | null;
  created_on: string; // ISO
  status: string;
  total_amount?: number | null;
};

function normalizeRow(b: any): QuoteRow {
  return {
    id: b.id ?? b.quote_id,
    client: b.client,
    region: b.region ?? b.state ?? "—",
    product: b.product ?? null,
    risk: b.risk ?? null,
    created_on: b.created_on ?? b.createdDateTime,
    status: String(b.status ?? "draft").toLowerCase(),
    total_amount: b.total_amount ?? null,
  };
}

function downloadCSV(filename: string, rows: QuoteRow[]) {
  const headers = ["ID","Client Name","Region","Product","Risk","Created On","Status","Total Cost"];
  const csv = [headers.join(",")]
    .concat(
      rows.map(r => [
        r.id,
        r.client,
        r.region,
        r.product ?? "",
        r.risk ?? "",
        new Date(r.created_on).toISOString(),
        r.status === "draft" ? "Draft" : "Sent",
        r.total_amount != null ? String(Number(r.total_amount)) : "",
      ]
      .map(x => typeof x === "string" && /[",\n]/.test(x) ? `"${x.replace(/"/g, '""')}"` : String(x))
      .join(","))
    ).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

function StatusBadge({ status }: { status: string }) {
  const display = status === "draft" ? "Draft" : "Sent";
  const bg = status === "draft" ? "#f1f5f9" : "#dcfce7";
  const color = status === "draft" ? "#334155" : "#166534";
  return (
    <span style={{
      background: bg,
      color,
      borderRadius: 10,
      padding: "4px 14px",
      fontSize: 13,
      fontWeight: 600,
      border: "1px solid #e2e8ee",
      display: "inline-block"
    }}>
      {display}
    </span>
  );
}

// Quote creation modal with quote details functionality
function CreateQuoteModal({ onClose, onSendQuote }: { onClose: () => void; onSendQuote: (quoteData: any) => void }) {
  const [quoteItems, setQuoteItems] = useState([
    { id: '1', description: 'Concrete Foundation Work', quantity: 1, unitPrice: 15000, total: 15000 },
    { id: '2', description: 'Steel Framework Installation', quantity: 1, unitPrice: 25000, total: 25000 },
    { id: '3', description: 'Electrical Installation', quantity: 1, unitPrice: 12000, total: 12000 }
  ]);

  const [clientInfo, setClientInfo] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });

  const [quoteInfo, setQuoteInfo] = useState({
    quoteNumber: `Q-${new Date().getFullYear()}-${String(Date.now()).slice(-3)}`,
    date: new Date().toISOString().split('T')[0],
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    projectName: '',
    status: 'Draft'
  });

  const addQuoteItem = () => {
    const newItem = {
      id: Date.now().toString(),
      description: '',
      quantity: 1,
      unitPrice: 0,
      total: 0
    };
    setQuoteItems([...quoteItems, newItem]);
  };

  const updateQuoteItem = (id: string, field: string, value: string | number) => {
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

  const handleSendQuote = () => {
    // Basic validation
    if (!clientInfo.name.trim()) {
      alert('Please enter a client name');
      return;
    }
    if (!quoteInfo.projectName.trim()) {
      alert('Please enter a project name');
      return;
    }
    if (quoteItems.length === 0) {
      alert('Please add at least one quote item');
      return;
    }

    const quoteData = {
      id: Date.now(), // Generate unique ID
      client: clientInfo.name,
      region: 'NSW', // Default region, could be made configurable
      product: quoteInfo.projectName,
      risk: 'Standard', // Default risk, could be made configurable
      created_on: new Date().toISOString(),
      status: 'sent',
      total_amount: total,
      quoteInfo,
      clientInfo,
      quoteItems,
      subtotal,
      tax,
      total
    };
    
    onSendQuote(quoteData);
    onClose();
  };

  const handleSaveDraft = () => {
    // Basic validation for draft (less strict)
    if (!clientInfo.name.trim()) {
      alert('Please enter a client name');
      return;
    }

    const quoteData = {
      id: Date.now(), // Generate unique ID
      client: clientInfo.name,
      region: 'NSW', // Default region, could be made configurable
      product: quoteInfo.projectName || 'Draft Project',
      risk: 'Standard', // Default risk, could be made configurable
      created_on: new Date().toISOString(),
      status: 'draft',
      total_amount: total,
      quoteInfo,
      clientInfo,
      quoteItems,
      subtotal,
      tax,
      total
    };
    
    onSendQuote(quoteData);
    onClose();
  };

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
      background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center",
      overflow: "auto", padding: "20px"
    }}>
      <div style={{
        background: "#fff", borderRadius: 16, boxShadow: "0 8px 32px rgba(14,30,59,.14)",
        padding: "32px", minWidth: 800, maxWidth: 1000, position: "relative", maxHeight: "90vh", overflow: "auto"
      }}>
        <button
          style={{
            position: "absolute", top: 16, right: 16, background: "none",
            border: "none", fontSize: 22, cursor: "pointer", color: "#334155"
          }}
          onClick={onClose}
          aria-label="Close"
        >×</button>
        
        <h2 style={{marginTop:0,marginBottom:24,fontWeight:700,fontSize:24}}>Create New Quote</h2>
        
        {/* Quote Information */}
        <div style={{marginBottom:24}}>
          <h3 style={{marginBottom:16,fontSize:18,fontWeight:600}}>Quote Information</h3>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:16}}>
            <div>
              <label style={{display:"block",marginBottom:4,fontSize:14,fontWeight:500}}>Quote Number:</label>
              <input 
                type="text" 
                value={quoteInfo.quoteNumber}
                onChange={(e) => setQuoteInfo({...quoteInfo, quoteNumber: e.target.value})}
                style={{width:"100%",padding:"8px 12px",borderRadius:8,border:"1px solid #dbeafe",fontSize:14}}
              />
            </div>
            <div>
              <label style={{display:"block",marginBottom:4,fontSize:14,fontWeight:500}}>Date:</label>
              <input 
                type="date" 
                value={quoteInfo.date}
                onChange={(e) => setQuoteInfo({...quoteInfo, date: e.target.value})}
                style={{width:"100%",padding:"8px 12px",borderRadius:8,border:"1px solid #dbeafe",fontSize:14}}
              />
            </div>
            <div>
              <label style={{display:"block",marginBottom:4,fontSize:14,fontWeight:500}}>Valid Until:</label>
              <input 
                type="date" 
                value={quoteInfo.validUntil}
                onChange={(e) => setQuoteInfo({...quoteInfo, validUntil: e.target.value})}
                style={{width:"100%",padding:"8px 12px",borderRadius:8,border:"1px solid #dbeafe",fontSize:14}}
              />
            </div>
            <div>
              <label style={{display:"block",marginBottom:4,fontSize:14,fontWeight:500}}>Project Name:</label>
              <input 
                type="text" 
                value={quoteInfo.projectName}
                onChange={(e) => setQuoteInfo({...quoteInfo, projectName: e.target.value})}
                placeholder="Enter project name"
                style={{width:"100%",padding:"8px 12px",borderRadius:8,border:"1px solid #dbeafe",fontSize:14}}
              />
            </div>
          </div>
        </div>

        {/* Client Information */}
        <div style={{marginBottom:24}}>
          <h3 style={{marginBottom:16,fontSize:18,fontWeight:600}}>Client Information</h3>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:16}}>
            <div>
              <label style={{display:"block",marginBottom:4,fontSize:14,fontWeight:500}}>Company Name:</label>
              <input 
                type="text" 
                value={clientInfo.name}
                onChange={(e) => setClientInfo({...clientInfo, name: e.target.value})}
                placeholder="Enter company name"
                style={{width:"100%",padding:"8px 12px",borderRadius:8,border:"1px solid #dbeafe",fontSize:14}}
              />
            </div>
            <div>
              <label style={{display:"block",marginBottom:4,fontSize:14,fontWeight:500}}>Email:</label>
              <input 
                type="email" 
                value={clientInfo.email}
                onChange={(e) => setClientInfo({...clientInfo, email: e.target.value})}
                placeholder="Enter email"
                style={{width:"100%",padding:"8px 12px",borderRadius:8,border:"1px solid #dbeafe",fontSize:14}}
              />
            </div>
            <div>
              <label style={{display:"block",marginBottom:4,fontSize:14,fontWeight:500}}>Phone:</label>
              <input 
                type="tel" 
                value={clientInfo.phone}
                onChange={(e) => setClientInfo({...clientInfo, phone: e.target.value})}
                placeholder="Enter phone number"
                style={{width:"100%",padding:"8px 12px",borderRadius:8,border:"1px solid #dbeafe",fontSize:14}}
              />
            </div>
            <div style={{gridColumn:"1/-1"}}>
              <label style={{display:"block",marginBottom:4,fontSize:14,fontWeight:500}}>Address:</label>
              <textarea 
                value={clientInfo.address}
                onChange={(e) => setClientInfo({...clientInfo, address: e.target.value})}
                placeholder="Enter address"
                rows={3}
                style={{width:"100%",padding:"8px 12px",borderRadius:8,border:"1px solid #dbeafe",fontSize:14,resize:"vertical"}}
              />
            </div>
          </div>
        </div>

        {/* Quote Items */}
        <div style={{marginBottom:24}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
            <h3 style={{margin:0,fontSize:18,fontWeight:600}}>Quote Items</h3>
            <button className="btn primary" onClick={addQuoteItem} style={{padding:"8px 16px",fontSize:14}}>
              Add Item
            </button>
          </div>
          
          <div style={{overflow:"auto",border:"1px solid #e6e8ee",borderRadius:8}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:14}}>
              <thead style={{background:"#f3f6ff"}}>
                <tr>
                  <th style={{padding:"12px",textAlign:"left",fontWeight:600}}>Description</th>
                  <th style={{padding:"12px",textAlign:"center",fontWeight:600}}>Quantity</th>
                  <th style={{padding:"12px",textAlign:"center",fontWeight:600}}>Unit Price</th>
                  <th style={{padding:"12px",textAlign:"center",fontWeight:600}}>Total</th>
                  <th style={{padding:"12px",textAlign:"center",fontWeight:600}}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {quoteItems.map(item => (
                  <tr key={item.id} style={{borderTop:"1px solid #e6e8ee"}}>
                    <td style={{padding:"12px"}}>
                      <input 
                        type="text" 
                        value={item.description}
                        onChange={(e) => updateQuoteItem(item.id, 'description', e.target.value)}
                        placeholder="Item description"
                        style={{width:"100%",padding:"6px 8px",borderRadius:6,border:"1px solid #dbeafe",fontSize:14}}
                      />
                    </td>
                    <td style={{padding:"12px",textAlign:"center"}}>
                      <input 
                        type="number" 
                        value={item.quantity}
                        onChange={(e) => updateQuoteItem(item.id, 'quantity', Number(e.target.value))}
                        min="1"
                        style={{width:"80px",padding:"6px 8px",borderRadius:6,border:"1px solid #dbeafe",fontSize:14,textAlign:"center"}}
                      />
                    </td>
                    <td style={{padding:"12px",textAlign:"center"}}>
                      <input 
                        type="number" 
                        value={item.unitPrice}
                        onChange={(e) => updateQuoteItem(item.id, 'unitPrice', Number(e.target.value))}
                        min="0"
                        step="0.01"
                        style={{width:"100px",padding:"6px 8px",borderRadius:6,border:"1px solid #dbeafe",fontSize:14,textAlign:"center"}}
                      />
                    </td>
                    <td style={{padding:"12px",textAlign:"center",fontWeight:600}}>
                      {fmtMoney.format(item.total)}
                    </td>
                    <td style={{padding:"12px",textAlign:"center"}}>
                      <button 
                        className="btn secondary"
                        onClick={() => removeQuoteItem(item.id)}
                        style={{padding:"4px 8px",fontSize:12,background:"#fee2e2",color:"#be123c",border:"1px solid #fecaca"}}
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
        <div style={{marginBottom:24,padding:"16px",background:"#f9fafc",borderRadius:8,border:"1px solid #e6e8ee"}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
            <span style={{fontSize:14}}>Subtotal:</span>
            <span style={{fontSize:14,fontWeight:600}}>{fmtMoney.format(subtotal)}</span>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
            <span style={{fontSize:14}}>Tax (10%):</span>
            <span style={{fontSize:14,fontWeight:600}}>{fmtMoney.format(tax)}</span>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",paddingTop:8,borderTop:"1px solid #e6e8ee"}}>
            <span style={{fontSize:16,fontWeight:700}}>Total:</span>
            <span style={{fontSize:16,fontWeight:700}}>{fmtMoney.format(total)}</span>
          </div>
        </div>

        {/* Actions */}
        <div style={{display:"flex",gap:12,justifyContent:"flex-end"}}>
          <button className="btn secondary" onClick={onClose} style={{padding:"10px 20px"}}>
            Cancel
          </button>
          <button className="btn secondary" onClick={handleSaveDraft} style={{padding:"10px 20px"}}>
            Save Draft
          </button>
          <button className="btn primary" onClick={handleSendQuote} style={{padding:"10px 20px"}}>
            Send Quote
          </button>
        </div>
      </div>
    </div>
  );
}

// Quote summary modal
function QuoteSummaryModal({ quote, onClose }: { quote: QuoteRow | null; onClose: () => void }) {
  if (!quote) return null;
  return (
    <div style={{
      position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
      background: "rgba(0,0,0,0.25)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center"
    }}>
      <div style={{
        background: "#fff", borderRadius: 16, boxShadow: "0 8px 32px rgba(14,30,59,.14)",
        padding: "32px 28px", minWidth: 340, maxWidth: 440, position: "relative"
      }}>
        <button
          style={{
            position: "absolute", top: 16, right: 16, background: "none",
            border: "none", fontSize: 22, cursor: "pointer", color: "#334155"
          }}
          onClick={onClose}
          aria-label="Close"
        >×</button>
        <h2 style={{marginTop:0,marginBottom:18,fontWeight:700,fontSize:21}}>Quote Summary</h2>
        <div style={{marginBottom:13}}>
          <strong>Client:</strong> {quote.client ?? "—"}
        </div>
        <div style={{marginBottom:13}}>
          <strong>Region:</strong> {quote.region ?? "—"}
        </div>
        <div style={{marginBottom:13}}>
          <strong>Product:</strong> {quote.product ?? "—"}
        </div>
        <div style={{marginBottom:13}}>
          <strong>Risk:</strong> {quote.risk ?? "—"}
        </div>
        <div style={{marginBottom:13}}>
          <strong>Date:</strong> {new Date(quote.created_on).toLocaleDateString(undefined, { day:"2-digit", month:"short", year:"numeric" })}{" "}
          <span style={{color:"#64748b",fontSize:13}}>{new Date(quote.created_on).toLocaleTimeString()}</span>
        </div>
        <div style={{marginBottom:13}}>
          <strong>Status:</strong> <StatusBadge status={quote.status} />
        </div>
        <div style={{marginBottom:13}}>
          <strong>Total Cost:</strong> {quote.total_amount != null ? fmtMoney.format(Number(quote.total_amount)) : "—"}
        </div>
        <div style={{marginTop:30,textAlign:"center"}}>
          <button className="btn secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

export default function QuotesPage() {
  // const navigate = useNavigate(); // Not needed for modal

  // filters
  const [showFilters, setShowFilters] = useState(false);
  const [clientF, setClientF] = useState("");
  const [regionF, setRegionF] = useState("");
  const [productF, setProductF] = useState("");
  const [statusF, setStatusF] = useState<string>("");
  const [fromF, setFromF] = useState<string>("");
  const [toF, setToF] = useState<string>("");
  const [costMin, setCostMin] = useState<string>("");
  const [costMax, setCostMax] = useState<string>("");
  const [q, setQ] = useState("");

  // list state
  const [rows, setRows] = useState<QuoteRow[]>([]);
  const [localQuotes, setLocalQuotes] = useState<QuoteRow[]>([
    // Sample quotes for testing
    {
      id: 1001,
      client: 'ABC Corporation',
      region: 'NSW',
      product: 'Office Building Construction',
      risk: 'Standard',
      created_on: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      status: 'sent',
      total_amount: 125000
    },
    {
      id: 1002,
      client: 'XYZ Ltd',
      region: 'VIC',
      product: 'Warehouse Renovation',
      risk: 'High',
      created_on: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
      status: 'draft',
      total_amount: 85000
    }
  ]); // Store locally created quotes
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // sorting & pagination
  const [sortKey, setSortKey] = useState<keyof QuoteRow>("created_on");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modal state
  const [selectedQuote, setSelectedQuote] = useState<QuoteRow | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Handle new quote creation
  const handleNewQuote = (quoteData: any) => {
    const newQuote: QuoteRow = {
      id: quoteData.id,
      client: quoteData.client || 'Unnamed Client',
      region: quoteData.region || 'NSW',
      product: quoteData.product || 'No Product',
      risk: quoteData.risk || 'Standard',
      created_on: quoteData.created_on,
      status: quoteData.status,
      total_amount: quoteData.total_amount
    };
    
    // Add the new quote to the local quotes array
    setLocalQuotes(prevLocal => [newQuote, ...prevLocal]);
    
    // Show success message
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 3000); // Hide after 3 seconds
    
    console.log('New quote created:', newQuote);
  };

  function buildParams() {
    const u = new URLSearchParams();
    if (clientF.trim()) u.set("client", clientF.trim());
    if (regionF.trim()) u.set("region", regionF.trim());
    if (productF.trim()) u.set("product", productF.trim());
    if (statusF) u.set("status", statusF);
    if (fromF) u.set("created_from", fromF);
    if (toF) u.set("created_to", toF);
    if (q.trim()) u.set("q", q.trim());
    u.set("limit", "500");
    u.set("offset", "0");
    return u.toString();
  }

  useEffect(() => {
    const ac = new AbortController();
    const t = setTimeout(async () => {
      try {
        setLoading(true); setErr(null);
        const params = buildParams();
        const r = await fetch(`${API_BASE}/quotes?${params}`, { signal: ac.signal, headers: { "Content-Type": "application/json" }});
        if (!r.ok) throw new Error(`${r.status} ${r.statusText}: ${await r.text()}`);
        const json = await r.json();
        setRows((json as any[]).map(normalizeRow));
        setPage(1);
      } catch (e: any) {
        if (e?.name !== "AbortError") {
          // If API fails, just set empty array and continue with local quotes
          setRows([]);
          console.log('API not available, using local quotes only:', e?.message);
        }
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => { ac.abort(); clearTimeout(t); };
  }, [clientF, regionF, productF, statusF, fromF, toF, q]);

  // Combine API data and local quotes
  const allRows = useMemo(() => {
    const combined = [...localQuotes, ...rows];
    console.log('Combined quotes data:', { localQuotes: localQuotes.length, apiRows: rows.length, total: combined.length });
    return combined;
  }, [localQuotes, rows]);

  // Apply cost filters client-side
  const filteredRows = useMemo(() => {
    return allRows.filter(row => {
      let pass = true;
      if (costMin && row.total_amount != null) pass = pass && Number(row.total_amount) >= Number(costMin);
      if (costMax && row.total_amount != null) pass = pass && Number(row.total_amount) <= Number(costMax);
      return pass;
    });
  }, [allRows, costMin, costMax]);

  const sorted = useMemo(() => {
    const copy = [...filteredRows];
    copy.sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      let res = 0;
      if (sortKey === "created_on") {
        res = new Date(av as string).getTime() - new Date(bv as string).getTime();
      } else if (sortKey === "total_amount") {
        res = Number(av ?? 0) - Number(bv ?? 0);
      } else {
        res = String(av ?? "").localeCompare(String(bv ?? ""), undefined, { numeric: true });
      }
      return sortDir === "asc" ? res : -res;
    });
    return copy;
  }, [filteredRows, sortKey, sortDir]);

  const total = sorted.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const paged = useMemo(() => {
    const start = (page - 1) * pageSize;
    const result = sorted.slice(start, start + pageSize);
    console.log('Pagination debug:', { total, totalPages, page, pageSize, start, resultLength: result.length });
    return result;
  }, [sorted, page, pageSize]);

  function toggleSort(key: keyof QuoteRow) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  }

  return (
    <div style={{
      background: "#f6f7fb",
      minHeight: "100vh",
      padding: "32px 0",
    }}>
      <style>{`
        .quotes-container { max-width: 1200px; margin: 0 auto; }
        .card { background: #fff; border-radius: 20px; box-shadow: 0 8px 32px rgba(14,30,59,.07); border: 1px solid #e6e8ee; }
        .card.padded { padding: 32px; }
        .table-wrap { overflow-x: auto; border-radius: 16px; margin-top: 18px; }
        table { width: 100%; border-collapse: collapse; font-size: 15px; background: #fff; }
        th, td { padding: 15px 14px; }
        th { background: #f3f6ff; font-weight: 700; position: sticky; top: 0; z-index: 2;}
        tbody tr.zebra { background: #fafcff; }
        .status-pill { border-radius: 10px; padding: 4px 12px; font-size: 12px; font-weight: 600; }
        .avatar { width: 34px; height: 34px; border-radius: 50%; background: #e2e8f0; color: #334155; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 18px; }
        .actions { display: flex; gap: 12px; }
        .btn, button { border-radius: 12px; padding: 10px 16px; font-weight: 700; cursor: pointer; border: 1px solid #dbeafe; background: #fff; transition: box-shadow .13s, background .13s; }
        .btn.primary { background: #1BA2C4; color: #fff; border: none; }
        .btn.secondary { background: #fff; color: #1e293b; }
        .btn:active { box-shadow: 0 2px 8px rgba(0,0,0,.08); }
        .pagination { display: flex; align-items: center; gap: 10px; }
        .filters-panel { margin: 22px 0 0 0; padding: 20px; background: #f9fafc; border-radius: 14px; border: 1px solid #e6e8ee; display: grid; grid-template-columns: repeat(auto-fit,minmax(180px,1fr)); gap: 18px;}
        .filters-panel input, .filters-panel select { padding: 8px 11px; border-radius: 9px; border: 1px solid #dbeafe; font-size: 15px;}
        @media(max-width:900px){.quotes-container{max-width:100vw;padding:0 10px}.card.padded{padding:16px}.filters-panel{grid-template-columns:1fr}}
        /* Center Estimated Cost (3rd), Status (5th), Action (6th) columns */
        th:nth-child(3), th:nth-child(5), th:nth-child(6),
        td:nth-child(3), td:nth-child(5), td:nth-child(6) {
          text-align: center;
        }
      `}</style>
      <div className="quotes-container">
        {/* Top actions and search */}
        <div className="card padded" style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 18 }}>
            <input
              style={{ flex: 1, minWidth: 220, borderRadius: 12, border: "1px solid #dbeafe", padding: "11px 16px", fontSize: 16 }}
              placeholder="Search quotes… (client, region, product, risk, etc.)"
              value={q}
              onChange={e => setQ(e.target.value)}
            />
            <div className="actions">
              <button className="btn secondary" onClick={() => setShowFilters(f => !f)}>
                {showFilters ? "Hide Filters" : "Filters"}
              </button>
              <button className="btn primary" onClick={() => setShowCreateModal(true)}>+ Create Quote</button>
            </div>
          </div>
          {/* Filters panel */}
          {showFilters && (
            <div className="filters-panel">
              <input placeholder="Client Name" value={clientF} onChange={e => setClientF(e.target.value)} />
              <input placeholder="Region" value={regionF} onChange={e => setRegionF(e.target.value)} />
              <input placeholder="Product" value={productF} onChange={e => setProductF(e.target.value)} />
              <select value={statusF} onChange={e => setStatusF(e.target.value)}>
                <option value="">Status</option>
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
              </select>
              <input type="date" value={fromF} onChange={e => setFromF(e.target.value)} />
              <input type="date" value={toF} onChange={e => setToF(e.target.value)} />
              <input type="number" min={0} placeholder="Min Total Cost" value={costMin} onChange={e => setCostMin(e.target.value)} />
              <input type="number" min={0} placeholder="Max Total Cost" value={costMax} onChange={e => setCostMax(e.target.value)} />
            </div>
          )}
          <div style={{ marginTop: 18, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ color: "#64748b", fontSize: 14 }}>{loading ? "Loading…" : `${total} result${total === 1 ? "" : "s"}`}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button className="btn secondary" onClick={() => downloadCSV("quotes.csv", sorted)}>Export CSV</button>
              <span style={{ fontSize: 13, color: "#64748b" }}>Rows/page</span>
              <select style={{ borderRadius: 7, padding: "4px 9px" }} value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}>
                {[10, 20, 50, 100].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
          </div>
        </div>
        {/* Table */}
        <div className="card" style={{ marginBottom: 22 }}>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th onClick={() => toggleSort("client")}>Client Name {sortKey === "client" && (sortDir === "asc" ? "▲" : "▼")}</th>
                  <th onClick={() => toggleSort("product")}>Product {sortKey === "product" && (sortDir === "asc" ? "▲" : "▼")}</th>
                  <th onClick={() => toggleSort("total_amount")}>Total Cost {sortKey === "total_amount" && (sortDir === "asc" ? "▲" : "▼")}</th>
                  <th onClick={() => toggleSort("created_on")}>Date {sortKey === "created_on" && (sortDir === "asc" ? "▲" : "▼")}</th>
                  <th onClick={() => toggleSort("status")}>Status {sortKey === "status" && (sortDir === "asc" ? "▲" : "▼")}</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  [...Array(8)].map((_, i) => (
                    <tr key={i}>
                      <td colSpan={6}><div style={{ height: 20, background: "#f1f5f9", borderRadius: 5 }} /></td>
                    </tr>
                  ))
                )}
                {!loading && !err && paged.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ textAlign: "center", padding: "32px 0", color: "#64748b", fontSize: 15 }}>No quotes match your filters.</td>
                  </tr>
                )}
                {!loading && !err && paged.map((r, idx) => (
                  <tr key={r.id} className={idx % 2 === 0 ? "zebra" : ""} style={{ transition: "background .13s" }}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div className="avatar">{r.client?.slice(0, 1).toUpperCase() || "?"}</div>
                        <div>
                          <div style={{ fontWeight: 500 }}>{r.client || "—"}</div>
                          <div style={{ fontSize: 13, color: "#64748b" }}>#{r.id} • {r.region}</div>
                        </div>
                      </div>
                    </td>
                    <td>{r.product ?? "—"}</td>
                    <td>{r.total_amount != null ? fmtMoney.format(Number(r.total_amount)) : "—"}</td>
                    <td>
                      <div>{new Date(r.created_on).toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" })}</div>
                      <div style={{ fontSize: 13, color: "#64748b" }}>{new Date(r.created_on).toLocaleTimeString()}</div>
                    </td>
                    <td>
                      <StatusBadge status={r.status} />
                    </td>
                    <td>
                      <button className="btn secondary" onClick={() => setSelectedQuote(r)}>View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Pagination footer */}
          <div className="pagination" style={{ padding: "16px", justifyContent: "space-between", alignItems: "center", background: "#f3f6ff", borderTop: "1px solid #e6e8ee" }}>
            <div>Page {page} of {totalPages}</div>
            <div>
              <button className="btn secondary" style={{ marginRight: 4 }} disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}>Prev</button>
              <button className="btn secondary" disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>Next</button>
            </div>
          </div>
        </div>
        {/* Success message */}
        {showSuccessMessage && (
          <div className="card padded" style={{ background: "#dcfce7", color: "#166534", marginBottom: 14, border: "1px solid #bbf7d0" }}>
            ✅ Quote created successfully! It has been added to the quotes list.
          </div>
        )}
        
        {/* Error banner */}
        {err && (
          <div className="card padded" style={{ background: "#fee2e2", color: "#be123c", marginBottom: 14 }}>
            {err}
          </div>
        )}
        {/* Quote summary modal */}
        <QuoteSummaryModal quote={selectedQuote} onClose={() => setSelectedQuote(null)} />
        {/* Create quote modal */}
        {showCreateModal && <CreateQuoteModal onClose={() => setShowCreateModal(false)} onSendQuote={handleNewQuote} />}
      </div>
    </div>
  );
}