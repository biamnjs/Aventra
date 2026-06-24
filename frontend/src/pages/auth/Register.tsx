import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Lock, User, MapPin } from 'lucide-react';
import { useRegister } from '../../hooks/useAuth';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const register = useRegister();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (form.password.length < 8) {
      setError('A palavra-passe deve ter pelo menos 8 caracteres');
      return;
    }
    try {
      await register.mutateAsync(form);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? 'Erro ao criar conta';
      setError(msg);
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
          <h1 className="text-2xl font-bold text-gray-900">Cria a tua conta</h1>
          <p className="text-gray-500 mt-1">Começa a planear a tua próxima aventura</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Nome completo"
              type="text"
              placeholder="O teu nome"
              icon={<User className="w-4 h-4" />}
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
            />
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
              placeholder="Mínimo 8 caracteres"
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

            <Button type="submit" size="lg" loading={register.isPending} className="mt-2">
              Criar conta
            </Button>

            <p className="text-center text-xs text-gray-400">
              Ao criar conta, aceitas os nossos Termos de Serviço e Política de Privacidade.
            </p>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Já tens conta?{' '}
            <Link to="/entrar" className="text-brand-500 font-medium hover:text-brand-600">
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
