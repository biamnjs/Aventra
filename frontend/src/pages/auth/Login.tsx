import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Lock, MapPin } from 'lucide-react';
import { useLogin } from '../../hooks/useAuth';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const login = useLogin();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      await login.mutateAsync(form);
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? 'Erro ao iniciar sessão';
      setError(message);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">Aventra</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Bem-vindo de volta!</h1>
          <p className="text-gray-500 mt-1">Entra para continuar a tua aventura</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Email"
              type="email"
              placeholder="o.teu@email.com"
              icon={<Mail className="w-4 h-4" />}
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              required
            />
            <Input
              label="Palavra-passe"
              type="password"
              placeholder="••••••••"
              icon={<Lock className="w-4 h-4" />}
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              required
            />

            {error && (
              <div className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-3">
                {error}
              </div>
            )}

            <Button type="submit" size="lg" loading={login.isPending} className="mt-2">
              Entrar
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Ainda não tens conta?{' '}
            <Link to="/registar" className="text-brand-500 font-medium hover:text-brand-600">
              Registar gratuitamente
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
