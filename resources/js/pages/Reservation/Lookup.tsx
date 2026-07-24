import { Head, useForm } from '@inertiajs/react';
import { FormEvent } from 'react';
import AppLayout from '@/layouts/AppLayout';
import { Button, Card, Field, Input } from '@/components/ui';

export default function Lookup() {
    const form = useForm({ confirmation_code: '', contact: '' });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        form.post('/consultar-reserva');
    };

    return (
        <AppLayout>
            <Head title="Consultar reserva" />

            <div className="mx-auto max-w-md">
                <Card className="p-6">
                    <h1 className="text-xl font-bold text-stone-800">Consultar reserva</h1>
                    <p className="mt-1 text-sm text-stone-500">
                        Informe o código que você recebeu ao confirmar a reserva.
                    </p>

                    <form onSubmit={submit} className="mt-6 space-y-4">
                        <Field label="Código da reserva" required error={form.errors.confirmation_code}>
                            <Input
                                value={form.data.confirmation_code}
                                onChange={(e) => form.setData('confirmation_code', e.target.value.toUpperCase())}
                                placeholder="Ex.: OE8KCGB3"
                                className="font-mono tracking-widest"
                            />
                        </Field>
                        <Field
                            label="WhatsApp ou e-mail (opcional)"
                            hint="Reforça a segurança da consulta, se você informou no pedido."
                        >
                            <Input
                                value={form.data.contact}
                                onChange={(e) => form.setData('contact', e.target.value)}
                                placeholder="(11) 90000-0000"
                            />
                        </Field>
                        <Button type="submit" className="w-full" disabled={form.processing}>
                            {form.processing ? 'Buscando…' : 'Consultar'}
                        </Button>
                    </form>
                </Card>
            </div>
        </AppLayout>
    );
}
