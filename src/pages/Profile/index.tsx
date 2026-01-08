import { useState, useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { User, Lock, Save } from 'lucide-react';

export default function Profile() {
    const { currentUser, updateUserProfile, changePassword } = useAppStore();

    // Personal Info State
    const [name, setName] = useState(currentUser?.name || '');
    const [successMsg, setSuccessMsg] = useState('');

    // Password State
    const [currentPass, setCurrentPass] = useState('');
    const [newPass, setNewPass] = useState('');
    const [confirmPass, setConfirmPass] = useState('');
    const [passError, setPassError] = useState('');
    const [passSuccess, setPassSuccess] = useState('');

    useEffect(() => {
        if (currentUser) {
            setName(currentUser.name || '');
        }
    }, [currentUser]);

    const handleUpdateProfile = (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser) return;

        updateUserProfile(currentUser.email, { name });
        setSuccessMsg('Perfil actualizado correctamente');
        setTimeout(() => setSuccessMsg(''), 3000);
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setPassError('');
        setPassSuccess('');

        if (!currentUser) return;
        if (newPass !== confirmPass) {
            setPassError('Las contraseñas nuevas no coinciden');
            return;
        }

        if (newPass.length < 4) {
            setPassError('La contraseña debe tener al menos 4 caracteres');
            return;
        }

        const result = await changePassword(currentUser.email, currentPass, newPass);

        if (result) {
            setPassSuccess('Contraseña cambiada con éxito');
            setCurrentPass('');
            setNewPass('');
            setConfirmPass('');
            setTimeout(() => setPassSuccess(''), 3000);
        } else {
            setPassError('La contraseña actual es incorrecta');
        }
    };

    if (!currentUser) return <div>Inicia sesión para ver tu perfil</div>;

    return (
        <div className="space-y-6 max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                <User className="w-6 h-6 text-blue-600" />
                Mi Perfil
            </h1>

            {/* Personal Info Card */}
            <Card>
                <h2 className="text-lg font-semibold mb-4 text-slate-800 border-b border-slate-100 pb-2">
                    Información Personal
                </h2>
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-slate-700">Email</label>
                            <div className="px-4 py-2.5 bg-slate-100 text-slate-500 rounded-xl border border-slate-200">
                                {currentUser.email}
                            </div>
                            <p className="text-xs text-slate-400 mt-1">El email no se puede cambiar.</p>
                        </div>
                        <Input
                            label="Nombre y Apellidos"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Tu nombre completo"
                        />
                    </div>

                    <div className="flex items-center justify-between pt-2">
                        <span className="text-green-600 text-sm font-medium">{successMsg}</span>
                        <Button type="submit">
                            <Save className="w-4 h-4 mr-2" />
                            Guardar Cambios
                        </Button>
                    </div>
                </form>
            </Card>

            {/* Security Card */}
            <Card>
                <h2 className="text-lg font-semibold mb-4 text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-2">
                    <Lock className="w-5 h-5 text-slate-500" />
                    Seguridad
                </h2>
                <form onSubmit={handleChangePassword} className="space-y-4">
                    <Input
                        label="Contraseña Actual"
                        type="password"
                        value={currentPass}
                        onChange={(e) => setCurrentPass(e.target.value)}
                        required
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Nueva Contraseña"
                            type="password"
                            value={newPass}
                            onChange={(e) => setNewPass(e.target.value)}
                            required
                        />
                        <Input
                            label="Confirmar Nueva Contraseña"
                            type="password"
                            value={confirmPass}
                            onChange={(e) => setConfirmPass(e.target.value)}
                            required
                        />
                    </div>

                    <div className="flex items-center justify-between pt-2">
                        <div className="flex flex-col">
                            {passError && <span className="text-red-500 text-sm font-medium">{passError}</span>}
                            {passSuccess && <span className="text-green-600 text-sm font-medium">{passSuccess}</span>}
                        </div>
                        <Button type="submit" variant="outline">
                            Cambiar Contraseña
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
}
