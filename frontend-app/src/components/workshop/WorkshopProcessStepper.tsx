import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Eye } from 'lucide-react';
import {
  getWorkshopStage,
  WORKSHOP_WORKFLOW_STAGE_IDS,
} from './workshopStages';
import type { WorkshopWorkflowStageId } from './workshopStages';

interface WorkshopProcessStepperProps {
  orderId: number | string;
  currentStage: WorkshopWorkflowStageId;
  viewedStage?: WorkshopWorkflowStageId;
  isCompleted?: boolean;
  isCancelled?: boolean;
  returnStage?: string;
}

export const WorkshopProcessStepper: React.FC<WorkshopProcessStepperProps> = ({
  orderId,
  currentStage,
  viewedStage,
  isCompleted = false,
  isCancelled = false,
  returnStage,
}) => {
  const navigate = useNavigate();
  const currentIndex = isCompleted
    ? WORKSHOP_WORKFLOW_STAGE_IDS.length
    : isCancelled
      ? WORKSHOP_WORKFLOW_STAGE_IDS.indexOf(currentStage) + 1
      : WORKSHOP_WORKFLOW_STAGE_IDS.indexOf(currentStage);
  const isTerminal = isCompleted || isCancelled;
  const currentStageLabel = isCompleted
    ? 'Selesai'
    : isCancelled
      ? 'Dibatalkan'
      : getWorkshopStage(currentStage).label;

  const openPreviousStage = (stageId: WorkshopWorkflowStageId) => {
    const query = `stage=${returnStage || currentStage}&viewStage=${stageId}`;
    const orderPath = `/admin/workshop/${orderId}`;

    switch (stageId) {
      case 'waiting_acc':
        navigate(`${orderPath}/approval?${query}`);
        break;
      case 'ready':
        navigate(`${orderPath}/payment?${query}`);
        break;
      case 'diagnosis':
      case 'in_progress':
        navigate(`${orderPath}?${query}`);
        break;
    }
  };

  return (
    <section className="space-y-3 rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xs">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xs font-black uppercase tracking-wide text-slate-800">Alur Proses Servis</h2>
        <span className="text-[10px] font-semibold text-slate-500">
          Tahap aktual: {currentStageLabel}
        </span>
      </div>

      <div className="flex items-start">
        {WORKSHOP_WORKFLOW_STAGE_IDS.map((stageId, index) => {
          const stage = getWorkshopStage(stageId);
          const isCurrent = !isTerminal && stageId === currentStage;
          const isPrevious = index < currentIndex;
          const isViewed = stageId === viewedStage && (isTerminal || !isCurrent);

          return (
            <React.Fragment key={stageId}>
              <button
                type="button"
                disabled={!isPrevious}
                onClick={() => openPreviousStage(stageId)}
                aria-current={isCurrent ? 'step' : undefined}
                aria-label={`${isPrevious ? 'Lihat' : 'Tahap'} ${stage.label}${isViewed ? ', sedang dilihat' : ''}`}
                className="group flex min-w-0 flex-1 flex-col items-center gap-1.5 text-center disabled:cursor-default enabled:cursor-pointer"
              >
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-full border text-xs font-black transition ${
                    isCurrent
                      ? 'border-red-600 bg-red-600 text-white shadow-sm shadow-red-600/25'
                      : isPrevious
                        ? `border-emerald-600 bg-emerald-600 text-white ${
                            isViewed ? 'ring-2 ring-blue-400 ring-offset-2' : 'group-hover:bg-emerald-700'
                          }`
                        : 'border-slate-200 bg-slate-100 text-slate-400'
                  }`}
                >
                  {isPrevious ? <Check className="h-4 w-4" /> : index + 1}
                </span>
                <span
                  className={`text-[9px] font-bold leading-tight sm:text-[10px] ${
                    isCurrent
                      ? 'text-red-700'
                      : isPrevious
                        ? 'text-emerald-800 group-hover:text-emerald-950'
                        : 'text-slate-400'
                  }`}
                >
                  {stage.label}
                </span>
                {isViewed && (
                  <span className="text-[8px] font-bold uppercase tracking-wide text-blue-600">Dilihat</span>
                )}
              </button>

              {index < WORKSHOP_WORKFLOW_STAGE_IDS.length - 1 && (
                <span
                  aria-hidden="true"
                  className={`mt-4 h-0.5 flex-1 ${
                    index < currentIndex ? 'bg-emerald-500' : 'bg-slate-200'
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {viewedStage && (viewedStage !== currentStage || isTerminal) && (
        <div className="flex items-start gap-2 rounded-xl border border-blue-100 bg-blue-50/80 px-3 py-2 text-[10px] leading-relaxed text-blue-900">
          <Eye className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <p>
            Sedang melihat tahap {getWorkshopStage(viewedStage).label}. Ini hanya tampilan baca-saja; status order
            tetap {currentStageLabel}.
          </p>
        </div>
      )}
    </section>
  );
};
