import { useState } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff, LogIn, UserPlus, AlertCircle, Scroll } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

type AuthMode = 'login' | 'register';

export default function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, login, register, isAuthLoading } = useAppStore();

  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const from = (location.state as { from?: string })?.from || '/';

  if (user) {
    return <Navigate to={from} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (mode === 'login') {
      const result = await login({ email, password });
      if (result.success) {
        navigate(from, { replace: true });
      } else {
        setError(result.error || '登录失败');
      }
    } else {
      const result = await register({ email, username, password });
      if (result.success) {
        navigate(from, { replace: true });
      } else {
        setError(result.error || '注册失败');
      }
    }
  };

  const switchMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 mb-4 shadow-lg shadow-orange-200">
            <Scroll className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-serif font-bold text-brown-800 mb-2">
            家族祭祀管理平台
          </h1>
          <p className="text-brown-500">
            {mode === 'login' ? '登录您的账户以同步数据' : '创建账户开始云端同步'}
          </p>
        </div>

        <div className="card p-8">
          <div className="flex mb-6 bg-cream-50 rounded-xl p-1">
            <button
              type="button"
              onClick={() => mode !== 'login' && switchMode()}
              className={`flex-1 py-2.5 px-4 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 ${
                mode === 'login'
                  ? 'bg-white text-brown-800 shadow-sm'
                  : 'text-brown-500 hover:text-brown-700'
              }`}
            >
              <LogIn className="w-4 h-4" />
              登录
            </button>
            <button
              type="button"
              onClick={() => mode !== 'register' && switchMode()}
              className={`flex-1 py-2.5 px-4 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 ${
                mode === 'register'
                  ? 'bg-white text-brown-800 shadow-sm'
                  : 'text-brown-500 hover:text-brown-700'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              注册
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-sm font-medium text-brown-700 mb-2">
                  用户名
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-brown-400" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="请输入用户名"
                    className="input-field pl-10"
                    required
                    minLength={2}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-brown-700 mb-2">
                邮箱
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-brown-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="请输入邮箱地址"
                  className="input-field pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-brown-700 mb-2">
                密码
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-brown-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === 'login' ? '请输入密码' : '请设置密码（至少6位）'}
                  className="input-field pl-10 pr-10"
                  required
                  minLength={mode === 'register' ? 6 : undefined}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-brown-400 hover:text-brown-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {mode === 'register' && (
                <p className="text-xs text-brown-400 mt-1">密码至少需要6个字符</p>
              )}
            </div>

            {error && (
              <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-red-600">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isAuthLoading}
              className="btn-primary w-full py-3 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isAuthLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {mode === 'login' ? '登录中...' : '注册中...'}
                </>
              ) : (
                <>
                  {mode === 'login' ? (
                    <>
                      <LogIn className="w-5 h-5" />
                      登录
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-5 h-5" />
                      创建账户
                    </>
                  )}
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-brown-100">
            <p className="text-center text-sm text-brown-500">
              {mode === 'login' ? '还没有账户？' : '已有账户？'}
              <button
                type="button"
                onClick={switchMode}
                className="ml-1 text-amber-600 hover:text-amber-700 font-medium transition-colors"
              >
                {mode === 'login' ? '立即注册' : '去登录'}
              </button>
            </p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-brown-400 leading-relaxed">
            🔒 您的数据将通过云端加密存储
            <br />
            支持多设备同步，永不丢失珍贵家族记忆
          </p>
        </div>
      </div>
    </div>
  );
}
