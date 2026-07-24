export interface AuthUser {
    id: number;
    name: string;
    email: string;
    role: string;
    is_admin: boolean;
}

export interface SharedProps {
    appName: string;
    auth: { user: AuthUser | null };
    flash: { success?: string | null; error?: string | null };
    [key: string]: unknown;
}

export interface CycleSummary {
    id: number;
    title: string | null;
    status: string;
    status_label: string;
    delivery_date: string;
    order_opens_at: string;
    order_closes_at: string;
    is_ordering_open: boolean;
}

export interface CyclePoint {
    id: number;
    name: string;
    address: string | null;
    reference: string | null;
    scheduled_at: string | null;
    capacity: number | null;
    notes: string | null;
}

export interface CatalogProduct {
    cycle_product_id: number;
    product_id: number;
    name: string;
    slug: string;
    description: string | null;
    category: string | null;
    unit: string;
    unit_label: string;
    price: number;
    quantity_available: number;
    remaining: number;
    step: number;
    allows_fraction: boolean;
    image_url: string | null;
}

export interface CatalogGroup {
    category: string;
    products: CatalogProduct[];
}

export interface CartLine {
    cycle_product_id: number;
    quantity: number;
}

export interface ReservationItemView {
    product_name: string;
    unit?: string;
    unit_label: string;
    quantity: number;
    unit_price?: number;
    line_total: number;
}

export interface ReservationView {
    id: number;
    confirmation_code: string;
    status: string;
    status_label: string;
    customer_name: string;
    is_guest: boolean;
    guest_phone?: string | null;
    delivery_point_name: string;
    scheduled_at: string | null;
    delivery_date: string;
    total_amount: number;
    notes: string | null;
    items: ReservationItemView[];
}
