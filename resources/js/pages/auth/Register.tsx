import { Head, Link, useForm } from '@inertiajs/react';
import { FormEvent } from 'react';
import { Button, Card, Field, Input } from '@/components/ui';

export default function Register() {
    const form = useForm({
        name: '',
        email: '',
        phone: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        form.post('/registrar', { onFinish: () => form.reset('password', 'password_confirmation') });
    };

    return (
        <div className="flex min-h-full items-center justify-center bg-stone-50 px-4 py-12">
            <Head title="Criar conta" />
            <div className="w-full max-w-md">
                <Link href="/" className="mb-6 flex items-center justify-center gap-2 text-2xl font-bold text-brand-700">
                    <span className="text-3xl">🌱</span> Horta
                </Link>
                <Card className="p-8">
                    <h1 className="text-xl font-bold text-stone-800">Criar conta</h1>
                    <p className="mt-1 text-sm text-stone-500">Crie sua conta para reservar mais rápido nas próximas semanas.</p>

                    <form onSubmit={submit} className="mt-6 space-y-4">
                        <Field label="Nome" required error={form.errors.name}>
                            <Input value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} autoFocus />
                        </Field>
                        <Field label="E-mail" required error={form.errors.email}>
                            <Input
                                type="email"
                                value={form.data.email}
                                onChange={(e) => form.setData('email', e.target.value)}
                            />
                        </Field>
                        <Field label="WhatsApp / telefone" error={form.errors.phone}>
                            <Input
                                value={form.data.phone}
                                onChange={(e) => form.setData('phone', e.target.value)}
                                placeholder="(11) 90000-0000"
                            />
                        </Field>
                        <Field label="Senha" required error={form.errors.password}>
                            <Input
                                type="password"
                                value={form.data.password}
                                onChange={(e) => form.setData('password', e.target.value)}
                            />
                        </Field>
                        <Field label="Confirmar senha" required>
                            <Input
                                type="password"
                                value={form.data.password_confirmation}
                                onChange={(e) => form.setData('password_confirmation', e.target.value)}
                            />
                        </Field>
                        <Button type="submit" className="w-full" disabled={form.processing}>
                            {form.processing ? 'Criando…' : 'Criar conta'}
                        </Button>
                    </form>

                    <p className="mt-6 text-center text-sm text-stone-500">
                        Já tem conta?{' '}
                        <Link href="/entrar" className="font-medium text-brand-700 hover:underline">
                            Entrar
                        </Link>
                    </p>
                </Card>
            </div>
        </div>
    );
}
