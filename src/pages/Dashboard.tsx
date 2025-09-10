import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

interface LoanApplication {
  id: string;
  user_id: string;
  sector: string;
  amount_requested: number;
  repayment_date: string;
  status: string;
  created_at: string;
  user_email?: string;
  user_name?: string;
  total_credit_score?: number;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<LoanApplication[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  });
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);

  useEffect(() => {
    fetchApplications();

    // Set up real-time subscription
    const subscription = supabase
      .channel('loan_applications_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'loan_applications' },
        (payload) => {
          console.log('Real-time update:', payload);
          fetchApplications(); // Refresh data when changes occur
        }
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [sortBy, sortOrder]);

  const fetchApplications = async () => {
    try {
      const { data, error } = await supabase
        .from('loan_applications')
        .select('*')
        .order(sortBy, { ascending: sortOrder === 'asc' });

      if (error) throw error;

      // Get profiles separately
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, email, full_name');

      const appsWithEmail = data.map(app => {
        const profile = profiles?.find(p => p.id === app.user_id);
        return {
          ...app,
          user_email: profile?.email || 'Unknown',
          user_name: profile?.full_name || 'Unknown User'
        };
      });

      setApplications(appsWithEmail);

      // Calculate stats
      const total = appsWithEmail.length;
      const pending = appsWithEmail.filter(app => app.status === 'pending').length;
      const approved = appsWithEmail.filter(app => app.status === 'approved').length;
      const rejected = appsWithEmail.filter(app => app.status === 'rejected').length;

      setStats({ total, pending, approved, rejected });
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      // Validate status to prevent injection
      const validStatuses = ['pending', 'approved', 'rejected'];
      if (!validStatuses.includes(status)) {
        throw new Error('Invalid status value');
      }

      // Validate UUID format for id
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(id)) {
        throw new Error('Invalid ID format');
      }

      setUpdatingStatus(id);

      // Update UI immediately
      setApplications(prev =>
        prev.map(app =>
          app.id === id ? { ...app, status } : app
        )
      );

      const { error } = await supabase
        .from('loan_applications')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating status');
      // Revert UI change on error
      fetchApplications();
    } finally {
      setUpdatingStatus(null);
    }
  };

  const copyToClipboard = async (id: string) => {
    try {
      await navigator.clipboard.writeText(id);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy ID');
    }
  };

  const copyEmailToClipboard = async (email: string) => {
    try {
      await navigator.clipboard.writeText(email);
      setCopiedEmail(email);
      setTimeout(() => setCopiedEmail(null), 2000);
    } catch (err) {
      console.error('Failed to copy email');
    }
  };



  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-8 border border-white/20">
          <div className="flex flex-col items-center">
            <div className="relative">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200"></div>
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent absolute top-0"></div>
            </div>
            <p className="text-slate-600 mt-4 text-base font-medium">Loading dashboard...</p>
            <div className="flex space-x-1 mt-3">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{backgroundColor: '#f5f7f8'}}>
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        <div className="mb-8">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg mb-3 shadow-md" style={{backgroundColor: '#005baa'}}>
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
              </svg>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2" style={{color: '#333333'}}>
              Loan Dashboard
            </h1>
            <p className="text-base max-w-2xl mx-auto leading-relaxed" style={{color: '#333333'}}>Comprehensive loan management and review system for financial institutions</p>
          </div>
          <div className="bg-white/70 backdrop-blur-sm rounded-lg p-3 shadow-md border border-white/20">
            <div className="flex flex-col lg:flex-row gap-3">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search by name, email, or loan ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-10 py-2 border border-slate-200 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 shadow-sm focus:shadow-lg bg-white/90 backdrop-blur-sm text-slate-700 placeholder-slate-400"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full p-1 transition-all duration-200"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
                )}
              </div>
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-');
                  setSortBy(field);
                  setSortOrder(order);
                }}
                className="px-4 py-2 border border-slate-200 rounded-lg bg-white/90 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 shadow-sm focus:shadow-lg text-slate-700 font-medium min-w-[180px]"
              >
                <option value="created_at-desc">📅 Newest First</option>
                <option value="created_at-asc">📅 Oldest First</option>
                <option value="amount_requested-desc">💰 Highest Amount</option>
                <option value="amount_requested-asc">💰 Lowest Amount</option>
                <option value="status-asc">📊 Status A-Z</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <div className="group bg-white rounded-lg shadow-md hover:shadow-lg p-3 border border-gray-200 transform hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{color: '#333333'}}>Total Applications</p>
                <p className="text-lg font-bold" style={{color: '#333333'}}>{stats.total}</p>
                <div className="flex items-center mt-1">
                  <div className="w-1.5 h-1.5 rounded-full mr-1" style={{backgroundColor: '#005baa'}}></div>
                  <span className="text-xs" style={{color: '#333333'}}>All time</span>
                </div>
              </div>
              <div className="p-2 rounded shadow group-hover:scale-110 transition-transform" style={{backgroundColor: '#005baa'}}>
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
              </div>
            </div>
          </div>

          <div className="group bg-white rounded-lg shadow-md hover:shadow-lg p-3 border border-gray-200 transform hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{color: '#666666'}}>Pending Review</p>
                <p className="text-lg font-bold" style={{color: '#F39C12'}}>{stats.pending}</p>
                <div className="flex items-center mt-1">
                  <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mr-1 animate-pulse"></div>
                  <span className="text-xs" style={{color: '#666666'}}>Awaiting action</span>
                </div>
              </div>
              <div className="p-2 rounded shadow group-hover:scale-110 transition-transform" style={{backgroundColor: '#F39C12'}}>
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
            </div>
          </div>

          <div className="group bg-white rounded-lg shadow-md hover:shadow-lg p-3 border border-gray-200 transform hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{color: '#666666'}}>Approved</p>
                <p className="text-lg font-bold text-emerald-600">{stats.approved}</p>
                <div className="flex items-center mt-1">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1"></div>
                  <span className="text-xs" style={{color: '#666666'}}>Successfully funded</span>
                </div>
              </div>
              <div className="p-2 rounded shadow group-hover:scale-110 transition-transform bg-emerald-500">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
            </div>
          </div>

          <div className="group bg-white rounded-lg shadow-md hover:shadow-lg p-3 border border-gray-200 transform hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{color: '#666666'}}>Rejected</p>
                <p className="text-lg font-bold text-red-600">{stats.rejected}</p>
                <div className="flex items-center mt-1">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full mr-1"></div>
                  <span className="text-xs" style={{color: '#666666'}}>Did not qualify</span>
                </div>
              </div>
              <div className="p-2 rounded shadow group-hover:scale-110 transition-transform bg-red-500">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 overflow-hidden w-full">
          <div className="px-4 py-3 border-b border-slate-200/50 bg-gradient-to-r from-slate-50 to-blue-50">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-800">Recent Applications</h2>
                <p className="text-slate-600 text-xs">Review and manage loan applications</p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-slate-500">Live</span>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="px-3 py-2 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">ID</th>
                  <th className="px-3 py-2 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Applicant</th>
                  <th className="px-3 py-2 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Amount</th>
                  <th className="px-3 py-2 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Score</th>
                  <th className="px-3 py-2 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Sector</th>
                  <th className="px-3 py-2 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Date</th>
                  <th className="px-3 py-2 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Status</th>
                  <th className="px-3 py-2 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {applications.filter(app =>
                  app.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  app.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  app.id.toLowerCase().includes(searchTerm.toLowerCase())
                ).map((app, index) => (
                  <tr key={app.id} className="hover:bg-slate-50/80 transition-all duration-300 group">
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-indigo-500 rounded flex items-center justify-center">
                          <span className="text-white font-bold text-xs">{index + 1}</span>
                        </div>
                        <span className="font-mono text-xs text-slate-600">{app.id.slice(0, 6)}...</span>
                        <button
                          onClick={() => copyToClipboard(app.id)}
                          className="p-1 rounded hover:bg-gray-100 transition-colors"
                          title="Copy full ID"
                        >
                          {copiedId === app.id ? (
                            <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                          ) : (
                            <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                            </svg>
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-6 w-6 rounded bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                          <span className="text-white font-bold text-xs">
                            {app.user_name?.charAt(0).toUpperCase() || 'U'}
                          </span>
                        </div>
                        <div className="ml-2">
                          <div className="text-xs font-semibold text-slate-800">{app.user_name}</div>
                          <div className="flex items-center gap-1">
                            <div className="text-xs text-slate-500">{app.user_email?.split('@')[0]}</div>
                            <button
                              onClick={() => copyEmailToClipboard(app.user_email || '')}
                              className="p-1 rounded hover:bg-gray-100 transition-colors"
                              title="Copy full email"
                            >
                              {copiedEmail === app.user_email ? (
                                <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                </svg>
                              ) : (
                                <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                                </svg>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="text-sm font-bold text-slate-800">${app.amount_requested.toLocaleString()}</div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className={`text-sm font-bold ${
                        (app.total_credit_score || 0) >= 75 ? 'text-green-600' :
                        (app.total_credit_score || 0) >= 60 ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {app.total_credit_score ? `${app.total_credit_score}%` : 'N/A'}
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded ${
                        app.sector === 'formal'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {app.sector.charAt(0).toUpperCase() + app.sector.slice(1)}
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="text-xs font-medium text-slate-700">
                        {new Date(app.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded ${
                        app.status === 'approved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : app.status === 'rejected'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => navigate(`/review/${app.id}`)}
                          className="text-white px-3 py-1 rounded text-xs font-medium transition-colors"
                          style={{backgroundColor: '#005baa'}}
                        >
                          Review
                        </button>
                        {app.status === 'pending' && (
                          <div className="flex gap-1">
                            <button
                              onClick={() => updateStatus(app.id, 'approved')}
                              disabled={updatingStatus === app.id}
                              className="text-white px-3 py-1 rounded text-xs font-medium transition-colors"
                              style={{backgroundColor: updatingStatus === app.id ? '#cccccc' : '#2ecc71'}}
                            >
                              {updatingStatus === app.id ? '...' : 'Approve'}
                            </button>
                            <button
                              onClick={() => updateStatus(app.id, 'rejected')}
                              disabled={updatingStatus === app.id}
                              className="text-white px-3 py-1 rounded text-xs font-medium transition-colors"
                              style={{backgroundColor: updatingStatus === app.id ? '#cccccc' : '#e74c3c'}}
                            >
                              {updatingStatus === app.id ? '...' : 'Reject'}
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {applications.filter(app =>
              app.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              app.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              app.id.toLowerCase().includes(searchTerm.toLowerCase())
            ).length === 0 && (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gradient-to-r from-slate-200 to-slate-300 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-600 mb-2">No applications found</h3>
                <p className="text-slate-500">Try adjusting your search criteria or check back later for new applications.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;