import { CustomerAPI } from './api';

export interface CustomerOrderItem {
  id: number;
  item_name: string;
  item_type: string;
  price: string | number;
  quantity: number;
  subtotal?: string | number;
}

export interface CustomerServiceOrder {
  id: number;
  order_code: string;
  plate_number: string;
  status: string;
  initial_complaint: string;
  inspection_notes?: string | null;
  additional_notes?: string | null;
  current_mileage_km?: number | null;
  total_amount: string | number;
  estimated_completion_date?: string | null;
  created_at: string;
  updated_at: string;
  vehicle?: { brand_model: string };
  items: CustomerOrderItem[];
}

export async function fetchActiveService(): Promise<CustomerServiceOrder | null> {
  const response = await CustomerAPI.get<{
    has_active_service: boolean;
    order?: CustomerServiceOrder;
  }>('/customer/active-service');

  return response.data.has_active_service ? response.data.order ?? null : null;
}

export async function fetchServiceHistory(): Promise<CustomerServiceOrder[]> {
  const response = await CustomerAPI.get<{ history: CustomerServiceOrder[] }>('/customer/history');
  return response.data.history;
}

export function getServiceStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    QUEUED: 'Menunggu pemeriksaan',
    INSPECTING: 'Sedang diperiksa',
    INSPECTED: 'Pemeriksaan selesai',
    PENDING_ACC: 'Menunggu konfirmasi WhatsApp',
    WAITING_ACC: 'Menunggu konfirmasi WhatsApp',
    IN_PROGRESS: 'Sedang dikerjakan',
    READY_FOR_PICKUP: 'Siap diambil',
    READY: 'Siap diambil',
    COMPLETED: 'Selesai',
    CANCELLED: 'Dibatalkan',
  };

  return labels[status] ?? status;
}
