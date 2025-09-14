import { useState, useEffect, useCallback } from 'react';
import apiService from '../services/api';

// Custom hook for API calls with loading states and error handling
export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (apiCall) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await apiCall();
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { execute, loading, error };
};

// Hook for projects
export const useProjects = () => {
  const { execute, loading, error } = useApi();
  const [projects, setProjects] = useState([]);

  const fetchProjects = useCallback(async (filters = {}) => {
    const result = await execute(() => apiService.getProjects(filters));
    setProjects(result);
    return result;
  }, [execute]);

  const createProject = useCallback(async (projectData) => {
    const result = await execute(() => apiService.createProject(projectData));
    setProjects(prev => [...prev, result]);
    return result;
  }, [execute]);

  const updateProject = useCallback(async (projectId, projectData) => {
    const result = await execute(() => apiService.updateProject(projectId, projectData));
    setProjects(prev => prev.map(p => p.id === projectId ? result : p));
    return result;
  }, [execute]);

  const deleteProject = useCallback(async (projectId) => {
    await execute(() => apiService.deleteProject(projectId));
    setProjects(prev => prev.filter(p => p.id !== projectId));
  }, [execute]);

  return {
    projects,
    fetchProjects,
    createProject,
    updateProject,
    deleteProject,
    loading,
    error
  };
};

// Hook for materials
export const useMaterials = () => {
  const { execute, loading, error } = useApi();
  const [materials, setMaterials] = useState([]);

  const fetchMaterials = useCallback(async (filters = {}) => {
    const result = await execute(() => apiService.getMaterials(filters));
    setMaterials(result);
    return result;
  }, [execute]);

  const createMaterial = useCallback(async (materialData) => {
    const result = await execute(() => apiService.createMaterial(materialData));
    setMaterials(prev => [...prev, result]);
    return result;
  }, [execute]);

  const updateMaterial = useCallback(async (materialId, materialData) => {
    const result = await execute(() => apiService.updateMaterial(materialId, materialData));
    setMaterials(prev => prev.map(m => m.id === materialId ? result : m));
    return result;
  }, [execute]);

  const deleteMaterial = useCallback(async (materialId) => {
    await execute(() => apiService.deleteMaterial(materialId));
    setMaterials(prev => prev.filter(m => m.id !== materialId));
  }, [execute]);

  return {
    materials,
    fetchMaterials,
    createMaterial,
    updateMaterial,
    deleteMaterial,
    loading,
    error
  };
};

// Hook for equipment
export const useEquipment = () => {
  const { execute, loading, error } = useApi();
  const [equipment, setEquipment] = useState([]);

  const fetchEquipment = useCallback(async (filters = {}) => {
    const result = await execute(() => apiService.getEquipment(filters));
    setEquipment(result);
    return result;
  }, [execute]);

  const createEquipment = useCallback(async (equipmentData) => {
    const result = await execute(() => apiService.createEquipment(equipmentData));
    setEquipment(prev => [...prev, result]);
    return result;
  }, [execute]);

  const updateEquipment = useCallback(async (equipmentId, equipmentData) => {
    const result = await execute(() => apiService.updateEquipment(equipmentId, equipmentData));
    setEquipment(prev => prev.map(e => e.id === equipmentId ? result : e));
    return result;
  }, [execute]);

  const deleteEquipment = useCallback(async (equipmentId) => {
    await execute(() => apiService.deleteEquipment(equipmentId));
    setEquipment(prev => prev.filter(e => e.id !== equipmentId));
  }, [execute]);

  return {
    equipment,
    fetchEquipment,
    createEquipment,
    updateEquipment,
    deleteEquipment,
    loading,
    error
  };
};

// Hook for labour roles
export const useLabourRoles = () => {
  const { execute, loading, error } = useApi();
  const [labourRoles, setLabourRoles] = useState([]);

  const fetchLabourRoles = useCallback(async (filters = {}) => {
    const result = await execute(() => apiService.getLabourRoles(filters));
    setLabourRoles(result);
    return result;
  }, [execute]);

  const createLabourRole = useCallback(async (labourRoleData) => {
    const result = await execute(() => apiService.createLabourRole(labourRoleData));
    setLabourRoles(prev => [...prev, result]);
    return result;
  }, [execute]);

  const updateLabourRole = useCallback(async (roleId, labourRoleData) => {
    const result = await execute(() => apiService.updateLabourRole(roleId, labourRoleData));
    setLabourRoles(prev => prev.map(lr => lr.id === roleId ? result : lr));
    return result;
  }, [execute]);

  const deleteLabourRole = useCallback(async (roleId) => {
    await execute(() => apiService.deleteLabourRole(roleId));
    setLabourRoles(prev => prev.filter(lr => lr.id !== roleId));
  }, [execute]);

  return {
    labourRoles,
    fetchLabourRoles,
    createLabourRole,
    updateLabourRole,
    deleteLabourRole,
    loading,
    error
  };
};

// Hook for quotes
export const useQuotes = () => {
  const { execute, loading, error } = useApi();
  const [quotes, setQuotes] = useState([]);

  const fetchQuotes = useCallback(async (filters = {}) => {
    const result = await execute(() => apiService.getQuotes(filters));
    setQuotes(result);
    return result;
  }, [execute]);

  const createQuote = useCallback(async (quoteData) => {
    const result = await execute(() => apiService.createQuote(quoteData));
    setQuotes(prev => [...prev, result]);
    return result;
  }, [execute]);

  const updateQuote = useCallback(async (quoteId, quoteData) => {
    const result = await execute(() => apiService.updateQuote(quoteId, quoteData));
    setQuotes(prev => prev.map(q => q.id === quoteId ? result : q));
    return result;
  }, [execute]);

  const deleteQuote = useCallback(async (quoteId) => {
    await execute(() => apiService.deleteQuote(quoteId));
    setQuotes(prev => prev.filter(q => q.id !== quoteId));
  }, [execute]);

  return {
    quotes,
    fetchQuotes,
    createQuote,
    updateQuote,
    deleteQuote,
    loading,
    error
  };
};

// Hook for calculator
export const useCalculator = () => {
  const { execute, loading, error } = useApi();

  const calculateRateCard = useCallback(async (calculatorData) => {
    return await execute(() => apiService.calculateRateCard(calculatorData));
  }, [execute]);

  return {
    calculateRateCard,
    loading,
    error
  };
};

// Hook for admin dashboard
export const useAdminDashboard = () => {
  const { execute, loading, error } = useApi();
  const [stats, setStats] = useState(null);
  const [projects, setProjects] = useState([]);
  const [activityFeed, setActivityFeed] = useState([]);

  const fetchStats = useCallback(async () => {
    const result = await execute(() => apiService.getAdminDashboardStats());
    setStats(result);
    return result;
  }, [execute]);

  const fetchProjects = useCallback(async (searchRequest = {}) => {
    const result = await execute(() => apiService.getAdminProjects(searchRequest));
    setProjects(result);
    return result;
  }, [execute]);

  const fetchActivityFeed = useCallback(async (userId, limit = 50) => {
    const result = await execute(() => apiService.getAdminActivityFeed(userId, limit));
    setActivityFeed(result.activities || []);
    return result;
  }, [execute]);

  return {
    stats,
    projects,
    activityFeed,
    fetchStats,
    fetchProjects,
    fetchActivityFeed,
    loading,
    error
  };
};

// Hook for bulk operations
export const useBulkOperations = () => {
  const { execute, loading, error } = useApi();

  const bulkImport = useCallback(async (importData) => {
    return await execute(() => apiService.bulkImport(importData));
  }, [execute]);

  const bulkExport = useCallback(async (exportData) => {
    return await execute(() => apiService.bulkExport(exportData));
  }, [execute]);

  return {
    bulkImport,
    bulkExport,
    loading,
    error
  };
};

// Hook for search
export const useSearch = () => {
  const { execute, loading, error } = useApi();

  const searchProjects = useCallback(async (filters = {}) => {
    return await execute(() => apiService.searchProjects(filters));
  }, [execute]);

  const searchMaterials = useCallback(async (filters = {}) => {
    return await execute(() => apiService.searchMaterials(filters));
  }, [execute]);

  const searchEquipment = useCallback(async (filters = {}) => {
    return await execute(() => apiService.searchEquipment(filters));
  }, [execute]);

  return {
    searchProjects,
    searchMaterials,
    searchEquipment,
    loading,
    error
  };
};

// Hook for notifications
export const useNotifications = () => {
  const { execute, loading, error } = useApi();
  const [notifications, setNotifications] = useState([]);

  const fetchNotifications = useCallback(async (userId, limit = 50) => {
    const result = await execute(() => apiService.getNotifications(userId, limit));
    setNotifications(result);
    return result;
  }, [execute]);

  const fetchUnreadNotifications = useCallback(async (userId) => {
    const result = await execute(() => apiService.getUnreadNotifications(userId));
    setNotifications(result);
    return result;
  }, [execute]);

  const createNotification = useCallback(async (notificationData) => {
    const result = await execute(() => apiService.createNotification(notificationData));
    setNotifications(prev => [result, ...prev]);
    return result;
  }, [execute]);

  const markNotificationRead = useCallback(async (notificationId) => {
    await execute(() => apiService.markNotificationRead(notificationId));
    setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n));
  }, [execute]);

  const markAllNotificationsRead = useCallback(async (userId) => {
    await execute(() => apiService.markAllNotificationsRead(userId));
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  }, [execute]);

  return {
    notifications,
    fetchNotifications,
    fetchUnreadNotifications,
    createNotification,
    markNotificationRead,
    markAllNotificationsRead,
    loading,
    error
  };
};
