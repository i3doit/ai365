'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../src/lib/supabase';

interface Action {
  id: string;
  title: string;
  is_completed: boolean;
  goal_id: string;
}

interface Goal {
  id: string;
  title: string;
  value_score: number;
  target_date: string;
  actions: Action[];
}

// 勋章图标组件
const MedalIcon = () => (
  <svg className="w-6 h-6 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
  </svg>
);

export default function Home() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    value_score: 5,
    target_date: new Date().toISOString().split('T')[0]
  });
  const [expandedGoals, setExpandedGoals] = useState<Set<string>>(new Set());
  const [newAction, setNewAction] = useState<{[key: string]: string}>({});
  const [loading, setLoading] = useState(true);

  // Fetch goals from Supabase
  const fetchGoals = async () => {
    try {
      const { data, error } = await supabase
        .from('goals')
        .select(`
          *,
          actions (*)
        `)
        .order('value_score', { ascending: false });

      if (error) throw error;
      setGoals(data || []);
    } catch (error) {
      console.error('Error fetching goals:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('goals')
        .insert([{
          title: formData.title,
          value_score: formData.value_score,
          target_date: formData.target_date
        }]);

      if (error) throw error;

      await fetchGoals();
      setFormData({
        title: '',
        value_score: 5,
        target_date: new Date().toISOString().split('T')[0]
      });
    } catch (error) {
      console.error('Error creating goal:', error);
      alert('创建目标失败，请检查数据库连接或表结构');
    }
  };

  const toggleExpand = (goalId: string) => {
    const newExpanded = new Set(expandedGoals);
    if (newExpanded.has(goalId)) {
      newExpanded.delete(goalId);
    } else {
      newExpanded.add(goalId);
    }
    setExpandedGoals(newExpanded);
  };

  const handleActionInputChange = (goalId: string, value: string) => {
    setNewAction({
      ...newAction,
      [goalId]: value
    });
  };

  const addAction = async (goalId: string, title: string) => {
    try {
      const { error } = await supabase
        .from('actions')
        .insert([{
          goal_id: goalId,
          title: title,
          is_completed: false
        }]);

      if (error) throw error;

      await fetchGoals();
      setNewAction({
        ...newAction,
        [goalId]: ''
      });
    } catch (error) {
      console.error('Error adding action:', error);
      alert('添加行动项失败');
    }
  };

  const toggleAction = async (goalId: string, actionId: string) => {
    const goal = goals.find(g => g.id === goalId);
    const action = goal?.actions.find(a => a.id === actionId);
    if (!action) return;

    try {
      const { error } = await supabase
        .from('actions')
        .update({ is_completed: !action.is_completed })
        .eq('id', actionId);

      if (error) throw error;

      await fetchGoals();
    } catch (error) {
      console.error('Error toggling action:', error);
    }
  };

  // 计算目标进度
  const getGoalProgress = (goal: Goal) => {
    if (!goal.actions || goal.actions.length === 0) return 0;
    const completedActions = goal.actions.filter(action => action.is_completed).length;
    return (completedActions / goal.actions.length) * 100;
  };

  // 获取进度条颜色
  const getProgressBarColor = (valueScore: number) => {
    if (valueScore >= 8) return 'bg-blue-600'; // 高价值：深蓝色
    if (valueScore >= 5) return 'bg-cyan-500'; // 中价值：青色
    return 'bg-gray-400'; // 低价值：灰色
  };

  // 检查是否所有行动项都已完成
  const isGoalCompleted = (goal: Goal) => {
    return goal.actions && goal.actions.length > 0 && goal.actions.every(action => action.is_completed);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">目标管理</h1>
        
        {/* 创建目标表单 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">创建新目标</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                目标标题
              </label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="输入你的目标..."
                required
              />
            </div>
            
            <div>
              <label htmlFor="value_score" className="block text-sm font-medium text-gray-700 mb-1">
                价值分数: {formData.value_score}
              </label>
              <input
                type="range"
                id="value_score"
                min="1"
                max="10"
                value={formData.value_score}
                onChange={(e) => setFormData({ ...formData, value_score: parseInt(e.target.value) })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>1</span>
                <span>10</span>
              </div>
            </div>
            
            <div>
              <label htmlFor="target_date" className="block text-sm font-medium text-gray-700 mb-1">
                目标日期
              </label>
              <input
                type="date"
                id="target_date"
                value={formData.target_date}
                onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors duration-200 font-medium"
            >
              创建目标
            </button>
          </form>
        </div>

        {/* 目标列表 */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center text-gray-500">加载中...</div>
          ) : goals.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              还没有目标，快去创建一个吧！
            </div>
          ) : (
            goals.map((goal) => {
              const progress = getGoalProgress(goal);
              const isCompleted = isGoalCompleted(goal);
              const progressBarColor = getProgressBarColor(goal.value_score);
              
              return (
                <div key={goal.id} className="bg-white rounded-lg shadow-md overflow-hidden relative">
                  {/* 已达成勋章 */}
                  {isCompleted && (
                    <div className="absolute top-4 right-4 bg-yellow-100 rounded-full p-2 shadow-lg">
                      <MedalIcon />
                    </div>
                  )}
                  
                  <div 
                    className="p-6 cursor-pointer hover:bg-gray-50 transition-colors duration-200"
                    onClick={() => toggleExpand(goal.id)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold text-gray-800">{goal.title}</h3>
                      <div className="flex items-center space-x-2">
                        <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2 py-1 rounded">
                          价值: {goal.value_score}
                        </span>
                        <span className="text-sm text-gray-500">
                          {new Date(goal.target_date).toLocaleDateString('zh-CN')}
                        </span>
                      </div>
                    </div>
                    
                    {/* 进度条 */}
                    <div className="mb-3">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>进度</span>
                        <span>{Math.round(progress)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${progressBarColor}`}
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-600">
                      行动项: {goal.actions ? goal.actions.filter(action => !action.is_completed).length : 0} / {goal.actions ? goal.actions.length : 0} 未完成
                    </div>
                  </div>
                  
                  {expandedGoals.has(goal.id) && (
                    <div className="border-t border-gray-200 p-6 bg-gray-50">
                      <h4 className="text-md font-medium text-gray-800 mb-4">行动项</h4>
                      
                      {/* 添加新行动项 */}
                      <div className="mb-4">
                        <div className="flex space-x-2">
                          <input
                            type="text"
                            value={newAction[goal.id] || ''}
                            onChange={(e) => handleActionInputChange(goal.id, e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter' && newAction[goal.id]?.trim()) {
                                addAction(goal.id, newAction[goal.id].trim());
                              }
                            }}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            placeholder="添加新的行动项..."
                          />
                          <button
                            onClick={() => {
                              if (newAction[goal.id]?.trim()) {
                                addAction(goal.id, newAction[goal.id].trim());
                              }
                            }}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 text-sm"
                          >
                            添加
                          </button>
                        </div>
                      </div>
                      
                      {/* 行动项列表 */}
                      <div className="space-y-2">
                        {goal.actions && goal.actions.length > 0 ? (
                          goal.actions
                            .sort((a, b) => {
                              // 未完成的排在前面
                              if (a.is_completed !== b.is_completed) {
                                return a.is_completed ? 1 : -1;
                              }
                              return 0;
                            })
                            .map((action) => (
                              <div key={action.id} className="flex items-center space-x-3 p-2 bg-white rounded border">
                                <input
                                  type="checkbox"
                                  checked={action.is_completed}
                                  onChange={() => toggleAction(goal.id, action.id)}
                                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <span 
                                  className={`flex-1 text-sm ${
                                    action.is_completed 
                                      ? 'line-through text-gray-500' 
                                      : 'text-gray-800'
                                  }`}
                                >
                                  {action.title}
                                </span>
                              </div>
                            ))
                        ) : (
                          <div className="text-sm text-gray-500 italic">暂无行动项</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}