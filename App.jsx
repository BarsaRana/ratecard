  import React, { useState, useRef, useEffect } from 'react';
  import MaterialModal from './MaterialModal';
  import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
  import QuotationRouter from './QuotationRouter';
  import './App.css';

  // Main App Content Component (without Router wrapper)
  function AppContent() {
    // Dashboard mode state
    const [dashboardMode, setDashboardMode] = useState('admin'); // 'admin' or 'user'
    
    const [currentPage, setCurrentPage] = useState('dashboard');
    const [inventoryTab, setInventoryTab] = useState('materials');
    const [inventoryMaterialSearch, setInventoryMaterialSearch] = useState('');
    const [inventoryEquipmentSearch, setInventoryEquipmentSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [activeTab, setActiveTab] = useState('materials');
    const [editingMaterial, setEditingMaterial] = useState(null);
    const [viewingMaterial, setViewingMaterial] = useState(null);
    
    // Edit project modal states
    const [editingProject, setEditingProject] = useState(null);
    const [showEditProjectModal, setShowEditProjectModal] = useState(false);
    const [editProjectForm, setEditProjectForm] = useState({});
    
    // Project Rate Card states
    const [selectedMaterials, setSelectedMaterials] = useState([]);
    const [selectedEquipment, setSelectedEquipment] = useState([]);
    const [selectedLabor, setSelectedLabor] = useState([]); // New: Labor items array
    const [projectMaterialFilter, setProjectMaterialFilter] = useState('');
    const [projectEquipmentFilter, setProjectEquipmentFilter] = useState('');
    const [showMaterialSuggestions, setShowMaterialSuggestions] = useState(false);
    const [showEquipmentSuggestions, setShowEquipmentSuggestions] = useState(false);
    // Task creation states
    const [newTaskDesc, setNewTaskDesc] = useState('');
    const [taskPersons, setTaskPersons] = useState(1);
    const [taskHours, setTaskHours] = useState(8);
    const [labourType, setLabourType] = useState('installation');
    const [labourState, setLabourState] = useState('NSW');
    const [showTaskLaborPanel, setShowTaskLaborPanel] = useState(false);
    const [taskLaborPersons, setTaskLaborPersons] = useState(1);
    const [taskLaborHours, setTaskLaborHours] = useState(8);
    const [taskLaborNotice, setTaskLaborNotice] = useState('');
    // Get labor rate from admin-configured labourRoles with state adjustments
    const getLaborRateFromAdmin = (laborType, state = 'NSW') => {
      const role = labourRoles.find(r => r.type === laborType && r.state === state);
      if (role) {
        return getEffectiveRate(role);
      }
      // Fallback: find any role with this type and apply state adjustment
      const fallbackRole = labourRoles.find(r => r.type === laborType);
      if (fallbackRole) {
        const adjustedRole = { ...fallbackRole, state: state };
        return getEffectiveRate(adjustedRole);
      }
      return 0;
    };

    // Get available labor types from admin configuration
    const getAvailableLaborTypes = () => {
      return labourRoles.map(role => role.type);
    };

    // Add new labor type
    const addNewLaborType = () => {
      const newType = prompt('Enter new labor type name:');
      if (newType && newType.trim()) {
        const trimmedType = newType.trim().toLowerCase();
        // Check if type already exists
        if (labourRoles.find(role => role.type === trimmedType)) {
          alert('This labor type already exists!');
          return;
        }
        
        // Prompt for price
        const priceInput = prompt(`Enter base rate for ${trimmedType} ($/hr):`);
        const baseRate = parseFloat(priceInput) || 0;
        
        // Add new labor role with the new type and price
        setLabourRoles(prev => [
          ...prev,
          { 
            id: `LR${Date.now()}`, 
            type: trimmedType, 
            baseRate: baseRate, 
            state: 'NSW',
            stateAdjustment: 0
          }
        ]);
      }
    };

    // Delete labor type
    const deleteLaborType = (typeToDelete) => {
      if (window.confirm(`Are you sure you want to delete the labor type "${typeToDelete}"?\n\nThis will remove all roles with this type.`)) {
        setLabourRoles(prev => prev.filter(role => role.type !== typeToDelete));
      }
    };

    // Get unique labor types
    const getUniqueLaborTypes = () => {
      return Array.from(new Set(labourRoles.map(role => role.type)));
    };

    // Filter materials based on search term
    const getFilteredMaterials = () => {
      if (!inventoryMaterialSearch.trim()) {
        return materials.filter(m => !isTaskMaterial(m));
      }
      const searchTerm = inventoryMaterialSearch.toLowerCase();
      return materials.filter(m => 
        !isTaskMaterial(m) && (
          m.id.toLowerCase().includes(searchTerm) ||
          m.description.toLowerCase().includes(searchTerm) ||
          m.salesPartNo.toLowerCase().includes(searchTerm) ||
          m.site.toLowerCase().includes(searchTerm)
        )
      );
    };

    // Filter equipment based on search term
    const getFilteredEquipment = () => {
      if (!inventoryEquipmentSearch.trim()) {
        return equipment;
      }
      const searchTerm = inventoryEquipmentSearch.toLowerCase();
      return equipment.filter(e => 
        e.id.toLowerCase().includes(searchTerm) ||
        e.name.toLowerCase().includes(searchTerm) ||
        e.category.toLowerCase().includes(searchTerm) ||
        e.site.toLowerCase().includes(searchTerm)
      );
    };


    // User Labour tab data
    const [labourRoles, setLabourRoles] = useState([
      { id: 'LR1', type: 'Labour Normal', baseRate: 75, state: 'NSW', stateAdjustment: 0 },
      { id: 'LR2', type: 'Site visit', baseRate: 65, state: 'NSW', stateAdjustment: 0 },
      { id: 'LR5', type: 'Mobilisation', baseRate: 80, state: 'NSW', stateAdjustment: 0 },
      { id: 'LR2', type: 'Stand down', baseRate: 50, state: 'NSW', stateAdjustment: 0 },
      { id: 'LR3', type: 'Inductions', baseRate: 45, state: 'NSW', stateAdjustment: 0 },
      { id: 'LR4', type: 'Test/Commission', baseRate: 95, state: 'NSW', stateAdjustment: 0 },
      { id: 'LR5', type: 'Documentation', baseRate: 70, state: 'NSW', stateAdjustment: 0 },
      { id: 'LR3', type: 'OT', baseRate: 110, state: 'NSW', stateAdjustment: 0 },    
    ]);
    const stateCodeMultipliers = {
      NSW: 1.0,      // New South Wales - Standard rate
      VIC: 1.0,      // Victoria - Same as NSW
      QLD: 1.0,      // Queensland - Same as NSW
      NT: 1.0        // Northern Territory - Same as NSW (for most labor types)
    };
    
    const getEffectiveRate = (role) => {
      let stateMult = stateCodeMultipliers[role.state] ?? 1;
      
      // Apply custom state adjustment if set
      if (role.stateAdjustment && role.stateAdjustment !== 0) {
        stateMult = 1 + (role.stateAdjustment / 100); // Convert percentage to multiplier
      }
      
      return (Number(role.baseRate) || 0) * stateMult;
    };
    const updateRoleField = (index, field, value) => {
      setLabourRoles(prev => {
        const oldRole = prev[index];
        const newRoles = prev.map((r, i) => i === index ? { ...r, [field]: value } : r);
        
        // Track labor rate changes
        if (field === 'baseRate' && oldRole && oldRole.baseRate !== value) {
          trackPriceChange('labor', oldRole.id, oldRole.baseRate, value, `${oldRole.type} labor`);
        }
        
        return newRoles;
      });
    };

    const removeLabourRole = (index) => {
      setLabourRoles(prev => prev.filter((_, i) => i !== index));
    };
    const [craneEnabled, setCraneEnabled] = useState(false);
    const [craneAmount, setCraneAmount] = useState(0);
    const [riskEnabled, setRiskEnabled] = useState(false);
    const [riskPercent, setRiskPercent] = useState(10);
    const [projectName, setProjectName] = useState('');
  const [sorCode, setSorCode] = useState('');
  const [sorDescription, setSorDescription] = useState('');
  const [sorType, setSorType] = useState('');
  
  // Admin dashboard filters
  const [adminSearchTerm, setAdminSearchTerm] = useState('');
  const [adminFilterStatus, setAdminFilterStatus] = useState('');
    
    const materialSearchRef = useRef(null);
    const equipmentSearchRef = useRef(null);
    const reportRef = useRef(null);
    
    // Scroll to top state
    const [showScrollToTop, setShowScrollToTop] = useState(false);

    // Sample data
    const [materials, setMaterials] = useState([
      { "id": "M01", "salesPartNo": "10-DG094", "description": "10kVA Perkins Enclosed Generator (Elcos)", "site": "3DT01", "price": 4545.45, "image": null },
      { "id": "M02", "salesPartNo": "10-DG095", "description": "10kVA Perkins Enclosed Generator (Elcos)", "site": "3DT01", "price": 4545.45, "image": null },
      { "id": "M03", "salesPartNo": "2-1671163-1", "description": "12 PORT CONSOLIDATION PORT", "site": "3DT01", "price": 132.00, "image": null },
      { "id": "M04", "salesPartNo": "ATCB-B01-002", "description": "AISG RET Control Cable 2m", "site": "3DT01", "price": 37.32, "image": null },
      { "id": "M05", "salesPartNo": "ATCB-B01-030", "description": "AISG RET Control Cable 30m", "site": "3DT01", "price": 174.73, "image": null },
      { "id": "M06", "salesPartNo": "ATCB-B01-Y-C30", "description": "AISG RET Control Cable Two-way Splitter", "site": "3DT01", "price": 53.19, "image": null },
      { "id": "M07", "salesPartNo": "BA48TL200", "description": "Battery 9.6kWh FZSoNick 48TL200", "site": "3DT01", "price": 11349.00, "image": null },
      { "id": "M08", "salesPartNo": "BRCTX−AAWHS10", "description": "HUMIDISTAT 35−95%RH 250AC", "site": "3DT01", "price": 275.00, "image": null },
      { "id": "M09", "salesPartNo": "BRCTX−WID30BL0C", "description": "HEAT 300W 230V 50−60HZ", "site": "3DT01", "price": 525.80, "image": null },
      { "id": "M10", "salesPartNo": "CA0001-2.0", "description": "Telstra Power Cable 2m Length P6309-B6320 PSA# 40015307", "site": "3DT01", "price": 2.95, "image": null },
      { "id": "M11", "salesPartNo": "CA0002", "description": "Trident DC Cable Suit Ericsson Radio Unit", "site": "3DT01", "price": 47.00, "image": null },
      { "id": "M12", "salesPartNo": "CACG020ARM", "description": "Cable Gland 20mm Armoured IP66/68 Suit 14.7-17mm2 Cable", "site": "3DT01", "price": 25.00, "image": null },
      { "id": "M13", "salesPartNo": "CAOC002SWA2CE", "description": "Orange Circular Cable SWA 2.5mm2 0.6/1KV 2C&E", "site": "3DT01", "price": 7.00, "image": null },
      { "id": "M14", "salesPartNo": "CEDC02B4DPE", "description": "DeCab 2 Bay 4 Door 1 AC Pale Eucalypt", "site": "3DT01", "price": 23197.00, "image": null },
      { "id": "M15", "salesPartNo": "CEOSC2B19PB", "description": "ODU Cabinet Rear Security Cage 2 Bay Paperbark", "site": "3DT01", "price": 5028.00, "image": null },
      { "id": "M16", "salesPartNo": "CEOSC3BSM-1900", "description": "ODU Cabinet Rear Security Cage 3 Bay 1900H Surf Mist", "site": "3DT01", "price": 6992.00, "image": null },
      { "id": "M17", "salesPartNo": "CEOSC5B19H", "description": "ODU Cabinet Rear Security Cage 5 Bay HDG (Pale Eucalypt)", "site": "3DT01", "price": 15061.00, "image": null },
      { "id": "M18", "salesPartNo": "CEOSC5BH", "description": "ODU Cabinet Rear Security Cage 5 Bay HDG", "site": "3DT01", "price": 11639.00, "image": null },
      { "id": "M19", "salesPartNo": "CEOSC5BPB-1700", "description": "ODU Cabinet Rear Security Cage 5 Bay 1700mmH Paperbark", "site": "3DT01", "price": 17160.00, "image": null },
      { "id": "M20", "salesPartNo": "CESASC2BSM", "description": "ODU Cabinet Side Security Cage 2 Bay Surf Mist", "site": "3DT01", "price": 13958.00, "image": null },
      { "id": "M21", "salesPartNo": "CESASC5BPE-1900", "description": "Stand Alone Security Cage 5 Bay 3175W x 1900H x 750D Pale Eucalypt", "site": "3DT01", "price": 21981.00, "image": null },
      { "id": "M22", "salesPartNo": "CESLF01B158", "description": "Cabinet Security Locking Frame HDG Suit NBN B158", "site": "3DT01", "price": 805.05, "image": null },
      { "id": "M23", "salesPartNo": "CESLF01B174", "description": "Cabinet Security Locking Frame HDG Suit NBN B174", "site": "3DT01", "price": 1087.74, "image": null },
      { "id": "M24", "salesPartNo": "CESSC28WPE-2450", "description": "Shelter Rear Security Cage 2800W x 2450H x 300D Pale Eucalypt", "site": "3DT01", "price": 14098.88, "image": null },
      { "id": "M25", "salesPartNo": "CESSC3WPE-1900", "description": "Shelter Rear Security Cage 3000W x 1900H x 520D Pale Eucalypt", "site": "3DT01", "price": 18991.00, "image": null },
      { "id": "M26", "salesPartNo": "CESSC3WSM-1900", "description": "Shelter Rear Security Cage 3000W x 1900H x 520D Surf Mist", "site": "3DT01", "price": 16866.00, "image": null },
      { "id": "M27", "salesPartNo": "CV00001-48DC", "description": "Decon Eco Cooling Unit D355 48v DC", "site": "3DT01", "price": 1113.00, "image": null },
      { "id": "M28", "salesPartNo": "CV0001-CCK", "description": "Eco Cooling Control Cable Kit DC Fan-Damper-Temp 10m", "site": "3DT01", "price": 89.60, "image": null },
      { "id": "M29", "salesPartNo": "CVAD3060-24DC", "description": "Decon Air Damper 300mm x 600mm 24vDC", "site": "3DT01", "price": 320.00, "image": null },
      { "id": "M30", "salesPartNo": "CVBD6030MF", "description": "DeconDeconBackdraft Damper Suit 600x300mm Opening Mill Finish", "site": "3DT01", "price": 308.00, "image": null },
      { "id": "M31", "salesPartNo": "CVDC4812-S", "description": "Split System Air Conditioner Set 48vDC 12kBTU", "site": "3DT01", "price": 2599.00, "image": null },
      { "id": "M32", "salesPartNo": "DHSD9102045PE", "description": "Shelter Door & Hardware 910 x 2045mm Opening Pale Eucalypt", "site": "3DT01", "price": 1459.00, "image": null },
      { "id": "M33", "salesPartNo": "EC-DDR-30L-24", "description": "Mean Well DC to DC Converter 24-48 VDC", "site": "3DT01", "price": 46.80, "image": null },
      { "id": "M34", "salesPartNo": "ECDTMH380C", "description": "Circuit Breaker 80A 3P C Curve 30kA 10H NHP DTMH380C", "site": "3DT01", "price": 248.50, "image": null },
      { "id": "M35", "salesPartNo": "ECPLS6C40MW", "description": "Circuit Breaker 40A 1Pole 6kA Eaton PLS6-C40-MW", "site": "3DT01", "price": 10.60, "image": null },
      { "id": "M36", "salesPartNo": "ECQYM19U216B0", "description": "Circuit Breaker 16A 1P 80vDC 10kA CBI QYM19U216B0", "site": "3DT01", "price": 91.10, "image": null },
      { "id": "M37", "salesPartNo": "ECSCOM804PD", "description": "Changeover Switch I-0-II 4P 80A Sirco M NHP SCOM804PD", "site": "3DT01", "price": 326.40, "image": null },
      { "id": "M38", "salesPartNo": "ECTEMP002", "description": "Temperature & Humidity Sensor 4-20mA", "site": "3DT01", "price": 128.00, "image": null },
      { "id": "M39", "salesPartNo": "EFX0063", "description": "TEMP & RH SENSOR (4-20mA)", "site": "3DT01", "price": 121.00, "image": null },
      { "id": "M40", "salesPartNo": "ESEB-004", "description": "Earth Bar 6x480x50 21xM6-1xM10 Hole Tinned Copper", "site": "3DT01", "price": 98.00, "image": null },
      { "id": "M41", "salesPartNo": "ESEBO6465-20T", "description": "Earth Bar 462 x 50 x 6.5mmT 20xM10 Off Set Tinned Copper", "site": "3DT01", "price": 89.00, "image": null },
      { "id": "M42", "salesPartNo": "ESSPD001SM", "description": "Decon Outdoor SPD 25/63A CB's 600x600x375 Surf Mist", "site": "3DT01", "price": 2496.60, "image": null },
      { "id": "M43", "salesPartNo": "FAP-001", "description": "Nokia to Commscope FTTN Adaptor Plate", "site": "3DT01", "price": 1779.00, "image": null },
      { "id": "M44", "salesPartNo": "FFLSRK63ZRA-W-SET-BU", "description": "SRK63ZRA-W/ SRC63ZRA-W * R32*6.3 KW COOL / 7.1 KW HEAT MITS", "site": "3DT01", "price": 1660.00, "image": null },
      { "id": "M45", "salesPartNo": "FSJ4-50B", "description": "STD.JACKET 50-OHM 1/2\" FSJ CABLE", "site": "3DT01", "price": 3.81, "image": null },
      { "id": "M46", "salesPartNo": "FSJ4RK-50B", "description": "BLACK FLAME RETARD.JACKET 1/2\" CATVR", "site": "3DT01", "price": 4.38, "image": null },
      { "id": "M47", "salesPartNo": "GO-2300P", "description": "2.0 kVA / 2.0 kW Generator (Model GO-2300P)", "site": "3DT01", "price": 550.00, "image": null },
      { "id": "M48", "salesPartNo": "GO-2800P", "description": "2.5 kVA / 2.5 kW Generator (Model GO-2800P)", "site": "3DT01", "price": 600.00, "image": null },
      { "id": "M49", "salesPartNo": "GO-4500P", "description": "4.0 kVA / 4.0 kW Generator (Model GO-4500P)", "site": "3DT01", "price": 1100.00, "image": null },
      { "id": "M50", "salesPartNo": "GO-5500P", "description": "5.0 kVA / 5.0 kW Generator (Model 5500P)", "site": "3DT01", "price": 1045.45, "image": null },
      { "id": "M51", "salesPartNo": "HMBIH001", "description": "Battery Instal Hoist Electric 150kg SWL Suit Cabinet Application", "site": "3DT01", "price": 4144.00, "image": null },
      { "id": "M52", "salesPartNo": "HMGP43434-01", "description": "Gland Plate 4mm x 340mm x 340mm Aluminium c/w 16 x 20mmØ & H/Ware", "site": "3DT01", "price": 250.00, "image": null },
      { "id": "M53", "salesPartNo": "HMHF1000A", "description": "Head Frame 1000mm c/w Pole Mount Bracket Aluminium", "site": "3DT01", "price": 1005.00, "image": null },
      { "id": "M54", "salesPartNo": "HMOSP0250H", "description": "Outrigger Stabalizing Plate 250x250mm HDG", "site": "3DT01", "price": 312.91, "image": null },
      { "id": "M55", "salesPartNo": "HMPMB001SS", "description": "Pole Mounting Bracket Suit Triplexer E14F10P64 to AWL3993 SS316", "site": "3DT01", "price": 254.55, "image": null },
      { "id": "M56", "salesPartNo": "MASS-FLASHING", "description": "Folded 125mm x 125mm flashing trim @ 2000 ZA at 0.6mm", "site": "3DT01", "price": 75.00, "image": null },
      { "id": "M57", "salesPartNo": "MASS-STWK-V100", "description": "Custom Telstra Channel V100 C-Channel 102mm x 90mm deep sides to take adulation. Supplied as: 4200mm Lengths", "site": "3DT01", "price": 203.28, "image": null },
      { "id": "M58", "salesPartNo": "MASS-STWK-V50", "description": "Custom Telstra Channel V50 C-Channel 52mm x 90mm deep sides to take adulation. Supplied as: 4200mm Lengths", "site": "3DT01", "price": 175.14, "image": null },
      { "id": "M59", "salesPartNo": "MHISRK71ZRA-W-SET", "description": "BRONTE SERIES - R32 - WALL MOUNTED SPLIT", "site": "3DT01", "price": 2070.00, "image": null },
      { "id": "M60", "salesPartNo": "MKUGLSEPA-SMKIT", "description": "UGL SEPA Sheetmetal Kit As Per BOM", "site": "3DT01", "price": 18772.31, "image": null },
      { "id": "M61", "salesPartNo": "MPRGL100-001", "description": "Perspex Front Circuit Breaker Cover", "site": "3DT01", "price": 38.50, "image": null },
      { "id": "M62", "salesPartNo": "MPRGL100-003", "description": "Base Cover Clear Polycarbonate", "site": "3DT01", "price": 32.00, "image": null },
      { "id": "M63", "salesPartNo": "OCTI217500", "description": "RJ45 Plug Kit for Panel Adaptator, Octis Series", "site": "3DT01", "price": 37.50, "image": null },
      { "id": "M64", "salesPartNo": "OCTI217505", "description": "RJ45 Plug Kit for Panel Adaptator, Octis Series", "site": "3DT01", "price": 37.50, "image": null },
      { "id": "M65", "salesPartNo": "PLS6-C40-MW", "description": "MCB 6KA C CURVE 40A 1P", "site": "3DT01", "price": 6.50, "image": null },
      { "id": "M66", "salesPartNo": "RA0001", "description": "RRU4466 Support Rack Telstra COW", "site": "3DT01", "price": 1459.00, "image": null },
      { "id": "M67", "salesPartNo": "RA0001-QT", "description": "Quad Triplex Mounting Bracket 3xE14F10P64 Suit RRU4466 Rack", "site": "3DT01", "price": 168.65, "image": null },
      { "id": "M68", "salesPartNo": "RABR001", "description": "Battery Rack Suit FZSoNick 48TL200", "site": "3DT01", "price": 4575.00, "image": null },
      { "id": "M69", "salesPartNo": "RABR002", "description": "Battery Rack Suit 4 x FZSoNick 48TL200", "site": "3DT01", "price": 3160.00, "image": null },
      { "id": "M70", "salesPartNo": "RAFSB119BR", "description": "Fibre Cable Support Bracket 1RU 19\" Black Ripple", "site": "3DT01", "price": 26.00, "image": null },
      { "id": "M71", "salesPartNo": "RAMER001-39RU", "description": "DeconDecon Misc Equipment Rack 19\" 39RU 560Wx570Dx1818mmH", "site": "3DT01", "price": 765.00, "image": null },
      { "id": "M72", "salesPartNo": "RAMER001-46RU", "description": "Decon Misc Equipment Rack 19\" 46RU 560Wx570Dx2131mmH", "site": "3DT01", "price": 943.00, "image": null },
      { "id": "M73", "salesPartNo": "RAPR0001BR", "description": "Decon Post Rack 45RU 3x4480 Radio & 3xQuad Filter Black Ripple", "site": "3DT01", "price": 2099.00, "image": null },
      { "id": "M74", "salesPartNo": "RAPR0001BR-KIT", "description": "Install Kit Suit Post Rack 4480", "site": "3DT01", "price": 157.00, "image": null },
      { "id": "M75", "salesPartNo": "RAPR0001SKBR", "description": "Decon Post Rack Shelf Kit Suit 3 x Quad Filters Black Ripple", "site": "3DT01", "price": 198.22, "image": null },
      { "id": "M76", "salesPartNo": "RAPR0002BR", "description": "Decon Post Rack 45RU 3xRRU AHPB/AHEGC Shelves Black Ripple", "site": "3DT01", "price": 2009.00, "image": null },
      { "id": "M77", "salesPartNo": "RAPR0002SKBR", "description": "Decon Post Rack Shelf Kit Suit Ericsson 4490HP PSA# 40014769", "site": "3DT01", "price": 107.00, "image": null },
      { "id": "M78", "salesPartNo": "RAPR0003BR", "description": "Decon Post Rack 45RU Base Model Black Ripple", "site": "3DT01", "price": 653.00, "image": null },
      { "id": "M79", "salesPartNo": "RARSBLRSS", "description": "Router Support Bracket Set LH-RH Stainless Steel", "site": "3DT01", "price": 42.90, "image": null },
      { "id": "M80", "salesPartNo": "RASK0001-0.5RU", "description": "Decon Shelf Kit 19\" 0.5RU 442mm Deep", "site": "3DT01", "price": 58.00, "image": null },
      { "id": "M81", "salesPartNo": "RGL-068", "description": "39RU Pathfinder Rack", "site": "3DT01", "price": 713.00, "image": null },
      { "id": "M82", "salesPartNo": "RGL-069", "description": "RRU Support Bracket & Instal Kit", "site": "3DT01", "price": 481.00, "image": null },
      { "id": "M83", "salesPartNo": "RGL-069-03", "description": "Mounting Bracket Suit RRU8863 Black Ripple PSA#40015797", "site": "3DT01", "price": 19.87, "image": null },
      { "id": "M84", "salesPartNo": "RGL-071", "description": "4 way filter bracket", "site": "3DT01", "price": 149.00, "image": null },
      { "id": "M85", "salesPartNo": "RGL-072", "description": "5G Internal SPD", "site": "3DT01", "price": 1325.00, "image": null },
      { "id": "M86", "salesPartNo": "RGL-075", "description": "Rack security frame kit", "site": "3DT01", "price": 2379.00, "image": null },
      { "id": "M87", "salesPartNo": "RGL-077", "description": "SPD Augmentation Units Internal", "site": "3DT01", "price": 497.00, "image": null },
      { "id": "M88", "salesPartNo": "RGL-078", "description": "PB SPD Augmentation Units External", "site": "3DT01", "price": 789.00, "image": null },
      { "id": "M89", "salesPartNo": "RGL-078", "description": "PE SPD Augmentation Units External", "site": "3DT01", "price": 789.00, "image": null },
      { "id": "M90", "salesPartNo": "RGL-079", "description": "AWL mount - GPS Receiver mount", "site": "3DT01", "price": 48.00, "image": null },
      { "id": "M91", "salesPartNo": "RGL-080", "description": "Breaker, cable & spade lug kit", "site": "3DT01", "price": 76.21, "image": null },
      { "id": "M92", "salesPartNo": "RGL-086", "description": "Isolation AC-DC tilt switch", "site": "3DT01", "price": 572.05, "image": null },
      { "id": "M93", "salesPartNo": "RGL-087", "description": "DC Anderson Outlet Tray (8 port SB50)", "site": "3DT01", "price": 380.00, "image": null },
      { "id": "M94", "salesPartNo": "RGL-088", "description": "Filter Bracker 4 Way Post Rack Mount", "site": "3DT01", "price": 149.00, "image": null },
      { "id": "M95", "salesPartNo": "RGL-089", "description": "SPD AUG Kit", "site": "3DT01", "price": 171.65, "image": null },
      { "id": "M96", "salesPartNo": "RGL-090", "description": "Decon Post Rack & cable kit", "site": "3DT01", "price": 1497.00, "image": null },
      { "id": "M97", "salesPartNo": "RGL-091", "description": "Decon Post Rack 4480 & cable kit", "site": "3DT01", "price": 2231.00, "image": null },
      { "id": "M98", "salesPartNo": "RGL-092", "description": "Radio 4480 Mounting Shelf x 3", "site": "3DT01", "price": 1558.20, "image": null },
      { "id": "M99", "salesPartNo": "RGL-093", "description": "6 way filter shelf", "site": "3DT01", "price": 521.30, "image": null },
      { "id": "M100", "salesPartNo": "RGL-095", "description": "Ericsson internal cabinets", "site": "3DT01", "price": 2460.00, "image": null },
      { "id": "M101", "salesPartNo": "RGL-096", "description": "Battery Shelf 19\"", "site": "3DT01", "price": 79.45, "image": null },
      { "id": "M102", "salesPartNo": "RGL-097", "description": "45RU Post Rack", "site": "3DT01", "price": 815.00, "image": null },
      { "id": "M103", "salesPartNo": "RGL-099-1", "description": "Tilt Unit (Option 1) DWG 017866P188 Sheet 23)", "site": "3DT01", "price": 554.00, "image": null },
      { "id": "M104", "salesPartNo": "RGL-099-2", "description": "Tilt Unit (Option 2) DWG017866P188 Sheet 21)", "site": "3DT01", "price": 496.00, "image": null },
      { "id": "M105", "salesPartNo": "RGL-099-3", "description": "Tilt Unit (Option 3) DWG017866P188 Sheet 22)", "site": "3DT01", "price": 518.00, "image": null },
      { "id": "M106", "salesPartNo": "RGL-100", "description": "DC Dist Panel - Type 1 3G/4G 15 x 20A & 3 x 40A Breakers", "site": "3DT01", "price": 823.00, "image": null },
      { "id": "M107", "salesPartNo": "RGL-101", "description": "DC Dist Panel -Type 2 4G/5G 9 x 40A Breakers", "site": "3DT01", "price": 823.00, "image": null },
      { "id": "M108", "salesPartNo": "RGL-103", "description": "6.0kW RAC", "site": "3DT01", "price": 1750.00, "image": null },
      { "id": "M109", "salesPartNo": "RGL-104", "description": "SPD module to suite SPD tray 002 to 005", "site": "3DT01", "price": 42.65, "image": null },
      { "id": "M110", "salesPartNo": "RGL-105", "description": "Rack earth bonding bar kit. 19\"", "site": "3DT01", "price": 265.00, "image": null },
      { "id": "M111", "salesPartNo": "RGL-106", "description": "Rack earth bonding bar kit. 21\"", "site": "3DT01", "price": 290.00, "image": null },
      { "id": "M112", "salesPartNo": "RGL-107", "description": "AIR CON 8.0KW R32 MITSUBISHI ELECTRIC SPLIT", "site": "3DT01", "price": 2487.00, "image": null },
      { "id": "M113", "salesPartNo": "RGL-108", "description": "Split system AC external security cage", "site": "3DT01", "price": 587.00, "image": null },
      { "id": "M114", "salesPartNo": "RGL-109", "description": "Gel Filled Cat6 cable - 305m spool", "site": "3DT01", "price": 403.00, "image": null },
      { "id": "M115", "salesPartNo": "RGL-110", "description": "Gel Filled Cat6 cable - 200m spool", "site": "3DT01", "price": 302.00, "image": null },
      { "id": "M116", "salesPartNo": "RGL-115", "description": "Galvanised top hat", "site": "3DT01", "price": 165.00, "image": null },
      { "id": "M117", "salesPartNo": "RGL-117", "description": "DC Fan Mounting Frame / Single", "site": "3DT01", "price": 180.70, "image": null },
      { "id": "M118", "salesPartNo": "RGL-118", "description": "DC Fan Security Cage / Single", "site": "3DT01", "price": 614.90, "image": null },
      { "id": "M119", "salesPartNo": "RGL-119", "description": "Economy Cooling Fan KIT c/w FTC Controller & Cable", "site": "3DT01", "price": 1462.50, "image": null },
      { "id": "M120", "salesPartNo": "RGL-120", "description": "SDD3 Surge diverter – NORVARIS", "site": "3DT01", "price": 273.00, "image": null },
      { "id": "M121", "salesPartNo": "RGL-121", "description": "Mitsubishi ALPHA AL2-14MR-D. 8DI, 6D0 (PLC control unit)", "site": "3DT01", "price": 442.00, "image": null },
      { "id": "M122", "salesPartNo": "RGL-122", "description": "Eaton SC300 module controller and IO board", "site": "3DT01", "price": 760.50, "image": null },
      { "id": "M123", "salesPartNo": "RGL-123", "description": "Red & Blue 50mm2 battery cables / set", "site": "3DT01", "price": 188.00, "image": null },
      { "id": "M124", "salesPartNo": "RGL-124", "description": "Economy cooling fan.", "site": "3DT01", "price": 799.50, "image": null },
      { "id": "M125", "salesPartNo": "RGL-125", "description": "DC Remote Module and Inverter", "site": "3DT01", "price": 1324.70, "image": null },
      { "id": "M126", "salesPartNo": "RGL-126", "description": "Telstra new RU shelf", "site": "3DT01", "price": 393.52, "image": null },
      { "id": "M127", "salesPartNo": "RGL-129", "description": "DCDP retro Kit", "site": "3DT01", "price": 58.50, "image": null },
      { "id": "M128", "salesPartNo": "RGL-130", "description": "32amp 5 Pin generator inlet - 32A 5PIN INLET PLUG IP66 WITH BASE 56AI532", "site": "3DT01", "price": 95.20, "image": null },
      { "id": "M129", "salesPartNo": "RGL-131", "description": "32amp 5 pin generator outlet – M66C532", "site": "3DT01", "price": 95.20, "image": null },
      { "id": "M130", "salesPartNo": "RGL-132", "description": "32AMP to 50amp cable x 15meters", "site": "3DT01", "price": 1150.00, "image": null },
      { "id": "M131", "salesPartNo": "RGL-133", "description": "Bracket Kit, Receiver and GPS splitter", "site": "3DT01", "price": 59.00, "image": null },
      { "id": "M132", "salesPartNo": "RGL-133-A", "description": "GPS Mounting Bracket 1RU Black Ripple", "site": "3DT01", "price": 25.50, "image": null },
      { "id": "M133", "salesPartNo": "RGL-134", "description": "Bracket x 2 Powder coated black ripple", "site": "3DT01", "price": 9.75, "image": null },
      { "id": "M134", "salesPartNo": "RGL-135", "description": "TPG Internal 19\" equipment rack", "site": "3DT01", "price": 930.00, "image": null },
      { "id": "M135", "salesPartNo": "RGL-137", "description": "2.5mm2 2 CORE AND EARTH STEEL WIRE ARMOURED CABLE (50m long) + 2 glands to suit", "site": "3DT01", "price": 425.00, "image": null },
      { "id": "M136", "salesPartNo": "RGL-138", "description": "DeCab 1D B200 32RU Aluminium c/w 1.5kW DC Air Con Surf Mist", "site": "3DT01", "price": 8483.18, "image": null },
      { "id": "M137", "salesPartNo": "RGL-139", "description": "DeCab 1D B200 32RU 120W/K HEX Aluminium Surf Mist", "site": "3DT01", "price": 7645.78, "image": null },
      { "id": "M138", "salesPartNo": "RGL-139-PE", "description": "DeCab 1D B200 32RU 120W/K HEX Aluminium Pale Eucalypt", "site": "3DT01", "price": 7645.78, "image": null },
      { "id": "M139", "salesPartNo": "RGL-140", "description": "DC Dist Panel - Breakers config - 18 x 20A", "site": "3DT01", "price": 823.00, "image": null },
      { "id": "M140", "salesPartNo": "RGL-141", "description": "DC Dist Panel - Breakers config - 12 x 40A and 6 x 20a", "site": "3DT01", "price": 823.00, "image": null },
      { "id": "M141", "salesPartNo": "RGL-143", "description": "Post rack 27RU 1.4mtr in Height", "site": "3DT01", "price": 588.00, "image": null },
      { "id": "M142", "salesPartNo": "RGL-152", "description": "Post Rack 45RU c/w RRU Bkt & 3 x DBC0086 Combiner Bkt Black Ripple", "site": "3DT01", "price": 1892.00, "image": null },
      { "id": "M143", "salesPartNo": "RGL-152-40", "description": "Post Rack 40RU c/w RRU Bkt & 3 x DBC0086 Combiner Bkt Black Ripple", "site": "3DT01", "price": 2186.50, "image": null },
      { "id": "M144", "salesPartNo": "RGL-153", "description": "Post Rack Combiner Bracket Suit 3 x DBC0086 Black Ripple", "site": "3DT01", "price": 149.00, "image": null },
      { "id": "M145", "salesPartNo": "RGL-160", "description": "Switchboard Telco Retrofit Type V1", "site": "3DT01", "price": 3850.00, "image": null },
      { "id": "M146", "salesPartNo": "RGL-161", "description": "GPS Post Bracket APO Grey", "site": "3DT01", "price": 71.00, "image": null },
      { "id": "M147", "salesPartNo": "RGL-SPD001", "description": "Decon 19\" SPD Cabinet 2000H x 600W x 300D RAL7035", "site": "3DT01", "price": 1416.00, "image": null },
      { "id": "M148", "salesPartNo": "RGL-SPD002", "description": "Gear Tray 1 - 12 Breaker", "site": "3DT01", "price": 1656.00, "image": null },
      { "id": "M149", "salesPartNo": "RGL-SPD003", "description": "Gear Tray 1 - 9 Breaker", "site": "3DT01", "price": 1628.00, "image": null },
      { "id": "M150", "salesPartNo": "RGL-SPD004", "description": "SPD Solution - Gear Tray 2 - 9 breaker", "site": "3DT01", "price": 1757.00, "image": null },
      { "id": "M151", "salesPartNo": "RGL-SPD005", "description": "SPD Solution - Gear Tray 2 - 12 breaker", "site": "3DT01", "price": 1656.00, "image": null },
      { "id": "M152", "salesPartNo": "SCDC4812-3", "description": "DC Split System Controller 3U", "site": "3DT01", "price": 1290.00, "image": null },
      { "id": "M153", "salesPartNo": "SCEC0001-DM", "description": "Decon Eco Cooling Unit Control Card Door Mount", "site": "3DT01", "price": 160.00, "image": null },
      { "id": "M154", "salesPartNo": "SCMDBT001SC", "description": "Decon Main Distribution Board Telco c/w Smart Controller", "site": "3DT01", "price": 15295.00, "image": null },
      { "id": "M155", "salesPartNo": "SMALL-CAPKIT", "description": "4.3-10/4.1-9.5 FEMALE END CAP ASSEMBLY", "site": "3DT01", "price": 11.20, "image": null },
      { "id": "M156", "salesPartNo": "SWSDMW12HG", "description": "Satellite Dish Mounting Bracket Wall Type Suit 1.2m Dish HDG", "site": "3DT01", "price": 389.00, "image": null },
      { "id": "M157", "salesPartNo": "ZZZTFL90136-BU", "description": "2 CORE 6MM2 TINNED COPPER CONDUCTOR, FOIL + BRAID SHIELD DC", "site": "3DT01", "price": 15.65, "image": null }
    ]);

    const [equipment, setEquipment] = useState([
      { id: 'E01', name: 'Crane 50T', category: 'Heavy Equipment', site: '3DT01', price: 5000.00 },
      { id: 'E02', name: 'Excavator', category: 'Heavy Equipment', site: '3DT01', price: 3000.00 },
      { id: 'E03', name: 'Generator Set', category: 'Power Equipment', site: '3DT01', price: 2000.00 },
      { id: 'E04', name: 'Welding Machine', category: 'Tools', site: '3DT01', price: 800.00 },
      { id: 'E05', name: 'Compressor', category: 'Tools', site: '3DT01', price: 1200.00 }
    ]);

    const [projects, setProjects] = useState([
      { 
        id: 'P001', 
        name: 'Site A Construction', 
        status: 'In Progress', 
        budget: 50000, 
        actualCost: 42000, 
        startDate: '2024-01-15',
        endDate: '2024-06-30',
        description: 'Construction of new office building with modern facilities',
        manager: 'John Smith',
        progress: 75,
        priority: 'High',
        category: 'Construction'
      },
      { 
        id: 'P002', 
        name: 'Equipment Installation', 
        status: 'Completed', 
        budget: 25000, 
        actualCost: 23000, 
        startDate: '2024-01-01',
        endDate: '2024-03-15',
        description: 'Installation of new manufacturing equipment',
        manager: 'Sarah Johnson',
        progress: 100,
        priority: 'Medium',
        category: 'Installation'
      },
      { 
        id: 'P003', 
        name: 'Infrastructure Setup', 
        status: 'Planning', 
        budget: 75000, 
        actualCost: 0, 
        startDate: '2024-07-01',
        endDate: '2024-12-31',
        description: 'Setting up new infrastructure for expansion',
        manager: 'Mike Wilson',
        progress: 15,
        priority: 'High',
        category: 'Infrastructure'
      }
    ]);

    // User dashboard specific data
    const [userProjects, setUserProjects] = useState([
      { 
        id: 'UP001', 
        name: 'My Project 1', 
        status: 'In Progress', 
        progress: 60,
        assignedDate: '2024-01-10',
        dueDate: '2024-05-15',
        priority: 'High',
        tasks: [
          { id: 'T1', name: 'Review Documentation', status: 'Completed', dueDate: '2024-02-01' },
          { id: 'T2', name: 'Site Inspection', status: 'In Progress', dueDate: '2024-02-15' },
          { id: 'T3', name: 'Equipment Setup', status: 'Pending', dueDate: '2024-03-01' }
        ]
      },
      { 
        id: 'UP002', 
        name: 'My Project 2', 
        status: 'Completed', 
        progress: 100,
        assignedDate: '2024-01-05',
        dueDate: '2024-02-28',
        priority: 'Medium',
        tasks: [
          { id: 'T4', name: 'Initial Setup', status: 'Completed', dueDate: '2024-01-20' },
          { id: 'T5', name: 'Testing Phase', status: 'Completed', dueDate: '2024-02-15' },
          { id: 'T6', name: 'Final Review', status: 'Completed', dueDate: '2024-02-28' }
        ]
      }
    ]);

    const [userNotifications, setUserNotifications] = useState([
      { id: 'N1', type: 'task', message: 'New task assigned: Equipment Setup', time: '2 hours ago', read: false },
      { id: 'N2', type: 'project', message: 'Project "My Project 1" updated', time: '1 day ago', read: true },
      { id: 'N3', type: 'system', message: 'System maintenance scheduled for tomorrow', time: '2 days ago', read: true }
    ]);

    // Admin notification system
    const [adminNotifications, setAdminNotifications] = useState([]);
    const [priceHistory, setPriceHistory] = useState({
      materials: {},
      equipment: {},
      labor: {}
    });

    // Track price changes and generate notifications
    const trackPriceChange = (type, itemId, oldPrice, newPrice, itemName) => {
      if (oldPrice !== newPrice) {
        const changePercent = ((newPrice - oldPrice) / oldPrice * 100).toFixed(1);
        const changeType = newPrice > oldPrice ? 'increased' : 'decreased';
        
        const notification = {
          id: `PRICE_${Date.now()}`,
          type: 'price_change',
          message: `${itemName} price ${changeType} by ${Math.abs(changePercent)}% (${formatPrice(oldPrice)} → ${formatPrice(newPrice)})`,
          time: 'Just now',
          read: false,
          severity: Math.abs(changePercent) > 10 ? 'high' : 'medium',
          itemType: type,
          itemId: itemId,
          oldPrice: oldPrice,
          newPrice: newPrice
        };
        
        setAdminNotifications(prev => [notification, ...prev.slice(0, 19)]); // Keep last 20 notifications
      }
    };

    // Check for project deadline alerts
    const checkProjectDeadlines = () => {
      const today = new Date();
      const alerts = [];
      
      projects.forEach(project => {
        const endDate = new Date(project.endDate);
        const daysRemaining = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
        
        if (daysRemaining <= 7 && daysRemaining > 0) {
          alerts.push({
            id: `DEADLINE_${project.id}_${Date.now()}`,
            type: 'deadline',
            message: `Project "${project.name}" is due in ${daysRemaining} day${daysRemaining === 1 ? '' : 's'}`,
            time: 'Just now',
            read: false,
            severity: daysRemaining <= 3 ? 'high' : 'medium',
            projectId: project.id,
            daysRemaining: daysRemaining
          });
        } else if (daysRemaining < 0) {
          alerts.push({
            id: `OVERDUE_${project.id}_${Date.now()}`,
            type: 'overdue',
            message: `Project "${project.name}" is overdue by ${Math.abs(daysRemaining)} day${Math.abs(daysRemaining) === 1 ? '' : 's'}`,
            time: 'Just now',
            read: false,
            severity: 'high',
            projectId: project.id,
            daysOverdue: Math.abs(daysRemaining)
          });
        }
      });
      
      if (alerts.length > 0) {
        setAdminNotifications(prev => [...alerts, ...prev.slice(0, 20 - alerts.length)]);
      }
    };

    // Check for budget overruns
    const checkBudgetOverruns = () => {
      const alerts = [];
      
      projects.forEach(project => {
        const overrunPercent = ((project.actualCost - project.budget) / project.budget * 100).toFixed(1);
        
        if (project.actualCost > project.budget) {
          alerts.push({
            id: `BUDGET_${project.id}_${Date.now()}`,
            type: 'budget_overrun',
            message: `Project "${project.name}" is ${overrunPercent}% over budget (${formatPrice(project.budget)} → ${formatPrice(project.actualCost)})`,
            time: 'Just now',
            read: false,
            severity: overrunPercent > 20 ? 'high' : 'medium',
            projectId: project.id,
            overrunPercent: overrunPercent
          });
        }
      });
      
      if (alerts.length > 0) {
        setAdminNotifications(prev => [...alerts, ...prev.slice(0, 20 - alerts.length)]);
      }
    };

    // Check for labor hour overruns
    const checkLaborOverruns = () => {
      const alerts = [];
      
      selectedLabor.forEach(labor => {
        const estimatedHours = 8; // Default estimated hours
        if (labor.hours > estimatedHours * 1.5) { // 50% over estimate
          const item = labor.itemType === 'material' 
            ? getMaterialById(labor.itemId)
            : getEquipmentById(labor.itemId);
          
          alerts.push({
            id: `LABOR_${labor.id}_${Date.now()}`,
            type: 'labor_overrun',
            message: `Labor hours for ${item?.description || item?.name} exceeded estimate (${estimatedHours}h → ${labor.hours}h)`,
            time: 'Just now',
            read: false,
            severity: 'medium',
            laborId: labor.id,
            estimatedHours: estimatedHours,
            actualHours: labor.hours
          });
        }
      });
      
      if (alerts.length > 0) {
        setAdminNotifications(prev => [...alerts, ...prev.slice(0, 20 - alerts.length)]);
      }
    };

    // Combine all admin notifications
    const getAllAdminNotifications = () => {
      return [...adminNotifications, ...userNotifications];
    };

    // Remove notification function
    const removeNotification = (notificationId) => {
      setAdminNotifications(prev => prev.filter(n => n.id !== notificationId));
      setUserNotifications(prev => prev.filter(n => n.id !== notificationId));
    };

    // Run periodic checks for notifications
    useEffect(() => {
      const interval = setInterval(() => {
        checkProjectDeadlines();
        checkBudgetOverruns();
        checkLaborOverruns();
      }, 60000); // Check every minute

      return () => clearInterval(interval);
    }, [projects, selectedLabor]);

    // Generate realistic alerts based on current data
    const generateRealisticAlerts = () => {
      const alerts = [];
      const currentTime = new Date();
      
      // Check for actual price changes in materials
      materials.forEach(material => {
        if (material.price > 5000) {
          alerts.push({
            id: `REAL_${Date.now()}_${material.id}`,
            type: 'price_change',
            message: `${material.description} price is high (${formatPrice(material.price)}) - consider alternatives`,
            time: 'Just now',
            read: false,
            severity: 'medium',
            itemType: 'material',
            itemId: material.id
          });
        }
      });
      
      // Check for project deadlines
      projects.forEach(project => {
        const endDate = new Date(project.endDate);
        const daysRemaining = Math.ceil((endDate - currentTime) / (1000 * 60 * 60 * 24));
        
        if (daysRemaining <= 7 && daysRemaining > 0) {
          alerts.push({
            id: `REAL_${Date.now()}_${project.id}`,
            type: 'deadline',
            message: `Project "${project.name}" is due in ${daysRemaining} day${daysRemaining === 1 ? '' : 's'}`,
            time: 'Just now',
            read: false,
            severity: daysRemaining <= 3 ? 'high' : 'medium',
            projectId: project.id
          });
        }
      });
      
      // Check for budget overruns
      projects.forEach(project => {
        if (project.actualCost > project.budget) {
          const overrunPercent = ((project.actualCost - project.budget) / project.budget * 100).toFixed(1);
          alerts.push({
            id: `REAL_${Date.now()}_${project.id}`,
            type: 'budget_overrun',
            message: `Project "${project.name}" is ${overrunPercent}% over budget`,
            time: 'Just now',
            read: false,
            severity: overrunPercent > 20 ? 'high' : 'medium',
            projectId: project.id
          });
        }
      });
      
      return alerts;
    };

    // Add sample notifications for testing
    const addSampleNotifications = () => {
      const currentTime = new Date();
      const sampleNotifications = [
        // Price Change Alerts
        {
          id: `SAMPLE_${Date.now()}_1`,
          type: 'price_change',
          message: 'Generator price increased by 15% ($4,545.45 → $5,227.27)',
          time: '2 minutes ago',
          read: false,
          severity: 'high',
          itemType: 'material',
          itemId: 'M01'
        },
        {
          id: `SAMPLE_${Date.now()}_2`,
          type: 'price_change',
          message: 'Crane 50T rental rate decreased by 8% ($5,000 → $4,600)',
          time: '5 minutes ago',
          read: false,
          severity: 'medium',
          itemType: 'equipment',
          itemId: 'E01'
        },
        {
          id: `SAMPLE_${Date.now()}_3`,
          type: 'price_change',
          message: 'Installation labor rate increased by 12% ($15/hr → $16.80/hr)',
          time: '8 minutes ago',
          read: false,
          severity: 'high',
          itemType: 'labor',
          itemId: 'LR1'
        },
        
        // Project Deadline Alerts
        {
          id: `SAMPLE_${Date.now()}_4`,
          type: 'deadline',
          message: 'Project "Site A Construction" is due in 3 days',
          time: '10 minutes ago',
          read: false,
          severity: 'high',
          projectId: 'P001'
        },
        {
          id: `SAMPLE_${Date.now()}_5`,
          type: 'deadline',
          message: 'Project "Infrastructure Setup" is due in 7 days',
          time: '15 minutes ago',
          read: false,
          severity: 'medium',
          projectId: 'P003'
        },
        
        // Overdue Project Alerts
        {
          id: `SAMPLE_${Date.now()}_6`,
          type: 'overdue',
          message: 'Project "Equipment Installation" is overdue by 2 days',
          time: '20 minutes ago',
          read: false,
          severity: 'high',
          projectId: 'P002'
        },
        
        // Budget Overrun Alerts
        {
          id: `SAMPLE_${Date.now()}_7`,
          type: 'budget_overrun',
          message: 'Project "Site A Construction" is 18% over budget ($50,000 → $59,000)',
          time: '25 minutes ago',
          read: false,
          severity: 'medium',
          projectId: 'P001'
        },
        {
          id: `SAMPLE_${Date.now()}_8`,
          type: 'budget_overrun',
          message: 'Project "Infrastructure Setup" is 35% over budget ($75,000 → $101,250)',
          time: '30 minutes ago',
          read: false,
          severity: 'high',
          projectId: 'P003'
        },
        
        // Labor Hour Overrun Alerts
        {
          id: `SAMPLE_${Date.now()}_9`,
          type: 'labor_overrun',
          message: 'Labor hours for Generator installation exceeded estimate (8h → 14h)',
          time: '35 minutes ago',
          read: false,
          severity: 'medium',
          laborId: 'LABOR_001'
        },
        {
          id: `SAMPLE_${Date.now()}_10`,
          type: 'labor_overrun',
          message: 'Welding Machine setup took 3x longer than estimated (4h → 12h)',
          time: '40 minutes ago',
          read: false,
          severity: 'high',
          laborId: 'LABOR_002'
        },
        
        // Material Shortage Alerts
        {
          id: `SAMPLE_${Date.now()}_11`,
          type: 'material_shortage',
          message: 'Low stock alert: AISG RET Control Cable 30m (5 units remaining)',
          time: '45 minutes ago',
          read: false,
          severity: 'medium',
          itemType: 'material',
          itemId: 'M05'
        },
        
        // Equipment Maintenance Alerts
        {
          id: `SAMPLE_${Date.now()}_12`,
          type: 'equipment_maintenance',
          message: 'Crane 50T requires scheduled maintenance (due in 2 days)',
          time: '50 minutes ago',
          read: false,
          severity: 'medium',
          itemType: 'equipment',
          itemId: 'E01'
        },
        
        // Quality Control Alerts
        {
          id: `SAMPLE_${Date.now()}_13`,
          type: 'quality_issue',
          message: 'Quality check failed for Generator installation - requires rework',
          time: '55 minutes ago',
          read: false,
          severity: 'high',
          projectId: 'P001'
        },
        
        // Safety Alerts
        {
          id: `SAMPLE_${Date.now()}_14`,
          type: 'safety_alert',
          message: 'Safety inspection overdue for Site A Construction project',
          time: '1 hour ago',
          read: false,
          severity: 'high',
          projectId: 'P001'
        },
        
        // Weather Alerts
        {
          id: `SAMPLE_${Date.now()}_15`,
          message: 'Weather alert: Heavy rain forecast may delay outdoor work',
          time: '1 hour ago',
          read: false,
          severity: 'medium',
          type: 'weather_alert'
        }
      ];
      
      setAdminNotifications(prev => [...sampleNotifications, ...prev]);
    };

    // Dashboard switch function
    const switchDashboard = (mode) => {
      setDashboardMode(mode);
      if (mode === 'user') {
        setCurrentPage('projects');
      } else {
        setCurrentPage('dashboard');
      }
    };

    // Helper functions
    const formatPrice = (price) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(price);
    };

    const getMaterialById = (id) => materials.find(m => m.id === id);
    const getEquipmentById = (id) => equipment.find(e => e.id === id);
    const isTaskMaterial = (mat) => !!mat && mat.salesPartNo === 'CUSTOM';
    const getTaskTypeFromDescription = (desc) => {
      if (!desc) return '';
      const lowered = desc.toLowerCase();
      if (lowered.includes('Labour Normal')) return 'Labour Normal';
      if (lowered.includes('Site visit')) return 'Site visit';
      if (lowered.includes('Mobilisation')) return 'Mobilisation';
      if (lowered.includes('Stand down')) return 'Stand down';
      if (lowered.includes('Inductions')) return 'Inductions';
      if (lowered.includes('Test/Commission')) return 'Test/Commission';
      if (lowered.includes('Documentation')) return 'Documentation';
      if (lowered.includes('OT')) return 'OT';
      return '';
    };
    const getTaskRateForMaterial = (material) => {
      const t = getTaskTypeFromDescription(material?.description || '');
      return getLaborRateFromAdmin(t);
    };

    // Project Rate Card functions
    const addMaterialToProject = (materialId, qty = 1) => {
      const existing = selectedMaterials.find(m => m.id === materialId);
      if (existing) {
        setSelectedMaterials(selectedMaterials.map(m => 
          m.id === materialId ? { ...m, qty: m.qty + qty } : m
        ));
      } else {
        setSelectedMaterials([...selectedMaterials, { id: materialId, qty }]);
      }
    };

    const removeMaterialFromProject = (materialId) => {
      setSelectedMaterials(selectedMaterials.filter(m => m.id !== materialId));
    };

    const updateMaterialQty = (materialId, qty) => {
      if (qty <= 0) {
        removeMaterialFromProject(materialId);
      } else {
        setSelectedMaterials(selectedMaterials.map(m => 
          m.id === materialId ? { ...m, qty } : m
        ));
      }
    };

    const addEquipmentToProject = (equipmentId, qty = 1) => {
      const existing = selectedEquipment.find(e => e.id === equipmentId);
      if (existing) {
        setSelectedEquipment(selectedEquipment.map(e => 
          e.id === equipmentId ? { ...e, qty: e.qty + qty } : e
        ));
      } else {
        setSelectedEquipment([...selectedEquipment, { id: equipmentId, qty }]);
      }
    };

    const removeEquipmentFromProject = (equipmentId) => {
      setSelectedEquipment(selectedEquipment.filter(e => e.id !== equipmentId));
    };

    const updateEquipmentQty = (equipmentId, qty) => {
      if (qty <= 0) {
        removeEquipmentFromProject(equipmentId);
      } else {
        setSelectedEquipment(selectedEquipment.map(e => 
          e.id === equipmentId ? { ...e, qty } : e
        ));
      }
    };

    const calcMaterialTotal = () => {
      return selectedMaterials.filter(m => !isTaskMaterial(getMaterialById(m.id))).reduce((total, m) => {
        const material = getMaterialById(m.id);
        return total + (material?.price || 0) * m.qty;
      }, 0);
    };

    const calcTasksTotal = () => {
      return selectedMaterials.filter(m => isTaskMaterial(getMaterialById(m.id))).reduce((total, m) => {
        const material = getMaterialById(m.id);
        return total + (material?.price || 0) * m.qty;
      }, 0);
    };

    const calcEquipmentTotal = () => {
      return selectedEquipment.reduce((total, e) => {
        const equipment = getEquipmentById(e.id);
        return total + (equipment?.price || 0) * e.qty;
      }, 0);
    };

    // New: Labor management functions
    const addLaborToItem = (itemId, itemType, persons = 1, hours = 8, description = '', rate = 1) => {
      const laborId = `${itemType}-${itemId}-${Date.now()}`;
      const newLabor = {
        id: laborId,
        itemId,
        itemType, // 'material' or 'equipment'
        persons,
        hours,
        rate,
        description: description || `${itemType} installation`,
        cost: persons * hours * rate
      };
      setSelectedLabor([...selectedLabor, newLabor]);
    };

    const removeLaborFromItem = (laborId) => {
      setSelectedLabor(selectedLabor.filter(l => l.id !== laborId));
    };

    const updateLaborDetails = (laborId, persons, hours, description, rate = 1) => {
      setSelectedLabor(selectedLabor.map(l => 
        l.id === laborId ? { 
          ...l, 
          persons, 
          hours, 
          description,
          rate,
          cost: persons * hours * rate 
        } : l
      ));
    };

    const getLaborForItem = (itemId, itemType) => {
      return selectedLabor.filter(l => l.itemId === itemId && l.itemType === itemType);
    };

    const calcLaborTotal = () => {
      return selectedLabor.reduce((total, l) => total + l.cost, 0);
    };

    const calcCraneFee = () => craneEnabled ? craneAmount : 0;

    const calcRiskAmount = () => {
      const subtotal = calcMaterialTotal() + calcEquipmentTotal() + calcLaborTotal() + calcCraneFee();
      return riskEnabled ? (subtotal * riskPercent / 100) : 0;
    };

    const calcExternalTotal = () => {
      return calcCraneFee() + calcRiskAmount();
    };

    const calcFinalTotal = () => {
      return calcMaterialTotal() + calcTasksTotal() + calcEquipmentTotal() + calcLaborTotal() + calcExternalTotal();
    };

    // Create Task as a custom material priced by persons × hours × rate
    const handleCreateTask = () => {
      const desc = newTaskDesc.trim();
      const persons = parseInt(taskPersons) || 0;
      const hours = parseInt(taskHours) || 0;
      const rate = getLaborRateFromAdmin(labourType);
      if (!desc || persons <= 0 || hours <= 0 || rate <= 0) {
        alert('Please fill task description, persons (>0), hours (>0), and select labour type.');
        return;
      }
      const price = persons * hours * rate;
      const newId = `T${Date.now()}`;
      const newMat = {
        id: newId,
        salesPartNo: 'CUSTOM',
        description: `${desc} (${labourType})`,
        site: 'CUSTOM',
        price,
        image: null
      };
      setMaterials([...materials, newMat]);
      addMaterialToProject(newMat.id, 1);
      setNewTaskDesc('');
      setTaskPersons(1);
      setTaskHours(8);
    };

    // Reports functions
    const getOverallStats = () => {
      const totalProjects = projects.length;
      const completedProjects = projects.filter(p => p.status === 'Completed').length;
      const completionRate = totalProjects > 0 ? (completedProjects / totalProjects) * 100 : 0;
      const totalBudget = projects.reduce((sum, p) => sum + p.budget, 0);
      const totalActualCost = projects.reduce((sum, p) => sum + p.actualCost, 0);
      const totalSavings = totalBudget - totalActualCost;
      const avgEfficiency = totalBudget > 0 ? ((totalBudget - totalActualCost) / totalBudget) * 100 : 0;
      
      return { totalProjects, completedProjects, completionRate, totalBudget, totalActualCost, totalSavings, avgEfficiency };
    };

  const getFilteredAdminProjects = () => {
    let filteredProjects = projects;
    
    // Apply search term filter (type, code, description, region)
    if (adminSearchTerm.trim()) {
      const searchTerm = adminSearchTerm.toLowerCase();
      filteredProjects = filteredProjects.filter(project => {
        const type = project.type?.toLowerCase() || '';
        const code = project.id?.toString() || project.code?.toLowerCase() || '';
        const description = project.name?.toLowerCase() || project.description?.toLowerCase() || '';
        const region = project.region?.toLowerCase() || project.manager?.toLowerCase() || '';
        
        return type.includes(searchTerm) || 
               code.includes(searchTerm) || 
               description.includes(searchTerm) || 
               region.includes(searchTerm);
      });
    }
    
    // Apply status filter
    if (adminFilterStatus) {
      filteredProjects = filteredProjects.filter(project => 
        project.status?.toLowerCase().includes(adminFilterStatus.toLowerCase())
      );
    }
    
    return filteredProjects;
    };

    const exportReportPDF = () => {
      window.print();
    };

    const exportPerformanceCSV = () => {
      const csvContent = "data:text/csv;charset=utf-8," + 
        "Project ID,Name,Status,Budget,Actual Cost,Savings\n" +
        projects.map(p => `${p.id},${p.name},${p.status},${p.budget},${p.actualCost},${p.budget - p.actualCost}`).join("\n");
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "project_performance.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

  // Bulk import/export functions
  const handleBulkImport = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target.result;
        let importedData = [];
        
        if (file.name.endsWith('.json')) {
          importedData = JSON.parse(content);
        } else if (file.name.endsWith('.csv')) {
          const lines = content.split('\n');
          const headers = lines[0].split(',').map(h => h.trim());
          importedData = lines.slice(1).filter(line => line.trim()).map(line => {
            const values = line.split(',').map(v => v.trim());
            const obj = {};
            headers.forEach((header, index) => {
              obj[header] = values[index] || '';
            });
            return obj;
          });
        }
        
        // Process imported data and add to projects
        const newProjects = importedData.map((item, index) => ({
          id: item.id || `P${Date.now() + index}`,
          name: item.name || item.productName || `Imported Product ${index + 1}`,
          status: item.status || 'Pending',
          budget: parseFloat(item.budget) || 0,
          actualCost: parseFloat(item.actualCost) || 0,
          progress: parseInt(item.progress) || 0,
          manager: item.manager || 'Admin',
          startDate: item.startDate || new Date().toISOString().split('T')[0],
          endDate: item.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          type: item.type || 'General',
          region: item.region || 'NSW',
          materials: parseFloat(item.materials) || 0,
          tasks: parseFloat(item.tasks) || 0,
          labour: parseFloat(item.labour) || 0
        }));
        
        setProjects(prev => [...prev, ...newProjects]);
        alert(`Successfully imported ${newProjects.length} products!`);
      } catch (error) {
        alert('Error importing file. Please check the format and try again.');
        console.error('Import error:', error);
      }
    };
    reader.readAsText(file);
  };

  const handleBulkExport = () => {
    const exportData = projects.map(project => ({
      id: project.id,
      name: project.name,
      status: project.status,
      budget: project.budget,
      actualCost: project.actualCost,
      progress: project.progress,
      manager: project.manager,
      startDate: project.startDate,
      endDate: project.endDate,
      type: project.type,
      region: project.region,
      materials: project.materials,
      tasks: project.tasks,
      labour: project.labour
    }));
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `products_export_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };


    // Project management functions
    const getStatusColor = (status) => {
      switch (status.toLowerCase()) {
        case 'completed': return '#10b981';
        case 'in progress': return '#27A5C5';
        case 'planning': return '#f59e0b';
        case 'on hold': return '#ef4444';
        default: return '#6b7280';
      }
    };

    // Project action handlers
    const handleEditProject = (project) => {
      console.log('Edit project clicked:', project);
      setEditingProject(project);
      setEditProjectForm({
        name: project.name,
        description: project.description,
        manager: project.manager,
        budget: project.budget,
        actualCost: project.actualCost,
        startDate: project.startDate,
        endDate: project.endDate,
        status: project.status,
        priority: project.priority,
        progress: project.progress
      });
      setShowEditProjectModal(true);
    };

    const handleSaveProject = () => {
      if (editingProject) {
        const updatedProject = { ...editingProject, ...editProjectForm };
        setProjects(prev => prev.map(p => p.id === editingProject.id ? updatedProject : p));
        setShowEditProjectModal(false);
        setEditingProject(null);
        setEditProjectForm({});
      }
    };

    const handleCancelEdit = () => {
      setShowEditProjectModal(false);
      setEditingProject(null);
      setEditProjectForm({});
    };

    const handleViewProject = (project) => {
      console.log('View project clicked:', project);
      const daysRemaining = calculateDaysRemaining(project.endDate);
      const isOverdue = daysRemaining < 0;
      
      alert(` Project Details: ${project.name}

  Project ID: ${project.id}
  Manager: ${project.manager}
  Category: ${project.category}
  Status: ${project.status}
  Priority: ${project.priority}
  Progress: ${project.progress}%

  Budget: ${formatPrice(project.budget)}
  Spent: ${formatPrice(project.actualCost)}
  Remaining: ${formatPrice(project.budget - project.actualCost)}

  Start Date: ${formatDate(project.startDate)}
  End Date: ${formatDate(project.endDate)}
  ${isOverdue ? `Overdue by ${Math.abs(daysRemaining)} days` : `${daysRemaining} days remaining`}

  Description: ${project.description}`);
      // TODO: Implement detailed view modal
    };

    const handleDeleteProject = (project) => {
      console.log('Delete project clicked:', project);
      if (window.confirm(`Are you sure you want to delete project "${project.name}"?\n\nThis action cannot be undone.`)) {
        // Remove project from state
        setProjects(prevProjects => prevProjects.filter(p => p.id !== project.id));
        alert(`Project "${project.name}" has been deleted successfully!`);
      }
    };

    const handleNewProject = () => {
      console.log('New project button clicked');
      
      // Create a sample new project
      const newProject = {
        id: `P${Date.now()}`, // Generate unique ID
        name: `New Project ${Math.floor(Math.random() * 1000)}`,
        status: 'Planning',
        budget: 50000,
        actualCost: 0,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
        description: 'This is a newly created project. Click Edit to modify details.',
        manager: 'New Manager',
        progress: 0,
        priority: 'Medium',
        category: 'Development'
      };
      
      // Add to projects state
      setProjects(prevProjects => [newProject, ...prevProjects]);
      
      alert(`✅ New Project Created!\n\nProject: ${newProject.name}\nID: ${newProject.id}\nManager: ${newProject.manager}\nBudget: ${formatPrice(newProject.budget)}\n\nClick Edit button to modify project details.`);
    };

    const handleSubmitProject = () => {
      const totalCost = calcFinalTotal();
      
      if (totalCost === 0) {
        alert('Please add materials, equipment, or labor before submitting the project.');
        return;
      }

      // Prompt for project name if not provided
      let name = projectName.trim();
      if (!name) {
        name = prompt('Enter project name:');
        if (!name || name.trim() === '') {
          alert('Project name is required.');
          return;
        }
        setProjectName(name.trim());
      }

      // Create project from rate card
      const newProject = {
        id: `P${Date.now()}`,
        name: name,
        status: 'Planning',
        budget: totalCost,
        actualCost: 0,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 90 days from now
        description: `Project created from rate card calculation. Total budget: ${formatPrice(totalCost)}`,
        manager: 'Project Manager',
        progress: 0,
        priority: 'Medium',
        category: 'Rate Card Project'
      };

      // Add to projects state
      setProjects(prevProjects => [newProject, ...prevProjects]);

      // Clear rate card data
      setSelectedMaterials([]);
      setSelectedEquipment([]);
      setSelectedLabor([]);
      setCraneEnabled(false);
      setCraneAmount(0);
      setRiskEnabled(false);
      setRiskPercent(10);
      setProjectName('');

      // Show success message and navigate to projects
      alert(`✅ Project Submitted Successfully!\n\nProject: ${name}\nID: ${newProject.id}\nBudget: ${formatPrice(totalCost)}\n\nRedirecting to Projects page...`);
      
      // Navigate to projects page
      setCurrentPage('projects');
    };

    // Test function to verify button clicks
    const testButtonClick = (action, project) => {
      console.log(`${action} button clicked for project:`, project.name);
      alert(`${action} button works! Project: ${project.name}`);
    };

    const getPriorityColor = (priority) => {
      switch (priority.toLowerCase()) {
        case 'high': return '#ef4444';
        case 'medium': return '#f59e0b';
        case 'low': return '#10b981';
        default: return '#6b7280';
      }
    };

    const getProgressColor = (progress) => {
      if (progress >= 80) return '#10b981';
      if (progress >= 60) return '#27A5C5';
      if (progress >= 40) return '#f59e0b';
      return '#ef4444';
    };

    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    };

    const calculateDaysRemaining = (endDate) => {
      const end = new Date(endDate);
      const today = new Date();
      const diffTime = end - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    };

    // Scroll to top functions
    const handleScroll = () => {
      // Scroll handling removed since SLC Pricebook is no longer available on user side
    };

    const scrollToTop = () => {
      // Scroll to top function removed since SLC Pricebook is no longer available on user side
    };

    // Add scroll event listener - removed since SLC Pricebook is no longer available on user side

    // Modal handlers
    const handleAddMaterial = () => {
      setModalMode('add');
      setActiveTab(inventoryTab);
      setEditingMaterial(null);
      setShowModal(true);
    };

    const handleEditMaterial = (material) => {
      setModalMode('edit');
      setActiveTab(inventoryTab);
      setEditingMaterial(material);
      setViewingMaterial(null);
      setShowModal(true);
    };

    const handleViewMaterial = (material) => {
      setModalMode('view');
      setActiveTab(inventoryTab);
      setViewingMaterial(material);
      setEditingMaterial(null);
      setShowModal(true);
    };

    const handleDeleteMaterial = (materialId) => {
      if (inventoryTab === 'materials') {
        setMaterials(materials.filter(m => m.id !== materialId));
      } else {
        setEquipment(equipment.filter(e => e.id !== materialId));
      }
    };

    const handleEditClick = (material) => {
      handleEditMaterial(material);
    };

    const handleModalClose = () => {
      setShowModal(false);
      setEditingMaterial(null);
      setViewingMaterial(null);
    };

    const handleModalSubmit = (formData) => {
      if (modalMode === 'add') {
        if (activeTab === 'materials') {
          setMaterials([...materials, formData]);
        } else {
          setEquipment([...equipment, formData]);
        }
      } else if (modalMode === 'edit' && editingMaterial) {
        if (activeTab === 'materials') {
          const oldMaterial = materials.find(m => m.id === editingMaterial.id);
          if (oldMaterial && oldMaterial.price !== formData.price) {
            trackPriceChange('material', editingMaterial.id, oldMaterial.price, formData.price, formData.description);
          }
          setMaterials(materials.map(m => m.id === editingMaterial.id ? formData : m));
        } else {
          const oldEquipment = equipment.find(e => e.id === editingMaterial.id);
          if (oldEquipment && oldEquipment.price !== formData.price) {
            trackPriceChange('equipment', editingMaterial.id, oldEquipment.price, formData.price, formData.name);
          }
          setEquipment(equipment.map(e => e.id === editingMaterial.id ? formData : e));
        }
      }
      handleModalClose();
    };

    return (
      <div className="shell">
        {/* Dashboard Mode Switch */}
        <div className={`dashboard-switch ${dashboardMode === 'user' ? 'is-admin' : 'is-user'}`} role="tablist" aria-label="Dashboard mode">
          <div className="segmented">
            <span 
              className={`segment-indicator ${dashboardMode === 'user' ? 'left' : 'right'}`}
              aria-hidden="true"
            />
            <button 
              className={`segment segment--admin ${dashboardMode === 'user' ? 'active' : ''}`}
              onClick={() => switchDashboard('user')}
              role="tab"
              aria-selected={dashboardMode === 'user'}
            >
              User
            </button>
            <button 
              className={`segment segment--user ${dashboardMode === 'admin' ? 'active' : ''}`}
              onClick={() => switchDashboard('admin')}
              role="tab"
              aria-selected={dashboardMode === 'admin'}
            >
              Admin
            </button>
          </div>
        </div>

        {/* Enhanced Sidebar */}
        <aside className="sidebar">
          <div className="logo">
            <span className="logo-icon"></span>
            <span className="logo-text">
              {dashboardMode === 'user' ? 'Decon User' : 'Decon Admin'}
            </span>
          </div>
          
          {dashboardMode === 'user' ? (
          <nav className="nav">
            <a 
              href="#" 
              className={`nav-link ${currentPage === 'projects' ? 'active' : ''}`}
              onClick={() => setCurrentPage('projects')}
            >
              <span>SOR</span>
            </a>
            <a 
              href="#" 
              className={`nav-link ${currentPage === 'quotation' ? 'active' : ''}`}
              onClick={() => setCurrentPage('quotation')}
            >
              <span>Quotation</span>
            </a>
            <a 
              href="#" 
              className={`nav-link ${currentPage === 'reports' ? 'active' : ''}`}
              onClick={() => setCurrentPage('reports')}
            >
              <span>Reports</span>
            </a>
            </nav>
          ) : (
            <nav className="nav">
              <a 
                href="#" 
                className={`nav-link ${currentPage === 'dashboard' ? 'active' : ''}`}
                onClick={() => setCurrentPage('dashboard')}
              >
                <span>Dashboard</span>
              </a>
              <a 
                href="#" 
                className={`nav-link ${currentPage === 'my-projects' ? 'active' : ''}`}
                onClick={() => setCurrentPage('my-projects')}
              >
                <span>Labour</span>
              </a>
              <a 
                href="#" 
                className={`nav-link ${currentPage === 'tasks' ? 'active' : ''}`}
                onClick={() => setCurrentPage('tasks')}
              >
                <span>Inventory</span>
              </a>
              <a 
                href="#" 
                className={`nav-link ${currentPage === 'admin-rate-card' ? 'active' : ''}`}
                onClick={() => setCurrentPage('admin-rate-card')}
              >
                <span>SOR Pricebook</span>
              </a>
              <a 
                href="#" 
                className={`nav-link ${currentPage === 'notifications' ? 'active' : ''}`}
                onClick={() => setCurrentPage('notifications')}
              >
                <span>Notifications</span>
            </a>
          </nav>
          )}
          
          
        </aside>

        {/* Main Content */}
        <main className="main">
          

          {dashboardMode === 'user' && currentPage === 'projects' && (
            <>
              <header className="topbar">
                <div className="topbar-left">
                  <img src="/decon-logo.png" alt="Decon Logo" className="topbar-logo" />
                  <div className="topbar-text">
                    <div className="topbar-title">Decon Services Portal</div>
                    <div className="topbar-subtitle">National Rate Card</div>
                  </div>
                </div>
              </header>

              <section className="content">
                <div className="content-header">
                  <h1 className="title">Projects</h1>
                  <div className="project-stats">
                    <div className="stat-item">
                      <span className="stat-label">Total Roles:</span>
                      <span className="stat-value">{projects.length}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Active:</span>
                      <span className="stat-value">{projects.filter(p => p.status === 'In Progress').length}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Completed:</span>
                      <span className="stat-value">{projects.filter(p => p.status === 'Completed').length}</span>
                    </div>
                  </div>
                </div>

                <div className="projects-grid">
                  {projects.map(project => {
                    const daysRemaining = calculateDaysRemaining(project.endDate);
                    const isOverdue = daysRemaining < 0;
                    const savings = project.budget - project.actualCost;
                    
                    return (
                      <div key={project.id} className="project-card">
                        <div className="project-header">
                          <div className="project-title-section">
                            <h3 className="project-title">{project.name}</h3>
                            <div className="project-id">#{project.id}</div>
                          </div>
                          <div className="project-actions">
                            <button 
                              className="action-btn" 
                              title="Edit Role"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                console.log('Edit button clicked for:', project.name);
                                handleEditProject(project);
                              }}
                            >
                              ✏️
                            </button>
                            <button 
                              className="action-btn" 
                              title="View Role"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                console.log('View button clicked for:', project.name);
                                handleViewProject(project);
                              }}
                            >
                              👁
                            </button>
                            <button 
                              className="action-btn" 
                              title="Delete Role"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                console.log('Delete button clicked for:', project.name);
                                handleDeleteProject(project);
                              }}
                            >
                              🗑️
                            </button>
                          </div>
                        </div>

                        <div className="project-content">
                          <div className="project-meta">
                            <div className="meta-item">
                              <span className="meta-label">Manager:</span>
                              <span className="meta-value">{project.manager}</span>
                            </div>
                            <div className="meta-item">
                              <span className="meta-label">Category:</span>
                              <span className="meta-value">{project.category}</span>
                            </div>
                          </div>

                          <div className="project-status-section">
                            <div className="priority-badge" style={{
                              backgroundColor: project.priority === 'High' ? 'rgba(255, 163, 163, 0.2)' : 
                                            project.priority === 'Medium' ? 'rgba(255, 210, 125, 0.2)' : 
                                            'rgba(34, 197, 94, 0.2)',
                              color: project.priority === 'High' ? '#7D7C7C' : 
                                    project.priority === 'Medium' ? '#7D7C7C' : 
                                    '#16a34a',
                              padding: '6px 12px', 
                              borderRadius: '4px', 
                              fontSize: '14px', 
                              fontWeight: '500'
                            }}>
                              {project.priority} Priority
                            </div>
                          </div>

                          <div className="project-progress">
                            <div className="progress-header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px'}}>
                              <span className="progress-label" style={{fontSize: '16px', color: '#6b7280'}}>Progress</span>
                              <span className="progress-percentage" style={{fontSize: '16px', fontWeight: '500', color: '#374151'}}>{project.progress}%</span>
                            </div>
                            <div className="progress-bar" style={{width: '100%', height: '4px', backgroundColor: '#e5e7eb', borderRadius: '2px'}}>
                              <div 
                                className="progress-fill" 
                                style={{
                                  width: `${project.progress}%`,
                                  height: '100%',
                                  backgroundColor: '#C8E2EA',
                                  borderRadius: '2px',
                                  transition: 'width 0.3s ease'
                                }}
                              ></div>
                            </div>
                          </div>

                          <div className="project-dates">
                            <div className="date-item">
                              <span className="date-label">Start:</span>
                              <span className="date-value">{formatDate(project.startDate)}</span>
                            </div>
                            <div className="date-item">
                              <span className="date-label">End:</span>
                              <span className="date-value">{formatDate(project.endDate)}</span>
                            </div>
                            <div className="date-item">
                              <span className="date-label">
                                {isOverdue ? 'Overdue by:' : 'Days left:'}
                              </span>
                              <span className={`date-value ${isOverdue ? 'overdue' : ''}`}>
                                {isOverdue ? `${Math.abs(daysRemaining)} days` : `${daysRemaining} days`}
                              </span>
                            </div>
                          </div>

                          <div className="project-financials">
                            <div className="financial-item">
                              <span className="financial-label" style={{color: '#000000'}}>Budget:</span>
                              <span className="financial-value budget" style={{color: '#5B5B5B'}}>{formatPrice(project.budget)}</span>
                            </div>
                            <div className="financial-item">
                              <span className="financial-label" style={{color: '#000000'}}>Spent:</span>
                              <span className="financial-value spent" style={{color: '#5B5B5B'}}>{formatPrice(project.actualCost)}</span>
                            </div>
                            <div className="financial-item">
                              <span className="financial-label" style={{color: '#000000'}}>Remaining:</span>
                              <span className={`financial-value ${savings >= 0 ? 'savings' : 'overbudget'}`} style={{color: '#5B5B5B'}}>
                                {formatPrice(savings)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            </>
          )}

          {dashboardMode === 'user' && currentPage === 'quotation' && (
            <>
              <header className="topbar">
                <div className="topbar-left">
                  <img src="/decon-logo.png" alt="Decon Logo" className="topbar-logo" />
                  <div className="topbar-text">
                    <div className="topbar-title">Decon Services Portal</div>
                    <div className="topbar-subtitle">National Rate Card</div>
                  </div>
                </div>
              </header>

              <section className="content">
                <div className="page-header" style={{textAlign:'center'}}>
                  <h1 style={{fontSize:'2.4rem', fontWeight:'700', color:'#1f2937', margin:'0 0 8px 0'}}>National Rate Card</h1>
                  <p style={{color:'#6b7280', margin:'0', fontSize:'16px'}}>Instant, transparent estimates based on your region and selections</p>
                <hr style={{border:'none', height:'2px', background:'#C8C9CB', margin:'20px auto', width:'100%', borderRadius:'1px'}} />
                </div>

                {/* Quotation Router with React Router */}
                <QuotationRouter />
              </section>
            </>
          )}

          {dashboardMode === 'user' && currentPage === 'reports' && (
            <>
              <header className="topbar">
                <div className="topbar-left">
                  <img src="/decon-logo.png" alt="Decon Logo" className="topbar-logo" />
                  <div className="topbar-text">
                    <div className="topbar-title">Decon Services Portal</div>
                    <div className="topbar-subtitle">National Rate Card</div>
                  </div>
                </div>
                <div className="topbar-actions">
                  <button className="btn btn-secondary" onClick={exportPerformanceCSV}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14,2 14,8 20,8"></polyline>
                      <line x1="16" y1="13" x2="8" y2="13"></line>
                      <line x1="16" y1="17" x2="8" y2="17"></line>
                      <polyline points="10,9 9,9 8,9"></polyline>
                    </svg>
                    Export CSV
                  </button>
                  <button className="btn btn-primary" onClick={exportReportPDF}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
                      <path d="M21 3v5h-5"></path>
                      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
                      <path d="M3 21v-5h5"></path>
                    </svg>
                    Export PDF
                  </button>
                </div>
              </header>

              <section className="content" ref={reportRef}>
                <div className="content-header">
                  <h1 className="title">Performance Reports & Analytics</h1>
                  <div className="date-range">
                    <span>Last Updated: {new Date().toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Enhanced KPI Cards */}
                <div className="kpi-grid">
                  {(() => { const s = getOverallStats(); return (
                    <>
                      <div className="kpi-card">
                        <div className="kpi-icon"></div>
                        <div className="kpi-content">
                          <h3 className="kpi-title">Total Projects</h3>
                          <div className="kpi-value">{s.totalProjects}</div>
                          <div className="kpi-change">All statuses</div>
                        </div>
                      </div>
                      <div className="kpi-card">
                        <div className="kpi-icon"></div>
                        <div className="kpi-content">
                          <h3 className="kpi-title">Completed</h3>
                          <div className="kpi-value">{s.completedProjects}</div>
                          <div className="kpi-change">{s.completionRate.toFixed(1)}% rate</div>
                        </div>
                      </div>
                      <div className="kpi-card">
                        <div className="kpi-icon"></div>
                        <div className="kpi-content">
                          <h3 className="kpi-title">Total Budget</h3>
                          <div className="kpi-value">{formatPrice(s.totalBudget)}</div>
                          <div className="kpi-change">All projects</div>
                        </div>
                      </div>
                      <div className="kpi-card">
                        <div className="kpi-icon"></div>
                        <div className="kpi-content">
                          <h3 className="kpi-title">Actual Cost</h3>
                          <div className="kpi-value">{formatPrice(s.totalActualCost)}</div>
                          <div className="kpi-change">To date</div>
                        </div>
                      </div>
                      <div className="kpi-card">
                        <div className="kpi-icon"></div>
                        <div className="kpi-content">
                          <h3 className="kpi-title">Savings</h3>
                          <div className="kpi-value">{formatPrice(s.totalSavings)}</div>
                          <div className="kpi-change">vs budget</div>
                        </div>
                      </div>
                      <div className="kpi-card">
                        <div className="kpi-icon"></div>
                        <div className="kpi-content">
                          <h3 className="kpi-title">Avg Efficiency</h3>
                          <div className="kpi-value">{s.avgEfficiency.toFixed(1)}%</div>
                          <div className="kpi-change">Portfolio</div>
                        </div>
                      </div>
                    </>
                  )})()}
                </div>

                {/* Enhanced Charts Section */}
                <div className="charts-grid">
                  <div className="chart-card">
                    <div className="chart-header">
                      <h3>Monthly Cost Trend</h3>
                      <div className="chart-legend">
                        <span className="legend-item">
                          <span className="legend-color" style={{background: '#27A5C5'}}></span>
                          Budget
                        </span>
                        <span className="legend-item">
                          <span className="legend-color" style={{background: '#10b981'}}></span>
                          Actual
                        </span>
                      </div>
                    </div>
                    <div className="bar-chart">
                      {[
                        {budget: 65, actual: 60, month: 'Jan'},
                        {budget: 45, actual: 42, month: 'Feb'},
                        {budget: 80, actual: 75, month: 'Mar'},
                        {budget: 60, actual: 58, month: 'Apr'},
                        {budget: 75, actual: 70, month: 'May'},
                        {budget: 90, actual: 85, month: 'Jun'},
                        {budget: 70, actual: 68, month: 'Jul'},
                        {budget: 85, actual: 80, month: 'Aug'},
                        {budget: 95, actual: 88, month: 'Sep'},
                        {budget: 80, actual: 75, month: 'Oct'},
                        {budget: 70, actual: 65, month: 'Nov'},
                        {budget: 85, actual: 78, month: 'Dec'}
                      ].map((data, i) => (
                        <div key={i} className="chart-bar-group">
                          <div className="chart-bars">
                            <div 
                              className="chart-bar budget-bar" 
                              style={{height: `${data.budget}%`}}
                              title={`${data.month}: Budget $${data.budget}k`}
                            ></div>
                            <div 
                              className="chart-bar actual-bar" 
                              style={{height: `${data.actual}%`}}
                              title={`${data.month}: Actual $${data.actual}k`}
                            ></div>
                          </div>
                          <div className="chart-label">{data.month}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="chart-card">
                    <div className="chart-header">
                      <h3>Cost Breakdown</h3>
                      <div className="chart-legend">
                        <span className="legend-item">
                          <span className="legend-color" style={{background: '#27A5C5'}}></span>
                          Materials
                        </span>
                        <span className="legend-item">
                          <span className="legend-color" style={{background: '#10b981'}}></span>
                          Equipment
                        </span>
                        <span className="legend-item">
                          <span className="legend-color" style={{background: '#f59e0b'}}></span>
                          Labor
                        </span>
                      </div>
                    </div>
                    <div className="pie-chart">
                      <div className="pie-segments">
                        <div className="pie-segment materials" style={{transform: 'rotate(0deg)', background: 'conic-gradient(#27A5C5 0deg 120deg, #10b981 120deg 240deg, #f59e0b 240deg 360deg)'}}></div>
                      </div>
                      <div className="pie-center">
                        <div className="pie-total">$2.4M</div>
                        <div className="pie-label">Total Cost</div>
                      </div>
                      <div className="pie-details">
                        <div className="pie-detail">
                          <span className="pie-detail-color" style={{background: '#27A5C5'}}></span>
                          <span className="pie-detail-label">Materials</span>
                          <span className="pie-detail-value">$1.2M (50%)</span>
                        </div>
                        <div className="pie-detail">
                          <span className="pie-detail-color" style={{background: '#10b981'}}></span>
                          <span className="pie-detail-label">Equipment</span>
                          <span className="pie-detail-value">$0.8M (33%)</span>
                        </div>
                        <div className="pie-detail">
                          <span className="pie-detail-color" style={{background: '#f59e0b'}}></span>
                          <span className="pie-detail-label">Labor</span>
                          <span className="pie-detail-value">$0.4M (17%)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Enhanced Project Performance Table */}
                <div className="performance-table-card">
                  <div className="table-header">
                    <h3>Project Performance Overview</h3>
                    <div className="table-actions">
                      <button className="btn btn-sm btn-secondary">Filter</button>
                      <button className="btn btn-sm btn-primary">Sort</button>
                    </div>
                  </div>
                  <div className="table-container">
                    <table className="performance-table">
                      <thead>
                        <tr>
                          <th>Project ID</th>
                          <th>Name</th>
                          <th>Status</th>
                          <th>Budget</th>
                          <th>Actual Cost</th>
                          <th>Savings</th>
                          <th>Efficiency</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {projects.map(project => {
                          const savings = project.budget - project.actualCost;
                          const efficiency = project.budget > 0 ? ((project.budget - project.actualCost) / project.budget) * 100 : 0;
                          return (
                            <tr key={project.id} className="performance-row">
                              <td>
                                <span className="project-id">{project.id}</span>
                              </td>
                              <td>
                                <div className="project-name">{project.name}</div>
                              </td>
                              <td>
                                <span className={`status-badge status-${project.status.toLowerCase().replace(' ', '-')}`}>
                                  {project.status}
                                </span>
                              </td>
                              <td>
                                <span className="budget-amount">{formatPrice(project.budget)}</span>
                              </td>
                              <td>
                                <span className="actual-amount">{formatPrice(project.actualCost)}</span>
                              </td>
                              <td>
                                <span className={`savings-amount ${savings >= 0 ? 'positive' : 'negative'}`}>
                                  {formatPrice(savings)}
                                </span>
                              </td>
                              <td>
                                <div className="efficiency-bar">
                                  <div className="efficiency-fill" style={{width: `${Math.min(efficiency, 100)}%`}}></div>
                                  <span className="efficiency-text">{efficiency.toFixed(1)}%</span>
                                </div>
                              </td>
                              <td>
                                <div className="table-actions">
                                  <button className="action-btn view-btn" title="View Details">👁</button>
                                  <button className="action-btn edit-btn" title="Edit Project">✏️</button>
                                  <button className="action-btn export-btn" title="Export Report">📄</button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>
            </>
          )}

          {/* Admin Dashboard Content */}
          {dashboardMode === 'admin' && (
            <>
              {currentPage === 'dashboard' && (
                <section className="content">
                  <div className="welcome-section" style={{padding:'24px 0', textAlign:'center'}}>
                    <h1 style={{fontSize:'3.2rem', fontWeight:'700', color:'#1f2937', margin:'0'}}>Admin Dashboard</h1>
                    <p style={{margin:'8px 0 0 0', color:'#6b7280', fontSize:'18px'}}>Welcome back! Here's your project overview</p>
                  </div>

                  <div className="user-dashboard-grid">
                    {/* Simple Stats Grid */}
                    <div className="stats-grid" style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:'16px', marginBottom:'32px'}}>
                      <div className="stat-card" style={{
                      background:'#F3F3F3',
                        padding:'20px',
                        borderRadius:'8px',
                        boxShadow:'0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                        border:'1px solid #e5e7eb'
                      }}>
                        <div style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
                          <div>
                            <h3 style={{margin:'0 0 4px 0', fontSize:'16px', color:'#6b7280', fontWeight:'500'}}>Total Projects</h3>
                            <div style={{fontSize:'2.1rem', fontWeight:'600', color:'#1f2937'}}>{projects.length}</div>
                        </div>
                          <div style={{fontSize:'1.5rem', color:'#9ca3af'}}></div>
                      </div>
                          </div>
                      
                      <div className="stat-card" style={{
                      background:'#F3F3F3',
                        padding:'20px',
                        borderRadius:'8px',
                        boxShadow:'0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                        border:'1px solid #e5e7eb'
                      }}>
                        <div style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
                          <div>
                            <h3 style={{margin:'0 0 4px 0', fontSize:'16px', color:'#6b7280', fontWeight:'500'}}>Active Projects</h3>
                            <div style={{fontSize:'2.1rem', fontWeight:'600', color:'#1f2937'}}>{projects.filter(p => p.status === 'In Progress').length}</div>
                        </div>
                          <div style={{fontSize:'1.5rem', color:'#9ca3af'}}></div>
                      </div>
                          </div>
                      
                      <div className="stat-card" style={{
                      background:'#F3F3F3',
                        padding:'20px',
                        borderRadius:'8px',
                        boxShadow:'0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                        border:'1px solid #e5e7eb'
                      }}>
                        <div style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
                          <div>
                            <h3 style={{margin:'0 0 4px 0', fontSize:'16px', color:'#6b7280', fontWeight:'500'}}>Completed</h3>
                            <div style={{fontSize:'2.1rem', fontWeight:'600', color:'#1f2937'}}>{projects.filter(p => p.status === 'Completed').length}</div>
                        </div>
                          <div style={{fontSize:'1.5rem', color:'#9ca3af'}}></div>
                      </div>
                        </div>
                      
                      <div className="stat-card" style={{
                      background:'#F3F3F3',
                        padding:'20px',
                        borderRadius:'8px',
                        boxShadow:'0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                        border:'1px solid #e5e7eb'
                      }}>
                        <div style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
                          <div>
                            <h3 style={{margin:'0 0 4px 0', fontSize:'16px', color:'#6b7280', fontWeight:'500'}}>Total Budget</h3>
                            <div style={{fontSize:'2.1rem', fontWeight:'600', color:'#1f2937'}}>{formatPrice(projects.reduce((sum, p) => sum + p.budget, 0))}</div>
                          </div>
                          <div style={{fontSize:'1.5rem', color:'#9ca3af'}}></div>
                        </div>
                      </div>
                      
                      <div className="stat-card" style={{
                      background:'#F3F3F3',
                        padding:'20px',
                        borderRadius:'8px',
                        boxShadow:'0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                        border:'1px solid #e5e7eb'
                      }}>
                        <div style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
                          <div>
                            <h3 style={{margin:'0 0 4px 0', fontSize:'16px', color:'#6b7280', fontWeight:'500'}}>Active Alerts</h3>
                            <div style={{fontSize:'2.1rem', fontWeight:'600', color:'#1f2937'}}>{getAllAdminNotifications().filter(n => !n.read).length}</div>
                          </div>
                          <div style={{fontSize:'1.5rem', color:'#9ca3af'}}></div>
                        </div>
                      </div>
                      
                      <div className="stat-card" style={{
                      background:'#F3F3F3',
                        padding:'20px',
                        borderRadius:'8px',
                        boxShadow:'0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                        border:'1px solid #e5e7eb'
                      }}>
                        <div style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
                          <div>
                            <h3 style={{margin:'0 0 4px 0', fontSize:'16px', color:'#6b7280', fontWeight:'500'}}>Success Rate</h3>
                            <div style={{fontSize:'2.1rem', fontWeight:'600', color:'#1f2937'}}>
                              {projects.length > 0 ? Math.round((projects.filter(p => p.status === 'Completed').length / projects.length) * 100) : 0}%
                            </div>
                          </div>
                          <div style={{fontSize:'1.5rem', color:'#9ca3af'}}></div>
                        </div>
                      </div>
                    </div>

                  {/* Search Section */}
                  <div className="admin-search" style={{marginBottom:'32px', padding:'20px', backgroundColor:'#f8fafc', borderRadius:'12px', border:'1px solid #e2e8f0'}}>
                    <h3 style={{margin:'0 0 16px 0', fontSize:'1.5rem', fontWeight:'600', color:'#1f2937'}}>Search & Filter Products</h3>
                    <div style={{display:'flex', gap:'12px', alignItems:'center', marginBottom:'12px'}}>
                      <div style={{flex:'1', position:'relative'}}>
                        <input
                          type="text"
                          placeholder="🔍 Search by type, code, description, or region..."
                          value={adminSearchTerm}
                          onChange={(e) => setAdminSearchTerm(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '12px 16px',
                            border: '2px solid #e5e7eb',
                            borderRadius: '12px',
                            fontSize: '16px',
                            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                            backgroundColor: '#fff',
                            transition: 'all 0.2s ease',
                            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                            outline: 'none'
                          }}
                          onFocus={(e) => {
                            e.target.style.borderColor = '#27A5C5';
                            e.target.style.boxShadow = '0 0 0 3px rgba(39, 165, 197, 0.1)';
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = '#e5e7eb';
                            e.target.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
                          }}
                        />
                      </div>
                      
                      {/* Status Filter */}
                      <div style={{minWidth:'180px'}}>
                        <select
                          value={adminFilterStatus}
                          onChange={(e) => setAdminFilterStatus(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '12px 16px',
                            border: '2px solid #e5e7eb',
                            borderRadius: '12px',
                            fontSize: '16px',
                            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                            backgroundColor: '#fff',
                            transition: 'all 0.2s ease',
                            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                            outline: 'none',
                            cursor: 'pointer'
                          }}
                          onFocus={(e) => {
                            e.target.style.borderColor = '#27A5C5';
                            e.target.style.boxShadow = '0 0 0 3px rgba(39, 165, 197, 0.1)';
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = '#e5e7eb';
                            e.target.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
                          }}
                        >
                          <option value="">All Status</option>
                          <option value="in progress">In Progress</option>
                          <option value="completed">Completed</option>
                          <option value="pending">Pending</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                      
                      {/* Clear Filters Button */}
                      {(adminSearchTerm || adminFilterStatus) && (
                        <button
                          onClick={() => {
                            setAdminSearchTerm('');
                            setAdminFilterStatus('');
                          }}
                          style={{
                            padding: '12px 16px',
                            backgroundColor: '#6b7280',
                            color: 'white',
                            border: 'none',
                            borderRadius: '12px',
                            fontSize: '14px',
                            cursor: 'pointer',
                            transition: 'background-color 0.2s',
                            fontWeight: '500'
                          }}
                          onMouseOver={(e) => e.target.style.backgroundColor = '#4b5563'}
                          onMouseOut={(e) => e.target.style.backgroundColor = '#6b7280'}
                        >
                          Clear All
                        </button>
                      )}
                    </div>
                    
                    {/* Search Info */}
                    <div style={{fontSize:'14px', color:'#6b7280'}}>
                      Search across: Type, Code, Description, Region, and Manager
                    </div>
                  </div>


                    {/* Recent Projects */}
                    <div className="recent-projects" style={{marginBottom:'32px'}}>
                      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}>
                      <h2 style={{margin:'0', fontSize:'2.2rem', fontWeight:'600', color:'#1f2937'}}>Recent SOR Products ({getFilteredAdminProjects().length})</h2>
                      <div style={{display:'flex', gap:'8px', alignItems:'center'}}>
                        {/* Import Button */}
                        <button
                          onClick={() => {
                            // Create file input for import
                            const input = document.createElement('input');
                            input.type = 'file';
                            input.accept = '.csv,.xlsx,.json';
                            input.onchange = (e) => {
                              const file = e.target.files[0];
                              if (file) {
                                handleBulkImport(file);
                              }
                            };
                            input.click();
                          }}
                          style={{
                            padding: '8px 16px',
                            backgroundColor: '#f59e0b',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '14px',
                            cursor: 'pointer',
                            transition: 'background-color 0.2s',
                            fontWeight: '500',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}
                          onMouseOver={(e) => e.target.style.backgroundColor = '#d97706'}
                          onMouseOut={(e) => e.target.style.backgroundColor = '#f59e0b'}
                        >
                          Import
                        </button>
                        
                        {/* Export Button */}
                        <button
                          onClick={handleBulkExport}
                          style={{
                            padding: '8px 16px',
                            backgroundColor: '#374151',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '14px',
                            cursor: 'pointer',
                            transition: 'background-color 0.2s',
                            fontWeight: '500',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}
                          onMouseOver={(e) => e.target.style.backgroundColor = '#1f2937'}
                          onMouseOut={(e) => e.target.style.backgroundColor = '#374151'}
                        >
                          Export
                        </button>
                        
                                                <button className="btn btn-secondary" style={{fontSize:'16px', padding:'10px 20px'}}>View All</button>
                      </div>
                      </div>
                      <div className="project-cards" style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(380px, 1fr))', gap:'24px'}}>
                                              {getFilteredAdminProjects().slice(0, 3).map(project => {
                            const daysRemaining = calculateDaysRemaining(project.endDate);
                            const isOverdue = daysRemaining < 0;
                            const budgetUtilization = project.budget > 0 ? (project.actualCost / project.budget * 100).toFixed(1) : 0;
                            return (
                            <div 
                              key={project.id} 
                              className="project-card" 
                              style={{
                                background:'white',
                                borderRadius:'12px',
                                padding:'20px',
                                boxShadow:'0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
                                border:'1px solid #e5e7eb',
                                transition:'all 0.2s ease-in-out',
                                cursor:'pointer'
                              }}
                              onClick={() => {
                                // Switch to user mode first, then navigate to quotation page with pre-selected product
                                setDashboardMode('user');
                                setCurrentPage('quotation');
                                // Store the selected product for the calculator
                                localStorage.setItem('selectedProduct', JSON.stringify({
                                  id: project.id,
                                  name: project.name,
                                  materials: project.materials || 0,
                                  tasks: project.tasks || 0,
                                  labour: project.labour || 0,
                                  baseCost: project.budget || 0
                                }));
                              }}
                              onMouseOver={(e) => {
                                e.target.style.transform = 'translateY(-2px)';
                                e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                              }}
                              onMouseOut={(e) => {
                                e.target.style.transform = 'translateY(0)';
                                e.target.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)';
                              }}
                            >
                                <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'16px'}}>
                                  <div>
                                    <h3 style={{margin:'0 0 4px 0', fontSize:'1.6rem', fontWeight:'600', color:'#1f2937'}}>{project.name}</h3>
                                    <p style={{margin:'0', fontSize:'16px', color:'#6b7280'}}>ID: {project.id}</p>
                                  <button 
                                    style={{
                                      margin:'4px 0 0 0', 
                                      fontSize:'14px', 
                                      color:'#27A5C5', 
                                      fontWeight:'500',
                                      background:'none',
                                      border:'none',
                                      cursor:'pointer',
                                      textDecoration:'underline',
                                      padding:'0',
                                      fontFamily:'inherit'
                                    }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      // Switch to user mode first, then navigate to quotation
                                      setDashboardMode('user');
                                      setCurrentPage('quotation');
                                      localStorage.setItem('selectedProduct', JSON.stringify({
                                        id: project.id,
                                        name: project.name,
                                        materials: project.materials || 0,
                                        tasks: project.tasks || 0,
                                        labour: project.labour || 0,
                                        baseCost: project.budget || 0
                                      }));
                                    }}
                                    onMouseOver={(e) => {
                                      e.target.style.color = '#1d4ed8';
                                      e.target.style.textDecoration = 'none';
                                    }}
                                    onMouseOut={(e) => {
                                      e.target.style.color = '#27A5C5';
                                      e.target.style.textDecoration = 'underline';
                                    }}
                                  >
                                    Click to create quote →
                                  </button>
                                  </div>
                                                                  <span style={{
                                    padding:'6px 10px',
                                    borderRadius:'4px',
                                    fontSize:'14px',
                                    fontWeight:'500',
                                    backgroundColor: '#f3f4f6',
                                    color: '#374151'
                                  }}>
                                {project.status}
                              </span>
                            </div>
                                
                                <div style={{marginBottom:'16px'}}>
                                  <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'8px'}}>
                                    <span style={{fontSize:'16px', color:'#6b7280'}}>Progress</span>
                                    <span style={{fontSize:'16px', fontWeight:'500', color:'#1f2937'}}>{project.progress}%</span>
                              </div>
                                                                                                    <div style={{
                                    width:'100%',
                                    height:'4px',
                                    backgroundColor:'#e5e7eb',
                                    borderRadius:'2px',
                                    overflow:'hidden'
                                  }}>
                                    <div style={{
                                      width:`${project.progress}%`,
                                      height:'100%',
                                      backgroundColor: '#C8E2EA',
                                      borderRadius:'2px',
                                      transition:'width 0.3s ease'
                                    }}></div>
                            </div>
                                </div>
                                
                                <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'16px'}}>
                                  <div>
                                    <span style={{fontSize:'16px', color:'#6b7280', fontWeight:'500'}}>Manager</span>
                                    <div style={{fontSize:'18px', fontWeight:'600', color:'#1f2937'}}>{project.manager}</div>
                                  </div>
                                  <div>
                                    <span style={{fontSize:'16px', color:'#6b7280', fontWeight:'500'}}>Budget</span>
                                    <div style={{fontSize:'18px', fontWeight:'600', color:'#1f2937'}}>{formatPrice(project.budget)}</div>
                                  </div>
                                  <div>
                                    <span style={{fontSize:'16px', color:'#6b7280', fontWeight:'500'}}>Spent</span>
                                    <div style={{fontSize:'18px', fontWeight:'600', color:'#1f2937'}}>{formatPrice(project.actualCost)}</div>
                                  </div>
                                  <div>
                                    <span style={{fontSize:'16px', color:'#6b7280', fontWeight:'500'}}>Utilization</span>
                                    <div style={{fontSize:'18px', fontWeight:'600', color: budgetUtilization > 100 ? '#ef4444' : '#1f2937'}}>{budgetUtilization}%</div>
                                  </div>
                                </div>
                                
                                                              <div style={{
                                  padding:'8px 12px',
                                  backgroundColor: '#f9fafb',
                                  borderRadius:'6px',
                                  border:'1px solid #e5e7eb'
                                }}>
                                  <div style={{display:'flex', alignItems:'center', gap:'6px'}}>
                                    <span style={{fontSize:'15px', color:'#374151'}}>
                                      {isOverdue ? `Overdue by ${Math.abs(daysRemaining)} days` : `${daysRemaining} days remaining`}
                                  </span>
                                </div>
                            </div>
                          </div>
                            );
                          })}
                      </div>
                      
                      {/* New SOR Item Button */}
                      <div style={{display: 'flex', justifyContent: 'flex-end', marginTop: '20px'}}>
                        <button
                          onClick={() => {
                            // Add functionality for creating new SOR item
                            console.log('Create new SOR item');
                          }}
                          style={{
                            padding: '12px 24px',
                            backgroundColor: '#37A1B9',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '16px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                          }}
                          onMouseOver={(e) => {
                            e.target.style.backgroundColor = '#2d8ba3';
                            e.target.style.transform = 'translateY(-1px)';
                            e.target.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15)';
                          }}
                          onMouseOut={(e) => {
                            e.target.style.backgroundColor = '#37A1B9';
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
                          }}
                        >
                          Add SOR Item
                        </button>
                      </div>
                    </div>

                  </div>
                </section>
              )}

              {currentPage === 'my-projects' && (
                <section className="content">
                  <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'24px 0', marginBottom:'16px'}}>
                    <h1 style={{fontSize:'2.5rem', fontWeight:'700', color:'#1f2937', margin:'0'}}>Labour</h1>
                    <div style={{display:'flex', gap:'8px'}}>
                      <button className="btn btn-secondary" onClick={addNewLaborType} style={{fontSize:'16px', padding:'12px 20px'}}>➕ Add New Type</button>
                    </div>
                  </div>
                  <div className="card" style={{padding:'16px'}}>
                    {/* Labor Types Management */}
                    <div style={{marginBottom:'20px', padding:'16px', backgroundColor:'#f8fafc', borderRadius:'8px', border:'1px solid #e2e8f0'}}>
                      <h3 style={{margin:'0 0 12px 0', fontSize:'20px', fontWeight:'600'}}>Labor Types Management</h3>
                      <div style={{display:'flex', flexWrap:'wrap', gap:'8px'}}>
                        {getUniqueLaborTypes().map(type => (
                          <div key={type} style={{
                            display:'flex',
                            alignItems:'center',
                            gap:'8px',
                            padding:'8px 16px',
                            backgroundColor:'white',
                            border:'1px solid #d1d5db',
                            borderRadius:'6px',
                            fontSize:'16px'
                          }}>
                            <span style={{textTransform:'capitalize'}}>{type}</span>
                                                        <button
                                onClick={() => deleteLaborType(type)}
                                style={{
                                  background:'none',
                                  border:'none',
                                  color:'#ef4444',
                                  cursor:'pointer',
                                  fontSize:'18px',
                                  padding:'0',
                                  width:'24px',
                                  height:'24px',
                                  display:'flex',
                                  alignItems:'center',
                                  justifyContent:'center'
                                }}
                                title={`Delete ${type} type`}
                              >
                                ×
                              </button>
                          </div>
                        ))}
                        {getUniqueLaborTypes().length === 0 && (
                          <span style={{color:'#6b7280', fontSize:'16px'}}>No labor types defined</span>
                        )}
                      </div>
                    </div>

                  

                    <div className="table-container">
                      <table className="materials-table" style={{fontSize:'16px'}}>
                        <thead>
                          <tr>
                            <th style={{fontSize:'18px', padding:'16px 12px'}}>ID</th>
                            <th style={{fontSize:'18px', padding:'16px 12px'}}>Labour Type</th>
                            <th style={{fontSize:'18px', padding:'16px 12px'}}>Base Rate ($/hr)</th>
                            <th style={{fontSize:'18px', padding:'16px 12px'}}>State Code</th>
                            <th style={{fontSize:'18px', padding:'16px 12px'}}>State Adjustment (%)</th>
                            <th style={{fontSize:'18px', padding:'16px 12px'}}>Effective Rate ($/hr)</th>
                            <th style={{fontSize:'18px', padding:'16px 12px'}}>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {labourRoles.map((role, index) => (
                            <tr key={role.id} style={{height:'60px'}}>
                              <td style={{fontSize:'16px', padding:'16px 12px'}}>{index + 1}</td>
                              <td style={{fontSize:'16px', padding:'16px 12px'}}>
                                <select
                                  className="search-input"
                                  value={role.type}
                                  onChange={(e) => updateRoleField(index, 'type', e.target.value)}
                                  style={{minWidth:'180px', fontSize:'16px'}}
                                >
                                  {getUniqueLaborTypes().map(type => (
                                    <option key={type} value={type}>
                                      {type.charAt(0).toUpperCase() + type.slice(1)}
                                    </option>
                                  ))}
                                </select>
                              </td>
                              <td style={{fontSize:'16px', padding:'16px 12px'}}>
                                <input
                                  type="number"
                                  className="search-input"
                                  value={role.baseRate}
                                  onChange={(e) => updateRoleField(index, 'baseRate', parseFloat(e.target.value) || 0)}
                                  style={{maxWidth:'140px', fontSize:'16px'}}
                                />
                              </td>

                              <td style={{fontSize:'16px', padding:'16px 12px'}}>
                                <select
                                  className="search-input"
                                  value={role.state}
                                  onChange={(e) => updateRoleField(index, 'state', e.target.value)}
                                  style={{minWidth:'160px', fontSize:'16px'}}
                                >
                                  <option value="NSW">NSW</option>
                                  <option value="VIC">VIC</option>
                                  <option value="QLD">QLD</option>
                                  <option value="NT">NT</option>
                                </select>
                              </td>
                              <td style={{fontSize:'16px', padding:'16px 12px'}}>
                                <input
                                  type="number"
                                  className="search-input"
                                  value={role.stateAdjustment || 0}
                                  onChange={(e) => updateRoleField(index, 'stateAdjustment', parseFloat(e.target.value) || 0)}
                                  placeholder="0"
                                  style={{maxWidth:'120px', fontSize:'16px'}}
                                  title="Enter percentage adjustment (e.g., 10 for +10%, -5 for -5%)"
                                />
                              </td>
                              <td className="price-cell" style={{fontSize:'16px', padding:'16px 12px'}}>{formatPrice(getEffectiveRate(role))}</td>
                              <td style={{fontSize:'16px', padding:'16px 12px'}}>
                                <div className="actions">
                                  <button className="act-btn delete" title="Remove" onClick={() => removeLabourRole(index)} style={{fontSize:'18px'}}>🗑</button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </section>
              )}

              {currentPage === 'tasks' && (
                <>

                  <section className="content">
                    <div className="content-header">
                      <h1 className="title">Inventory Management</h1>
                      
                      {/* Search Bar */}
                      <div style={{marginBottom:'16px'}}>
                        <input
                          type="text"
                          placeholder={inventoryTab === 'materials' ? '🔍︎ Search materials by ID, part number, or description...' : '🔍︎ Search equipment by name or description...'}
                          value={inventoryTab === 'materials' ? inventoryMaterialSearch : inventoryEquipmentSearch}
                          onChange={(e) => {
                            if (inventoryTab === 'materials') {
                              setInventoryMaterialSearch(e.target.value);
                            } else {
                              setInventoryEquipmentSearch(e.target.value);
                            }
                          }}
                          style={{
                            width: '100%',
                            padding: '12px 16px',
                            border: '2px solid #e5e7eb',
                            borderRadius: '12px',
                            fontSize: '16px',
                            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                            backgroundColor: '#fff',
                            transition: 'all 0.2s ease',
                            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                          }}
                          onFocus={(e) => {
                            e.target.style.borderColor = '#27A5C5';
                            e.target.style.boxShadow = '0 0 0 3px rgba(39, 165, 197, 0.1)';
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = '#e5e7eb';
                            e.target.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
                          }}
                        />
                      </div>
                      
                      {/* Results Counter - Right under search bar */}
                      <div style={{fontSize:'14px', color:'#6b7280', marginBottom:'16px', marginTop:'0px'}}>
                        {inventoryTab === 'materials' 
                          ? `${getFilteredMaterials().length} of ${materials.filter(m => !isTaskMaterial(m)).length} materials`
                          : `${getFilteredEquipment().length} of ${equipment.length} equipment`
                        }
                      </div>
                      
                      <div className="tab-navigation" style={{marginBottom:'16px'}}>
                        <button 
                          className={`tab-button ${inventoryTab === 'materials' ? 'active' : ''}`}
                          onClick={() => {
                            setInventoryTab('materials');
                            setInventoryEquipmentSearch('');
                          }}
                        >
                          <span>Materials</span>
                        </button>
                        <button 
                          className={`tab-button ${inventoryTab === 'equipment' ? 'active' : ''}`}
                          onClick={() => {
                            setInventoryTab('equipment');
                            setInventoryMaterialSearch('');
                          }}
                        >
                          <span>Equipment</span>
                        </button>
                      </div>
                    </div>

                    <div className="card">
                      <table className="materials-table">
                        <thead>
                          <tr>
                            <th>ID</th>
                            <th>{inventoryTab === 'materials' ? 'Sales Part No' : 'Name'}</th>
                            <th>Description</th>
                            <th>Site</th>
                            <th>Price</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(inventoryTab === 'materials' ? getFilteredMaterials() : getFilteredEquipment()).map((item, index) => (
                            <tr key={item.id} className="table-row">
                              <td>
                                <span className="material-id">{item.id}</span>
                              </td>
                              <td>
                                <span className="part-number">{inventoryTab === 'materials' ? item.salesPartNo : item.name}</span>
                              </td>
                              <td className="description-cell">
                                <div className="description-text">{inventoryTab === 'materials' ? item.description : item.category}</div>
                              </td>
                              <td>
                                <span className={`site-badge ${inventoryTab === 'equipment' ? 'site-badge--yellow' : ''}`}>
                                  {item.site}
                                </span>
                              </td>
                              <td className="price-cell">{formatPrice(item.price)}</td>
                              <td>
                                <div className="actions">
                                  <button 
                                    className="act-btn view" 
                                    onClick={() => handleViewMaterial(item)}
                                    title="View Details"
                                  >
                                    👁
                                  </button>
                                  <button 
                                    className="act-btn edit" 
                                    onClick={() => handleEditClick(item)}
                                    title="Edit"
                                  >
                                    ✏
                                  </button>
                                  <button 
                                    className="act-btn delete" 
                                    onClick={() => handleDeleteMaterial(item.id)}
                                    title="Delete"
                                  >
                                    🗑
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </section>
                </>
              )}

              {currentPage === 'admin-rate-card' && (
                <div className="project-rate-card">
              {/* Project Header */}
              <div className="project-header" style={{display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', textAlign:'center', padding:'20px 0'}}>
                    <h1 className="project-title" style={{fontSize:'3.6rem', lineHeight:1.1, fontWeight:800, margin:'0.3rem 0', color:'#000000'}}>SOR Pricebook</h1>
                    <p className="project-subtitle" style={{marginTop:'6px', color:'#6b7280', fontSize:'18px'}}>Calculate project costs with materials, equipment, and labor</p>
              </div>
              
              {/* 3-Column Grid Layout */}
              <div className="project-three-column-grid">
                {/* Column 1: Project Rate Card Receipt */}
                <div className="receipt-container">
                  <div className="receipt-header">
                    <h3>Rate Card Receipt</h3>
                    <p>Detailed breakdown of all project costs</p>
                  </div>

                  <div className="receipt-items">
                    {/* Materials Section */}
                        {selectedMaterials.filter(m => !isTaskMaterial(getMaterialById(m.id))).length > 0 && (
                      <div className="receipt-section">
                        <h3 className="receipt-section-title">Materials</h3>
                            {selectedMaterials.filter(m => !isTaskMaterial(getMaterialById(m.id))).map(m => {
                          const material = getMaterialById(m.id);
                          return (
                            <div key={m.id} className="receipt-item">
                              <div className="receipt-item-details">
                                <div className="receipt-item-name">{material?.description}</div>
                                <div className="receipt-item-id">ID: {m.id}</div>
                              </div>
                              <div className="receipt-item-qty">× {m.qty}</div>
                              <div className="receipt-item-price">{formatPrice(material?.price || 0)}</div>
                              <div className="receipt-item-total">{formatPrice((material?.price || 0) * m.qty)}</div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Equipment Section */}
                    {selectedEquipment.length > 0 && (
                      <div className="receipt-section">
                        <h3 className="receipt-section-title">Equipment</h3>
                        {selectedEquipment.map(e => {
                          const equipment = getEquipmentById(e.id);
                          return (
                            <div key={e.id} className="receipt-item">
                              <div className="receipt-item-details">
                                <div className="receipt-item-name">{equipment?.name}</div>
                                <div className="receipt-item-id">ID: {e.id}</div>
                              </div>
                              <div className="receipt-item-qty">× {e.qty}</div>
                              <div className="receipt-item-price">{formatPrice(equipment?.price || 0)}</div>
                              <div className="receipt-item-total">{formatPrice((equipment?.price || 0) * e.qty)}</div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Labor Section */}
                    {selectedLabor.length > 0 && (
                      <div className="receipt-section">
                        <h3 className="receipt-section-title">Labor</h3>
                        {selectedLabor.map(labor => {
                          const item = labor.itemType === 'material' 
                            ? getMaterialById(labor.itemId)
                            : getEquipmentById(labor.itemId);
                          return (
                            <div key={labor.id} className="receipt-labor-item">
                              <div className="receipt-labor-details">
                                <div className="receipt-labor-label">{labor.description}</div>
                                <div className="receipt-labor-item-name">
                                  For: {labor.itemType === 'material' ? item?.description : item?.name}
                                </div>
                                <div className="receipt-labor-calculation">
                                      {labor.persons} persons × {labor.hours} hours × {formatPrice(labor.rate || 1)}/hour
                                </div>
                              </div>
                              <div className="receipt-labor-total">{formatPrice(labor.cost)}</div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* External Costs */}
                    {(craneEnabled || riskEnabled) && (
                      <div className="receipt-section">
                        <h3 className="receipt-section-title">External Costs</h3>
                        <div className="receipt-external">
                          {craneEnabled && (
                            <div className="receipt-external-item">
                              <div className="receipt-external-label">Crane Fee</div>
                              <div className="receipt-external-value">{formatPrice(calcCraneFee())}</div>
                            </div>
                          )}
                          {riskEnabled && (
                            <div className="receipt-external-item">
                              <div className="receipt-external-label">Risk Rate ({riskPercent}%)</div>
                              <div className="receipt-external-value">{formatPrice(calcRiskAmount())}</div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Totals */}
                  <div className="receipt-totals">
                    <div className="receipt-total-row">
                      <div className="receipt-total-label">Materials Total</div>
                      <div className="receipt-total-value">{formatPrice(calcMaterialTotal())}</div>
                    </div>

                    <div className="receipt-total-row">
                      <div className="receipt-total-label">Equipment Total</div>
                      <div className="receipt-total-value">{formatPrice(calcEquipmentTotal())}</div>
                    </div>
                    <div className="receipt-total-row">
                      <div className="receipt-total-label">Labor Total</div>
                      <div className="receipt-total-value">{formatPrice(calcLaborTotal())}</div>
                    </div>
                    <div className="receipt-total-row">
                      <div className="receipt-total-label">External Total</div>
                      <div className="receipt-total-value">{formatPrice(calcExternalTotal())}</div>
                    </div>
                  </div>

                  <div className="receipt-final-total">
                    <div className="receipt-final-label">Final Project Total</div>
                    <div className="receipt-final-value">{formatPrice(calcFinalTotal())}</div>
                  </div>
                </div>

                {/* Column 2: Calculate Project Costs */}
                <div className="calculation-panel">
                  <div className="calculation-header">
                    <h3>Create Product Name</h3>
                  
                  {/* Project Name Field - Full Width at Top */}
                  <div style={{display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '12px'}}>
                    <label style={{fontSize: '12px', fontWeight: '500', color: '#000000', textAlign: 'left'}}>Product Name</label>
                      <input
                        type="text"
                      placeholder="Enter product name..."
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                      style={{
                        padding: '8px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px',
                        outline: 'none',
                        transition: 'border-color 0.2s',
                        backgroundColor: '#f9fafb'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                      onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                    />
                  </div>
                  
                  {/* Compact Form Fields */}
                  <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px'}}>
                    {/* SOR Code Field */}
                    <div style={{display: 'flex', flexDirection: 'column', gap: '4px'}}>
                      <label style={{fontSize: '12px', fontWeight: '500', color: '#000000', textAlign: 'left'}}>SOR Code</label>
                      <input
                        type="text"
                        placeholder="Enter SOR Code..."
                        value={sorCode}
                        onChange={(e) => setSorCode(e.target.value)}
                        style={{
                          padding: '8px 12px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '14px',
                          outline: 'none',
                          transition: 'border-color 0.2s',
                          backgroundColor: '#f9fafb'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                        onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                      />
                    </div>
                    
                    {/* Type Field */}
                    <div style={{display: 'flex', flexDirection: 'column', gap: '4px'}}>
                      <label style={{fontSize: '12px', fontWeight: '500', color: '#000000', textAlign: 'left'}}>Type</label>
                      <input
                        type="text"
                        placeholder="Enter Type..."
                        value={sorType}
                        onChange={(e) => setSorType(e.target.value)}
                        style={{
                          padding: '8px 12px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '14px',
                          outline: 'none',
                          transition: 'border-color 0.2s',
                          backgroundColor: '#f9fafb'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                        onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                      />
                    </div>
                  </div>
                  
                  {/* Description Field - Full Width */}
                  <div style={{display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '12px'}}>
                    <label style={{fontSize: '12px', fontWeight: '500', color: '#000000', textAlign: 'left'}}>Description</label>
                    <input
                      type="text"
                      placeholder="Enter Description..."
                      value={sorDescription}
                      onChange={(e) => setSorDescription(e.target.value)}
                      style={{
                        padding: '8px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px',
                        outline: 'none',
                        transition: 'border-color 0.2s',
                        backgroundColor: '#f9fafb'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                      onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                    />
                    </div>
                  </div>

                  {/* Task card (above Materials) */}
                  <div className="rate-card">
                    <div className="rate-card-header">
                      <h3 className="rate-card-title">Task</h3>
                          <small style={{color: '#6b7280', fontSize: '12px', marginTop: '4px'}}>
                            Using admin-configured labor rates
                          </small>
                    </div>
                    <div className="search-section">
                      <div className="search-input-group" style={{gap:'10px', flexWrap:'wrap'}}>
                        <input
                          type="text"
                          placeholder="Task description..."
                          value={newTaskDesc}
                          onChange={(e) => setNewTaskDesc(e.target.value)}
                          className="search-input"
                          style={{flex:'1 1 260px'}}
                        />
                        <select
                          value={labourType}
                          onChange={(e) => setLabourType(e.target.value)}
                          className="search-input"
                              style={{maxWidth:'180px'}}
                            >
                              {getAvailableLaborTypes().map(type => (
                                <option key={type} value={type}>
                                  {type.charAt(0).toUpperCase() + type.slice(1)}
                                </option>
                              ))}
                        </select>
                            <select
                              value={labourState}
                              onChange={(e) => setLabourState(e.target.value)}
                              className="search-input"
                              style={{maxWidth:'180px'}}
                            >
                              <option value="NSW">NSW</option>
                              <option value="VIC">VIC</option>
                              <option value="QLD">QLD</option>
                              <option value="NT">NT</option>
                            </select>
                        <button
                          className="search-btn"
                          onClick={() => {
                            setShowTaskLaborPanel(true);
                            setTaskLaborPersons(1);
                            setTaskLaborHours(8);
                          }}
                          title="Add Labor"
                        >
                          Add Labor
                        </button>
                        {showTaskLaborPanel && (
                          <div className="labor-inputs" style={{display:'flex', gap:'12px', alignItems:'center', flexWrap:'wrap'}}>
                            <label style={{display:'flex', alignItems:'center', gap:'6px'}}>
                              <span>Persons:</span>
                              <input 
                                type="number" 
                                min="1" 
                                value={taskLaborPersons}
                                onChange={(e) => setTaskLaborPersons(parseInt(e.target.value) || 1)}
                                className="labor-input-small"
                                placeholder="Persons"
                                style={{maxWidth:'120px'}}
                              />
                            </label>
                            <span>×</span>
                            <label style={{display:'flex', alignItems:'center', gap:'6px'}}>
                              <span>Hours:</span>
                              <input 
                                type="number" 
                                min="1" 
                                value={taskLaborHours}
                                onChange={(e) => setTaskLaborHours(parseInt(e.target.value) || 1)}
                                className="labor-input-small"
                                placeholder="Hours"
                                style={{maxWidth:'120px'}}
                              />
                            </label>
                            <span>×</span>
                                <span className="labor-cost">{formatPrice(getLaborRateFromAdmin(labourType, labourState))}/hr</span>
                            <span>=</span>
                                <span className="labor-cost">{formatPrice(((parseInt(taskLaborPersons)||0) * (parseInt(taskLaborPersons)||0)) * getLaborRateFromAdmin(labourType, labourState))}</span>
                            <button
                              className="search-btn"
                              onClick={() => {
                                const personsVal = parseInt(taskLaborPersons) || 1;
                                const hoursVal = parseInt(taskLaborHours) || 1;
                                    const rateVal = getLaborRateFromAdmin(labourType, labourState);
                                let taskEntries = selectedMaterials.filter(m => isTaskMaterial(getMaterialById(m.id)));
                                let targetTaskId = null;
                                let targetDesc = '';
                                if (taskEntries.length === 0) {
                                  const desc = newTaskDesc.trim();
                                  if (!desc) {
                                    alert('Please enter a task description first.');
                                    return;
                                  }
                                  const price = personsVal * hoursVal * rateVal;
                                  const newId = `T${Date.now()}`;
                                  const newMat = {
                                    id: newId,
                                    salesPartNo: 'CUSTOM',
                                    description: `${desc} (${labourType})`,
                                    site: 'CUSTOM',
                                    price,
                                    image: null
                                  };
                                  setMaterials(prev => [...prev, newMat]);
                                  addMaterialToProject(newMat.id, 1);
                                  targetTaskId = newMat.id;
                                  targetDesc = newMat.description;
                                } else {
                                  const lastTask = taskEntries[taskEntries.length - 1];
                                  const mat = getMaterialById(lastTask.id);
                                  targetTaskId = lastTask.id;
                                  targetDesc = mat?.description || '';
                                }
                                addLaborToItem(
                                  targetTaskId,
                                  'material',
                                  personsVal,
                                  hoursVal,
                                      `${targetDesc} task`,
                                      rateVal
                                );
                                setShowTaskLaborPanel(false);
                                setTaskLaborNotice(`Labor added to ${targetDesc}`);
                                setTimeout(() => setTaskLaborNotice(''), 2000);
                              }}
                              title="Create Labor"
                            >
                              Create
                            </button>
                          </div>
                        )}
                        {taskLaborNotice && (
                          <div className="notice" style={{marginTop:'6px', color:'#10b981'}}>{taskLaborNotice}</div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Materials Section */}
                  <div className="rate-card">
                    <div className="rate-card-header">
                      <h3 className="rate-card-title">Materials</h3>
                    </div>
                  
                  <div className="search-section">
                    <div className="search-input-group">
                      <input 
                        type="text"
                        placeholder="Search material by ID or description..."
                        value={projectMaterialFilter}
                        onChange={(e) => { setProjectMaterialFilter(e.target.value); setShowMaterialSuggestions(true); }}
                        className="search-input"
                        ref={materialSearchRef}
                      />
                      <button 
                        className="search-btn"
                        onClick={() => {
                          const q = projectMaterialFilter.trim().toLowerCase();
                          const found = materials.find(m => m.id.toLowerCase() === q || m.description.toLowerCase().includes(q) || m.salesPartNo.toLowerCase().includes(q));
                          if (found) {
                            addMaterialToProject(found.id, 1);
                            setProjectMaterialFilter('');
                            setShowMaterialSuggestions(false);
                            if (materialSearchRef.current) { materialSearchRef.current.blur(); }
                          }
                        }}
                      >
                        Add
                      </button>
                    </div>
                    
                    {/* Suggestions */}
                    {showMaterialSuggestions && projectMaterialFilter && (
                      <div className="suggestions-table">
                        <table>
                          <thead>
                            <tr>
                              <th>ID</th>
                              <th>Description</th>
                              <th>Price</th>
                              <th>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {materials.filter(m => {
                              const q = projectMaterialFilter.toLowerCase();
                              return m.id.toLowerCase().includes(q) || m.description.toLowerCase().includes(q) || m.salesPartNo.toLowerCase().includes(q);
                            }).slice(0, 5).map(m => (
                              <tr key={m.id}>
                                <td>{m.id}</td>
                                <td>{m.description}</td>
                                <td>{formatPrice(m.price)}</td>
                                <td>
                                  <button 
                                    className="add-btn" 
                                    onClick={() => { 
                                      addMaterialToProject(m.id, 1); 
                                      setProjectMaterialFilter(''); 
                                      setShowMaterialSuggestions(false); 
                                      if (materialSearchRef.current) { materialSearchRef.current.blur(); } 
                                    }}
                                  >
                                    Add
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                    {/* Persist selected Materials (non-task) with Remove */}
                    {selectedMaterials.filter(m => !isTaskMaterial(getMaterialById(m.id))).length > 0 && (
                      <div className="selected-items" style={{marginTop:'10px'}}>
                        <h4>Selected Materials</h4>
                        <div>
                          {selectedMaterials.filter(m => !isTaskMaterial(getMaterialById(m.id))).map(m => {
                        const material = getMaterialById(m.id);
                        return (
                              <div key={m.id} className="selected-item" style={{display:'flex', alignItems:'center', gap:'10px', padding:'6px 0'}}>
                              <span className="selected-item-id">{m.id}</span>
                                <span className="selected-item-name" style={{flex:'1 1 auto'}}>{material?.description}</span>
                                    <button 
                                      className="add-labor-btn" 
                                      onClick={() => {
                                        const persons = prompt('Enter number of persons:', '1');
                                        const hours = prompt('Enter number of hours:', '8');
                                        const availableTypes = getAvailableLaborTypes().join('/');
                                        const laborType = prompt(`Enter labor type (${availableTypes}):`, getAvailableLaborTypes()[0] || 'installation');
                                        const state = prompt('Enter state (NSW/VIC/QLD/NT):', 'NSW');
                                        if (persons && hours && laborType) {
                                          const rate = getLaborRateFromAdmin(laborType, state);
                                          addLaborToItem(
                                            m.id,
                                            'material',
                                            parseInt(persons) || 1,
                                            parseInt(hours) || 8,
                                            `${material?.description} ${laborType} (${state})`,
                                            rate
                                          );
                                        }
                                      }}
                                      title="Add Labor"
                                      style={{marginRight:'8px', padding:'2px 6px', fontSize:'12px', backgroundColor:'#4a5568', color:'white', border:'none', borderRadius:'4px', cursor:'pointer'}}
                                    >
                                      + Labor
                                    </button>
                                <button className="remove-btn" onClick={() => removeMaterialFromProject(m.id)}>Remove</button>
                          </div>
                        );
                      })}
                        </div>
                    </div>
                  )}
                  </div>
                  
                  {/* Selected Materials removed as requested */}
                </div>

                {/* Equipment Section */}
                <div className="rate-card">
                  <div className="rate-card-header">
                    <h3 className="rate-card-title">Equipment</h3>
                  </div>
                  
                  <div className="search-section">
                    <div className="search-input-group">
                      <input 
                        type="text"
                        placeholder="Search equipment by ID or name..."
                        value={projectEquipmentFilter}
                        onChange={(e) => { setProjectEquipmentFilter(e.target.value); setShowEquipmentSuggestions(true); }}
                        className="search-input"
                        ref={equipmentSearchRef}
                      />
                      <button 
                        className="search-btn"
                        onClick={() => {
                          const q = projectEquipmentFilter.trim().toLowerCase();
                          const found = equipment.find(e => e.id.toLowerCase() === q || e.name.toLowerCase().includes(q));
                          if (found) {
                            addEquipmentToProject(found.id, 1);
                            setProjectEquipmentFilter('');
                            setShowEquipmentSuggestions(false);
                            if (equipmentSearchRef.current) { equipmentSearchRef.current.blur(); }
                          }
                        }}
                      >
                        Add
                      </button>
                    </div>
                    
                    {/* Suggestions */}
                    {showEquipmentSuggestions && projectEquipmentFilter && (
                      <div className="suggestions-table">
                        <table>
                          <thead>
                            <tr>
                              <th>ID</th>
                              <th>Name</th>
                              <th>Price</th>
                              <th>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {equipment.filter(e => {
                              const q = projectEquipmentFilter.toLowerCase();
                              return e.id.toLowerCase().includes(q) || e.name.toLowerCase().includes(q);
                            }).slice(0, 5).map(e => (
                              <tr key={e.id}>
                                <td>{e.id}</td>
                                <td>{e.name}</td>
                                <td>{formatPrice(e.price)}</td>
                                <td>
                                  <button 
                                    className="add-btn" 
                                    onClick={() => { 
                                      addEquipmentToProject(e.id, 1); 
                                      setProjectEquipmentFilter(''); 
                                      setShowEquipmentSuggestions(false); 
                                      if (equipmentSearchRef.current) { equipmentSearchRef.current.blur(); } 
                                    }}
                                  >
                                    Add
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                    {/* Persist selected Equipment with Remove */}
                  {selectedEquipment.length > 0 && (
                      <div className="selected-items" style={{marginTop:'10px'}}>
                        <h4>Selected Equipment</h4>
                        <div>
                          {selectedEquipment.map(se => {
                            const eq = getEquipmentById(se.id);
                        return (
                              <div key={se.id} className="selected-item" style={{display:'flex', alignItems:'center', gap:'10px', padding:'6px 0'}}>
                                <span className="selected-item-id">{se.id}</span>
                                <span className="selected-item-name" style={{flex:'1 1 auto'}}>{eq?.name}</span>
                                    <button 
                                      className="add-labor-btn" 
                                      onClick={() => {
                                        const persons = prompt('Enter number of persons:', '1');
                                        const hours = prompt('Enter number of hours:', '8');
                                        const availableTypes = getAvailableLaborTypes().join('/');
                                        const laborType = prompt(`Enter labor type (${availableTypes}):`, getAvailableLaborTypes()[0] || 'installation');
                                        const state = prompt('Enter state (NSW/VIC/QLD/NT):', 'NSW');
                                        if (persons && hours && laborType) {
                                          const rate = getLaborRateFromAdmin(laborType, state);
                                          addLaborToItem(
                                            se.id,
                                            'equipment',
                                            parseInt(persons) || 1,
                                            parseInt(hours) || 8,
                                            `${eq?.name} ${laborType} (${state})`,
                                            rate
                                          );
                                        }
                                      }}
                                      title="Add Labor"
                                      style={{marginRight:'8px', padding:'2px 6px', fontSize:'12px', backgroundColor:'#4a5568', color:'white', border:'none', borderRadius:'4px', cursor:'pointer'}}
                                    >
                                      + Labor
                                    </button>
                                <button className="remove-btn" onClick={() => removeEquipmentFromProject(se.id)}>Remove</button>
                          </div>
                        );
                      })}
                        </div>
                    </div>
                  )}
                  </div>
                  
                  {/* Selected Equipment removed as requested */}
                </div>

                {/* Labor Summary Section */}
                <div className="rate-card">
                  <div className="rate-card-header">
                    <h3 className="rate-card-title">Labor Summary</h3>
                  </div>
                  
                  <div className="labor-summary">
                    <div className="labor-summary-stats">
                      <div className="labor-stat">
                        <span className="labor-stat-label">Total Labor Items:</span>
                        <span className="labor-stat-value">{selectedLabor.length}</span>
                      </div>
                      <div className="labor-stat">
                        <span className="labor-stat-label">Total Labor Cost:</span>
                        <span className="labor-stat-value">{formatPrice(calcLaborTotal())}</span>
                      </div>
                    </div>
                    
                    {selectedLabor.length === 0 && (
                      <div className="labor-empty-state">
                        <p>No labor items added yet. Add labor to materials or equipment above.</p>
                      </div>
                    )}
                    
                    {selectedLabor.length > 0 && (
                      <div className="labor-summary-list">
                        <h4>All Labor Items</h4>
                        {selectedLabor.map(labor => {
                          const item = labor.itemType === 'material' 
                            ? getMaterialById(labor.itemId)
                            : getEquipmentById(labor.itemId);
                          return (
                            <div key={labor.id} className="labor-summary-item">
                              <div className="labor-summary-details">
                                <span className="labor-item-name">
                                  {labor.itemType === 'material' ? item?.description : item?.name}
                                </span>
                                <span className="labor-description">{labor.description}</span>
                                <span className="labor-calculation">
                                      {labor.persons} persons × {labor.hours} hours × {formatPrice(labor.rate || 1)}/hr = {formatPrice(labor.cost)}
                                </span>
                              </div>
                              <button 
                                className="remove-labor-btn" 
                                onClick={() => removeLaborFromItem(labor.id)}
                                title="Remove Labor"
                              >
                                X
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* External Options - Under Labor Summary */}
                <div className="external-options">
                  <div className="external-card">
                    <div className="external-card-header">
                      <h3 className="external-card-title">External - Crane Fee (Optional)</h3>
                    </div>
                    <div className="external-controls" style={{display:'flex', flexDirection:'column', alignItems:'flex-start', gap:'8px', width:'100%'}}>
                      <label className="external-checkbox">
                        <input 
                          type="checkbox" 
                          checked={craneEnabled} 
                          onChange={(e) => setCraneEnabled(e.target.checked)} 
                        />
                        Enable Crane Fee
                      </label>
                      {craneEnabled && (
                        <div className="external-input" style={{display:'flex', alignItems:'center', gap:'6px'}}>
                          <span>$</span>
                          <input 
                            type="number" 
                            min="0" 
                            value={craneAmount} 
                            onChange={(e) => setCraneAmount(parseFloat(e.target.value) || 0)} 
                            placeholder="0.00"
                            style={{width:'120px'}}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="external-card">
                    <div className="external-card-header">
                      <h3 className="external-card-title">Risk Rate (Optional)</h3>
                    </div>
                    <div className="external-controls" style={{display:'flex', flexDirection:'column', alignItems:'flex-start', gap:'8px', width:'100%'}}>
                      <label className="external-checkbox">
                        <input 
                          type="checkbox" 
                          checked={riskEnabled} 
                          onChange={(e) => setRiskEnabled(e.target.checked)} 
                        />
                        Enable Risk Rate
                      </label>
                      {riskEnabled && (
                        <div className="external-input" style={{display:'flex', alignItems:'center', gap:'6px'}}>
                          <input 
                            type="number" 
                            min="0" 
                            max="100" 
                            value={riskPercent} 
                            onChange={(e) => setRiskPercent(parseFloat(e.target.value) || 0)} 
                            placeholder="10"
                            style={{width:'80px'}}
                          />
                          <span>%</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

                {/* Column 3: Project Cost Summary */}
                <div className="summary-panel">
                  <div className="summary-header">
                    <h3>Product Cost Summary</h3>
                    
                  </div>
                  
                  <div className="summary-grid">
                    <div className="summary-item">
                      <div className="summary-label">Materials Total</div>
                      <div className="summary-value">{formatPrice(calcMaterialTotal())}</div>
                    </div>

                    <div className="summary-item">
                      <div className="summary-label">Equipment Total</div>
                      <div className="summary-value">{formatPrice(calcEquipmentTotal())}</div>
                    </div>
                    <div className="summary-item">
                      <div className="summary-label">Labor Cost</div>
                      <div className="summary-value">{formatPrice(calcLaborTotal())}</div>
                    </div>
                    <div className="summary-item">
                      <div className="summary-label">External Costs</div>
                      <div className="summary-value">{formatPrice(calcExternalTotal())}</div>
                    </div>
                  </div>
                  
                  <div className="summary-total">
                    <div className="summary-total-label">Final Project Total</div>
                    <div className="summary-total-value">{formatPrice(calcFinalTotal())}</div>
                  </div>
                  
                  {/* Submit Project Button */}
                  <div className="submit-project-section">
                    <button 
                      className="submit-project-btn"
                      onClick={handleSubmitProject}
                      disabled={calcFinalTotal() === 0}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                        <polyline points="22,4 12,14.01 9,11.01"></polyline>
                      </svg>
                      Submit Project
                    </button>
                    <p className="submit-project-note">
                      {calcFinalTotal() === 0 
                        ? "Add materials, equipment, or labor to submit project" 
                        : "Click to add this project to your project list"
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

              {currentPage === 'notifications' && (
              <section className="content">
                <div style={{display: 'flex', justifyContent:'space-between', alignItems:'center', padding:'24px 0', marginBottom:'16px'}}>
                  <h1 style={{fontSize:'2.5rem', fontWeight:'700', color:'#000000', margin:'0'}}>Activity Feed</h1>
                </div>
                
                <div style={{display: 'flex', gap: '24px', height: 'calc(100vh - 200px)'}}>
                  {/* Left Panel - Activity Feed */}
                  <div style={{flex: '1', display: 'flex', flexDirection: 'column'}}>
                    {/* Filter Categories */}
                    <div style={{marginBottom: '24px'}}>
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px'
                      }}>
                        <button style={{
                          background: '#BBDBE6',
                          color: '#000000',
                          border: 'none',
                          padding: '12px 16px',
                          borderRadius: '8px',
                          fontSize: '14px',
                          fontWeight: '600',
                          textAlign: 'left',
                          cursor: 'pointer'
                        }}>ALL ALERTS</button>
                        <button style={{
                          background: 'transparent',
                          color: '#000000',
                          border: 'none',
                          padding: '12px 16px',
                          borderRadius: '8px',
                          fontSize: '14px',
                          fontWeight: '600',
                          textAlign: 'left',
                          cursor: 'pointer'
                        }}>URGENT</button>
                      </div>
                    </div>

                    {/* Activity List */}
                    <div style={{flex: '1', overflowY: 'auto'}}>
                      {getAllAdminNotifications().slice(0, 10).map(notification => (
                        <div key={notification.id} style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '16px',
                          padding: '16px',
                          marginBottom: '12px',
                          background: '#f8fafc',
                          borderRadius: '12px',
                          border: '1px solid #e2e8f0'
                        }}>
                          <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            background: '#BBDBE6',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: '16px',
                            fontWeight: '600'
                          }}>
                            {notification.type === 'task' ? 'T' : 
                             notification.type === 'project' ? 'P' : 
                             notification.type === 'budget_overrun' ? 'B' :
                             notification.type === 'deadline' ? 'D' : 'A'}
                          </div>
                          <div style={{flex: '1'}}>
                            <div style={{fontWeight: '600', color: '#000000', marginBottom: '4px'}}>
                              {notification.type === 'task' ? 'Project Manager' : 
                               notification.type === 'project' ? 'Team Lead' : 
                               notification.type === 'budget_overrun' ? 'Finance Team' :
                               notification.type === 'deadline' ? 'Project Coordinator' : 'System'}
                            </div>
                            <div style={{color: '#000000', fontSize: '14px', marginBottom: '8px'}}>
                              {notification.message}
                            </div>
                            <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
                              <button style={{
                                background: '#BBDBE6',
                                color: 'white',
                                border: 'none',
                                padding: '6px 12px',
                                borderRadius: '6px',
                                fontSize: '12px',
                                cursor: 'pointer'
                              }}>Follow up here</button>
                              <span style={{color: '#000000', fontSize: '12px'}}>{notification.time}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right Panel - Statistics Grid */}
                  <div style={{width: '400px', display: 'flex', flexDirection: 'column', gap: '24px'}}>
                    {/* Statistics Section */}
                    <div style={{
                      background: 'linear-gradient(135deg, #BBDBE6 0%, #E6F8FE 100%)',
                      borderRadius: '16px',
                      padding: '24px',
                      color: 'black'
                    }}>
                      <h3 style={{fontSize: '18px', fontWeight: '700', margin: '0 0 20px 0', textTransform: 'uppercase', letterSpacing: '0.05em'}}>
                        Statistics
                      </h3>
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '20px'
                      }}>
                        <div style={{textAlign: 'center'}}>
                          <div style={{fontSize: '32px', fontWeight: '700', marginBottom: '4px'}}>$2.4M</div>
                          <div style={{fontSize: '12px', opacity: '0.9', textTransform: 'uppercase', letterSpacing: '0.05em'}}>Total Budget</div>
                        </div>
                        <div style={{textAlign: 'center'}}>
                          <div style={{fontSize: '32px', fontWeight: '700', marginBottom: '4px'}}>12%</div>
                          <div style={{fontSize: '12px', opacity: '0.9', textTransform: 'uppercase', letterSpacing: '0.05em'}}>Avg Project Delay</div>
                        </div>
                        <div style={{textAlign: 'center'}}>
                          <div style={{fontSize: '32px', fontWeight: '700', marginBottom: '4px'}}>8%</div>
                          <div style={{fontSize: '12px', opacity: '0.9', textTransform: 'uppercase', letterSpacing: '0.05em'}}>Over Quote Budget</div>
                        </div>
                        <div style={{textAlign: 'center'}}>
                          <div style={{fontSize: '32px', fontWeight: '700', marginBottom: '4px'}}>87%</div>
                          <div style={{fontSize: '12px', opacity: '0.9', textTransform: 'uppercase', letterSpacing: '0.05em'}}>Overall Performance</div>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              </section>
              )}
            </>
          )}

          {/* Material Modal */}
          {showModal && (
            <MaterialModal
              isOpen={showModal}
              onClose={handleModalClose}
              onSubmit={handleModalSubmit}
              material={modalMode === 'view' ? viewingMaterial : editingMaterial}
              mode={modalMode}
              type={activeTab}
            />
          )}

                    {/* Edit Project Modal */}
            {showEditProjectModal && (
              <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                background: 'rgba(0,0,0,0.5)',
                zIndex: 1000,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <div style={{
                  background: '#fff',
                  borderRadius: '12px',
                  padding: '24px',
                  minWidth: '500px',
                  maxWidth: '600px',
                  maxHeight: '90vh',
                  overflowY: 'auto',
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '20px'
                  }}>
                    <h2 style={{margin: 0, fontSize: '1.5rem', fontWeight: '600', color: '#1f2937'}}>
                      Edit Project
                    </h2>
                    <button
                      onClick={handleCancelEdit}
                      style={{
                        background: 'none',
                        border: 'none',
                        fontSize: '24px',
                        cursor: 'pointer',
                        color: '#6b7280',
                        padding: '4px'
                      }}
                    >
                      ×
                  </button>
                </div>

                  <div style={{display: 'grid', gap: '16px'}}>
                    {/* Project Name */}
                    <div>
                      <label style={{display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#374151'}}>
                        Project Name
                      </label>
                      <input
                        type="text"
                        value={editProjectForm.name || ''}
                        onChange={(e) => setEditProjectForm(prev => ({ ...prev, name: e.target.value }))}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '14px'
                        }}
                      />
                  </div>

                    {/* Description */}
                    <div>
                      <label style={{display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#374151'}}>
                        Description
                      </label>
                      <textarea
                        value={editProjectForm.description || ''}
                        onChange={(e) => setEditProjectForm(prev => ({ ...prev, description: e.target.value }))}
                        rows={3}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '14px',
                          resize: 'vertical'
                        }}
                      />
                </div>

                    {/* Manager */}
                    <div>
                      <label style={{display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#374151'}}>
                        Manager
                      </label>
                      <input
                        type="text"
                        value={editProjectForm.manager || ''}
                        onChange={(e) => setEditProjectForm(prev => ({ ...prev, manager: e.target.value }))}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '14px'
                        }}
                      />
                </div>

                    {/* Budget and Actual Cost */}
                    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
                      <div>
                        <label style={{display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#374151'}}>
                          Budget
                        </label>
                        <input
                          type="number"
                          value={editProjectForm.budget || ''}
                          onChange={(e) => setEditProjectForm(prev => ({ ...prev, budget: parseFloat(e.target.value) || 0 }))}
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            fontSize: '14px'
                          }}
                        />
                      </div>
                      <div>
                        <label style={{display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#374151'}}>
                          Actual Cost
                        </label>
                        <input
                          type="number"
                          value={editProjectForm.actualCost || ''}
                          onChange={(e) => setEditProjectForm(prev => ({ ...prev, actualCost: parseFloat(e.target.value) || 0 }))}
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            fontSize: '14px'
                          }}
                        />
                    </div>
                  </div>
                  
                    {/* Dates */}
                    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
                      <div>
                        <label style={{display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#374151'}}>
                          Start Date
                        </label>
                        <input
                          type="date"
                          value={editProjectForm.startDate || ''}
                          onChange={(e) => setEditProjectForm(prev => ({ ...prev, startDate: e.target.value }))}
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            fontSize: '14px'
                          }}
                        />
                      </div>
                      <div>
                        <label style={{display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#374151'}}>
                          End Date
                        </label>
                        <input
                          type="date"
                          value={editProjectForm.endDate || ''}
                          onChange={(e) => setEditProjectForm(prev => ({ ...prev, endDate: e.target.value }))}
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            fontSize: '14px'
                          }}
                        />
                  </div>
                </div>

                    {/* Status and Priority */}
                    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
                      <div>
                        <label style={{display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#374151'}}>
                          Status
                        </label>
                                <select
                          value={editProjectForm.status || ''}
                          onChange={(e) => setEditProjectForm(prev => ({ ...prev, status: e.target.value }))}
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            fontSize: '14px'
                          }}
                        >
                          <option value="Planning">Planning</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Completed">Completed</option>
                          <option value="On Hold">On Hold</option>
                          <option value="Cancelled">Cancelled</option>
                                </select>
                      </div>
                      <div>
                        <label style={{display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#374151'}}>
                          Priority
                        </label>
                                <select
                          value={editProjectForm.priority || ''}
                          onChange={(e) => setEditProjectForm(prev => ({ ...prev, priority: e.target.value }))}
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            fontSize: '14px'
                          }}
                        >
                          <option value="Low">Low</option>
                          <option value="Medium">Medium</option>
                          <option value="High">High</option>
                                </select>
                                </div>
                    </div>

                    {/* Progress */}
                    <div>
                      <label style={{display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#374151'}}>
                        Progress (%)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={editProjectForm.progress || ''}
                        onChange={(e) => setEditProjectForm(prev => ({ ...prev, progress: parseInt(e.target.value) || 0 }))}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '14px'
                        }}
                      />
                      </div>
                    </div>

                  {/* Action Buttons */}
                  <div style={{
                    display: 'flex',
                    gap: '12px',
                    justifyContent: 'flex-end',
                    marginTop: '24px',
                    paddingTop: '20px',
                    borderTop: '1px solid #e5e7eb'
                  }}>
                                  <button 
                      onClick={handleCancelEdit}
                      style={{
                        padding: '8px 16px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        background: '#fff',
                        color: '#374151',
                        fontSize: '14px',
                        cursor: 'pointer'
                      }}
                    >
                      Cancel
                                  </button>
                                  <button 
                      onClick={handleSaveProject}
                      style={{
                        padding: '8px 16px',
                        border: 'none',
                        borderRadius: '6px',
                        background: '#27A5C5',
                        color: '#fff',
                        fontSize: '14px',
                        cursor: 'pointer'
                      }}
                    >
                      Save Changes
                                  </button>
                                </div>
                    </div>
                        </div>
          )}

          {/* Scroll to Top Button */}
          {showScrollToTop && (
            <button 
              className="scroll-to-top visible" 
              onClick={scrollToTop}
              title="Scroll to top"
            >
              ↑
            </button>
          )}
        </main>
      </div>
    );
  }

  // Main App Component with Router
  function App() {
    return (
      <Router>
        <AppContent />
      </Router>
    );
  }

  export default App;