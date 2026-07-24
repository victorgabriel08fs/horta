import { Head, useForm } from '@inertiajs/react';
import { FormEvent } from 'react';
import AdminLayout from '@/layouts/AdminLayout';
import { Button, ButtonLink, Card, Field, Input } from '@/components/ui';

interface Point {
    id: number;
    name: string;
    address: string | null;
    reference: string | null;
    is_active: boolean;
}

export default function PointForm({ point }: { point: Point | null }) {
    const editing = Boolean(point);
    const form = useForm({
        name: point?.name ?? '',
        address: point?.address ?? '',
        reference: point?.reference ?? '',
        is_active: point?.is_active ?? true,
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        if (editing) {
            form.put(`/admin/pontos/${point!.id}`);
        } else {
            form.post('/admin/pontos');
        }
    };

    return (
        <AdminLayout title={editing ? 'Editar ponto' : 'Novo ponto'}>
            <Head title={editing ? 'Editar ponto' : 'Novo ponto'} />

            <div className="mx-auto max-w-xl">
                <Card className="p-6">
                    <form onSubmit={submit} className="space-y-4">
                        <Field label="Nome do ponto" required error={form.errors.name}>
                            <Input
                                value={form.data.name}
                                onChange={(e) => form.setData('name', e.target.value)}
                                placeholder="Ex.: Praça Central"
                                autoFocus
                            />
                        </Field>
                        <Field label="Endereço" error={form.errors.address}>
                            <Input value={form.data.address} onChange={(e) => form.setData('address', e.target.value)} />
                        </Field>
                        <Field label="Ponto de referência" error={form.errors.reference}>
                            <Input
                                value={form.data.reference}
                                onChange={(e) => form.setData('reference', e.target.value)}
                                placeholder="Ex.: em frente ao coreto"
                            />
                        </Field>
                        <label className="flex items-center gap-2 text-sm text-stone-700">
                            <input
                                type="checkbox"
                                className="accent-brand-600"
                                checked={form.data.is_active}
                                onChange={(e) => form.setData('is_active', e.target.checked)}
                            />
                            Ponto ativo (disponível para novos ciclos)
                        </label>
                        <div className="flex justify-end gap-3 pt-2">
                            <ButtonLink href="/admin/pontos" variant="outline">
                                Cancelar
                            </ButtonLink>
                            <Button type="submit" disabled={form.processing}>
                                {editing ? 'Salvar' : 'Criar'}
                            </Button>
                        </div>
                    </form>
                </Card>
            </div>
        </AdminLayout>
    );
}
