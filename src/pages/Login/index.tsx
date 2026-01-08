import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { useAppStore } from '../../store/useAppStore';

export default function Login() {
    const navigate = useNavigate();
    const { loginUser } = useAppStore();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const success = await loginUser(email, password);

        if (success) {
            navigate('/dashboard');
        } else {
            setError('Credenciales inválidas');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
            <Card className="max-w-md w-full p-8">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-extrabold text-slate-900">
                        Iniciar Sesión
                    </h2>
                    <p className="mt-2 text-sm text-slate-600">
                        Accede para gestionar tus partes
                    </p>
                </div>

                {error && (
                    <div className="mb-4 bg-red-50 text-red-700 p-3 rounded-lg text-sm border border-red-100">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                    <Input
                        label="Correo Electrónico"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <Input
                        label="Contraseña"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    <Button
                        type="submit"
                        className="w-full justify-center mt-4"
                    >
                        Entrar
                    </Button>
                </form>

                <div className="mt-6 text-center text-sm text-slate-600">
                    ¿No tienes cuenta?{' '}
                    <Link to="/signup" className="font-medium text-blue-600 hover:text-blue-500">
                        Regístrate aquí
                    </Link>
                </div>
            </Card>
        </div>
    );
}
