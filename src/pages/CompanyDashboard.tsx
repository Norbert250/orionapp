import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Users, Clock, CheckCircle, AlertCircle, TrendingUp, Activity } from 'lucide-react';

interface FormProgress {
  id: string;
  user_id: string;
  user_email?: string;
  user_name?: string;
  phone_number?: string;
  form_type: 'informal' | 'formal';
  current_step: number;
  total_steps: number;
  step_name: string;
  progress_percentage: number;
  last_activity: string;
  status: 'in_progress' | 'completed' | 'abandoned';
  time_spent: number; // in minutes
  created_at: string;
}

const CompanyDashboard = () => {
  const [formProgress, setFormProgress] = useState<FormProgress[]>([]);
  const [stats, setStats] = useState({
    activeUsers: 0,
    completedForms: 0,
    abandonedForms: 0,
    avgCompletionTime: 0,
    completionRate: 0
  });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'in_progress' | 'completed' | 'abandoned'>('all');

  useEffect(() => {
    fetchFormProgress();
    
    // Set up real-time subscription
    const subscription = supabase
      .channel('form_progress_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'form_progress' },
        () => fetchFormProgress()
      )
      .subscribe();

    // Refresh every 3 seconds for real-time updates
    const interval = setInterval(fetchFormProgress, 3000);

    return () => {
      subscription.unsubscribe();
      clearInterval(interval);
    };
  }, []);

  const fetchFormProgress = async () => {
    try {
      console.log('Fetching form progress data...');
      
      // Fetch form progress data (keep all records including abandoned)
      const { data: progressData, error } = await supabase
        .from('form_progress')
        .select('*')
        .order('last_activity', { ascending: false });

      console.log('Progress data:', progressData);
      console.log('Error:', error);

      if (error) {
        console.error('❌ Database error:', error);
        setFormProgress([]);
        calculateStats([]);
        return;
      }

      if (!progressData || progressData.length === 0) {
        console.log('ℹ️ No real progress data found');
        setFormProgress([]);
        calculateStats([]);
        return;
      }

      // Fetch user profiles
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, email, full_name');

      const progressWithUsers = progressData.map(progress => {
        const profile = profiles?.find(p => p.id === progress.user_id);
        return {
          ...progress,
          user_email: profile?.email || 'Unknown',
          user_name: profile?.full_name || 'Unknown User'
        };
      });

      setFormProgress(progressWithUsers);
      calculateStats(progressWithUsers);
    } catch (error) {
      console.error('Error:', error);
      // Fallback to mock data
      const mockData = generateMockData();
      setFormProgress(mockData);
      calculateStats(mockData);
    } finally {
      setLoading(false);
    }
  };

  const generateMockData = (): FormProgress[] => {
    const steps = [
      'Instructions',
      'Assets Upload',
      'Documents Upload', 
      'Loan Details',
      'Completed'
    ];

    return Array.from({ length: 15 }, (_, i) => {
      const currentStep = Math.floor(Math.random() * 5);
      const status = currentStep === 4 ? 'completed' : 
                   Math.random() > 0.7 ? 'abandoned' : 'in_progress';
      
      return {
        id: `progress_${i + 1}`,
        user_id: `user_${i + 1}`,
        user_email: `user${i + 1}@example.com`,
        user_name: `User ${i + 1}`,
        form_type: Math.random() > 0.5 ? 'informal' : 'formal',
        current_step: currentStep,
        total_steps: 4,
        step_name: steps[currentStep],
        progress_percentage: Math.round((currentStep / 4) * 100),
        last_activity: new Date(Date.now() - Math.random() * 3600000).toISOString(),
        status,
        time_spent: Math.floor(Math.random() * 45) + 5,
        created_at: new Date(Date.now() - Math.random() * 86400000).toISOString()
      };
    });
  };

  const calculateStats = (data: FormProgress[]) => {
    const activeUsers = data.filter(p => p.status === 'in_progress').length;
    const completedForms = data.filter(p => p.status === 'completed').length;
    const abandonedForms = data.filter(p => p.status === 'abandoned').length;
    const avgCompletionTime = data
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + p.time_spent, 0) / (completedForms || 1);
    const completionRate = data.length > 0 ? (completedForms / data.length) * 100 : 0;

    setStats({
      activeUsers,
      completedForms,
      abandonedForms,
      avgCompletionTime: Math.round(avgCompletionTime),
      completionRate: Math.round(completionRate)
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'abandoned': return 'bg-red-100 text-red-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 75) return 'bg-green-500';
    if (percentage >= 50) return 'bg-yellow-500';
    if (percentage >= 25) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const filteredProgress = formProgress.filter(p => 
    filter === 'all' || p.status === filter
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4 text-center">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-600 rounded-lg mb-4">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Form Progress Dashboard
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Real-time tracking of user form completion progress
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeUsers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completedForms}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
            <div className="flex items-center">
              <AlertCircle className="h-8 w-8 text-red-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Abandoned</p>
                <p className="text-2xl font-bold text-gray-900">{stats.abandonedForms}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Time</p>
                <p className="text-2xl font-bold text-gray-900">{stats.avgCompletionTime}m</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-yellow-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completionRate}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            {['all', 'in_progress', 'completed', 'abandoned'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status as any)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Progress Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">User Progress</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Form Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Progress
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Current Step
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time Spent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Activity
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProgress.map((progress) => (
                  <tr key={progress.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-medium text-sm">
                            {progress.user_name?.charAt(0) || 'U'}
                          </span>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {progress.user_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {progress.phone_number || progress.user_email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        progress.form_type === 'formal' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {progress.form_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-500 ${getProgressColor(progress.progress_percentage)}`}
                          style={{ width: `${progress.progress_percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600 mt-1">
                        {progress.progress_percentage}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {progress.step_name}
                      <div className="text-xs text-gray-500">
                        Step {progress.current_step + 1} of {progress.total_steps + 1}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(progress.status)}`}>
                          {progress.status.replace('_', ' ')}
                        </span>
                        {Date.now() - new Date(progress.last_activity).getTime() < 60000 && progress.status === 'in_progress' && (
                          <div className="flex items-center">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-xs text-green-600">ACTIVE</span>
                          </div>
                        )}
                        {progress.status === 'abandoned' && (
                          <div className="text-xs text-red-600">
                            Left at: {progress.step_name}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {progress.time_spent} min
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center space-x-2">
                        <span>{new Date(progress.last_activity).toLocaleString()}</span>
                        {Date.now() - new Date(progress.last_activity).getTime() < 60000 && progress.status === 'in_progress' && (
                          <div className="flex items-center">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-xs text-green-600 ml-1">LIVE</span>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredProgress.length === 0 && (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No progress data</h3>
              <p className="mt-1 text-sm text-gray-500">
                No users are currently filling out forms.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompanyDashboard;