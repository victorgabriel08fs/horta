import { Head, Link, useForm } from '@inertiajs/react';
import { FormEvent } from 'react';
import { Button, Card, Field, Input } from '@/components/ui';

export default function Login({ canRegister = true }: { canRegister?: boolean }) {
    const form = useForm({ email: '', password: '', remember: false });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        form.post('/entrar', { onFinish: () => form.reset('password') });
    };

    return (
        <div className="flex min-h-full items-center justify-center bg-stone-50 px-4 py-12">
            <Head title="Entrar" />
            <div className="w-full max-w-md">
                <Link href="/" className="mb-6 flex items-center justify-center gap-2 text-2xl font-bold text-brand-700">
                    <span className="text-3xl">🌱</span> Horta
                </Link>
                <Card className="p-8">
                    <h1 className="text-xl font-bold text-stone-800">Entrar</h1>
                    <p className="mt-1 text-sm text-stone-500">Acesse sua conta para acompanhar suas reservas.</p>

                    <form onSubmit={submit} className="mt-6 space-y-4">
                        <Field label="E-mail" required error={form.errors.email}>
                            <Input
                                type="email"
                                value={form.data.email}
                                onChange={(e) => form.setData('email', e.target.value)}
                                autoFocus
                            />
                        </Field>
                        <Field label="Senha" required error={form.errors.password}>
                            <Input
                                type="password"
                                value={form.data.password}
                                onChange={(e) => form.setData('password', e.target.value)}
                            />
                        </Field>
                        <label className="flex items-center gap-2 text-sm text-stone-600">
                            <input
                                type="checkbox"
                                className="accent-brand-600"
                                checked={form.data.remember}
                                onChange={(e) => form.setData('remember', e.target.checked)}
                            />
                            Manter conectado
                        </label>
                        <Button type="submit" className="w-full" disabled={form.processing}>
                            {form.processing ? 'Entrando…' : 'Entrar'}
                        </Button>
                    </form>

                    {canRegister && (
                        <p className="mt-6 text-center text-sm text-stone-500">
                            Não tem conta?{' '}
                            <Link href="/registrar" className="font-medium text-brand-700 hover:underline">
                                Criar conta
                            </Link>
                        </p>
                    )}
                </Card>
            </div>
        </div>
    );
}
