export interface WorkshopStage {
  id: string;
  label: string;
  description: string;
  summary: string;
  statuses: string[];
}

export const WORKSHOP_WORKFLOW_STAGE_IDS = [
  'diagnosis',
  'waiting_acc',
  'in_progress',
  'ready',
] as const;

export type WorkshopWorkflowStageId = (typeof WORKSHOP_WORKFLOW_STAGE_IDS)[number];

export const WORKSHOP_STAGES: WorkshopStage[] = [
  { id: 'all', label: 'Semua Order', description: 'Semua order aktif dan riwayat.', summary: 'Tinjau seluruh order bengkel.', statuses: [] },
  { id: 'diagnosis', label: 'Diagnosa', description: 'Mulai pemeriksaan, catat temuan, lalu kirim hasil dan estimasi kepada pelanggan.', summary: 'Periksa unit dan susun estimasi servis.', statuses: ['QUEUED', 'INSPECTING', 'INSPECTED'] },
  { id: 'waiting_acc', label: 'Menunggu ACC', description: 'Tunggu konfirmasi WhatsApp, lalu catat item yang disetujui pelanggan.', summary: 'Catat persetujuan pelanggan dari WhatsApp.', statuses: ['PENDING_ACC', 'WAITING_ACC'] },
  { id: 'in_progress', label: 'Sedang Dikerjakan', description: 'Kerjakan servis sesuai hasil ACC. Setelah selesai, siapkan pesan WhatsApp untuk pelanggan.', summary: 'Kerjakan item yang telah disetujui.', statuses: ['IN_PROGRESS'] },
  { id: 'ready', label: 'Menunggu Pembayaran', description: 'Pengerjaan selesai. Siapkan pesan WhatsApp dan lanjutkan order ke tahap pembayaran.', summary: 'Kirim kabar selesai, lalu tunggu pembayaran.', statuses: ['READY_FOR_PICKUP', 'READY'] },
  { id: 'history', label: 'Riwayat', description: 'Order selesai atau dibatalkan.', summary: 'Lihat order yang telah ditutup.', statuses: ['COMPLETED', 'CANCELLED'] },
];

export const getWorkshopStage = (stageId: string | null | undefined): WorkshopStage => {
  const resolvedStageId = stageId === 'queued' ? 'diagnosis' : stageId;
  return WORKSHOP_STAGES.find((stage) => stage.id === resolvedStageId) ?? WORKSHOP_STAGES[0];
};

export const getWorkshopWorkflowStageId = (status: string): WorkshopWorkflowStageId => {
  if (status === 'COMPLETED') return 'ready';
  if (status === 'CANCELLED') return 'waiting_acc';

  const stage = WORKSHOP_STAGES.find(
    (candidate) =>
      WORKSHOP_WORKFLOW_STAGE_IDS.some((stageId) => stageId === candidate.id) &&
      candidate.statuses.includes(status)
  );

  return WORKSHOP_WORKFLOW_STAGE_IDS.find((stageId) => stageId === stage?.id) ?? 'diagnosis';
};

export const getWorkshopWorkflowStageIdFromQuery = (
  stageId: string | null
): WorkshopWorkflowStageId | undefined =>
  WORKSHOP_WORKFLOW_STAGE_IDS.find((workflowStageId) => workflowStageId === stageId);

export const getWorkshopStatusLabel = (status: string): string => {
  switch (status) {
    case 'QUEUED':
      return 'Menunggu Diagnosa';
    case 'INSPECTING':
      return 'Sedang Diagnosa';
    case 'INSPECTED':
      return 'Diagnosa Selesai';
    case 'PENDING_ACC':
    case 'WAITING_ACC':
      return 'Menunggu ACC';
    case 'IN_PROGRESS':
      return 'Sedang Dikerjakan';
    case 'READY_FOR_PICKUP':
    case 'READY':
      return 'Menunggu Pembayaran';
    case 'COMPLETED':
      return 'Selesai';
    case 'CANCELLED':
      return 'Dibatalkan';
    default:
      return status;
  }
};

export const getWorkshopActionLabel = (status: string): string => {
  switch (status) {
    case 'QUEUED':
      return 'Mulai Diagnosa';
    case 'INSPECTING':
    case 'INSPECTED':
      return 'Lanjut Diagnosa';
    case 'PENDING_ACC':
    case 'WAITING_ACC':
      return 'Proses ACC';
    case 'IN_PROGRESS':
      return 'Lihat Pengerjaan';
    case 'READY_FOR_PICKUP':
    case 'READY':
      return 'Proses Pembayaran';
    case 'COMPLETED':
    case 'CANCELLED':
      return 'Lihat Riwayat';
    default:
      return 'Lihat Detail';
  }
};
