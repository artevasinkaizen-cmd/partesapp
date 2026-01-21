import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
// import { send } from '@emailjs/browser';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { useAppStore } from '../../store/useAppStore';
// import { EMAILJS_CONFIG } from '../../lib/email';

import { supabase } from '../../utils/supabase';

export default function SignUp() {
    const navigate = useNavigate();
    const { registerUser } = useAppStore();

    // Form State
    const [step, setStep] = useState<'email' | 'verification' | 'password'>('email');
    const [email, setEmail] = useState('');
    const [userCode, setUserCode] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSendCode = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.includes('@')) {
            setError('Introduce un correo válido');
            return;
        }

        setLoading(true);

        try {
            // @ts-ignore
            const { error: sendError, data } = await supabase.auth.sendCode(email);

            if (sendError) {
                setError(sendError.message || 'Error al enviar código');
                return;
            }

            if (data?.devCode) {
                alert(`[MODO DESARROLLO - SIN SMTP] Tu código es: ${data.devCode}`);
            }

            setStep('verification');
            setError('');
        } catch (err: any) {
            console.error(err);
            setError('Error de conexión o servidor');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyCode = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            // @ts-ignore
            const { error: verifyError } = await supabase.auth.verifyCode(email, userCode);

            if (verifyError) {
                setError('Código incorrecto o expirado');
                return;
            }

            setStep('password');
            setError('');
        } catch (err) {
            setError('Error de verificación');
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden');
            return;
        }
        if (password.length < 6) {
            setError('La contraseña debe ser de al menos 6 caracteres');
            return;
        }

        const success = await registerUser({ email, password });
        if (success) {
            alert('Cuenta creada exitosamente. Verifica tu correo si es necesario.');
            navigate('/dashboard');
        } else {
            setError('Error al crear usuario. Puede que ya exista.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
            <Card className="max-w-md w-full p-8">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-slate-900">Crear Cuenta</h2>
                    <p className="mt-2 text-sm text-slate-600">
                        {step === 'email' && 'Introduce tu correo para comenzar'}
                        {step === 'verification' && 'Hemos enviado un código a tu correo'}
                        {step === 'password' && 'Establece tu contraseña'}
                    </p>
                </div>

                {error && (
                    <div className="mb-4 bg-red-50 text-red-700 p-3 rounded-lg text-sm border border-red-100">
                        {error}
                    </div>
                )}

                {step === 'email' && (
                    <form onSubmit={handleSendCode} className="space-y-4">
                        <Input
                            label="Correo Electrónico"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <Button
                            type="submit"
                            className="w-full justify-center"
                            disabled={loading}
                        >
                            {loading ? 'Enviando...' : 'Continuar'}
                        </Button>
                    </form>
                )}

                {step === 'verification' && (
                    <form onSubmit={handleVerifyCode} className="space-y-4">
                        <Input
                            label="Código de Verificación"
                            value={userCode}
                            onChange={(e) => setUserCode(e.target.value)}
                            placeholder="Ej. 123456"
                            required
                        />
                        <Button type="submit" className="w-full justify-center">
                            Verificar Código
                        </Button>
                        <button
                            type="button"
                            onClick={handleSendCode}
                            className="text-xs text-blue-600 hover:underline w-full text-center"
                            disabled={loading}
                        >
                            {loading ? 'Reenviando...' : 'Reenviar código'}
                        </button>
                    </form>
                )}

                {step === 'password' && (
                    <form onSubmit={handleRegister} className="space-y-4">
                        <Input
                            label="Contraseña"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <Input
                            label="Confirmar Contraseña"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                        <Button type="submit" className="w-full justify-center">
                            Finalizar Registro
                        </Button>
                    </form>
                )}

                <div className="mt-6 text-center text-sm text-slate-600">
                    ¿Ya tienes cuenta?{' '}
                    <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                        Inicia sesión
                    </Link>
                </div>
            </Card>
        </div>
    );
}
