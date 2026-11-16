import { Request } from "@/types/types";
import { formatDateInput } from "@/utils/utils";

export interface ReviewRequestDialogProps {
  open: boolean;
  action: ((formData: FormData) => void) | undefined;
  isPending: boolean;
  onClose: () => void;
  canReviewRequest: boolean;
  request: Request;
}

export default function ReviewRequestDialog({
  open,
  action,
  isPending,
  onClose,
  canReviewRequest,
  request,
}: ReviewRequestDialogProps) {
  if (!open || !canReviewRequest) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-gray-500/80 p-1.5 md:p-4"
      onClick={onClose}
    >
      <form
        action={action}
        className="w-full md:w-md min-w-0 max-h-[calc(100vh-2rem)] overflow-y-auto flex flex-col gap-2 border-none rounded-2xl bg-white text-zinc-950"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="w-full min-w-0 px-4 md:px-7 py-4 flex flex-col gap-2">
          <input type="hidden" name="requestId" value={request._id} />
          <input type="hidden" name="teamId" value={request.teamId ?? ""} />
          <div className="flex flex-row gap-2">
            <span className="shrink-0 w-fit rounded-full bg-blue-600 px-2 py-0.5 text-xs text-white">
              {request.type === "day" ? "Вихідний (відпустка)" : "Лікарняний"}
            </span>
            {request.halfDay && (
              <span className="shrink-0 w-fit rounded-full bg-teal-700 px-2 py-0.5 text-xs text-white">
                Половина дня
              </span>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <label className="min-w-0 flex flex-col gap-1">
              Дата початку
              <input
                readOnly
                type="date"
                name="startDate"
                disabled
                required
                value={formatDateInput(new Date(request.startDate))}
                className="w-full border border-zinc-400 focus:border-teal-950 rounded-md outline-none p-2"
              />
            </label>
            <label className="min-w-0 flex flex-col gap-1">
              Дата кінця
              <input
                readOnly
                disabled
                type="date"
                name="endDate"
                required
                value={formatDateInput(new Date(request.endDate))}
                className="w-full border border-zinc-400 focus:border-teal-950 rounded-md outline-none p-2"
              />
            </label>
          </div>
          <label className="flex flex-col gap-1">
            Опис
            <textarea
              readOnly
              disabled
              name="description"
              value={request.description}
              className="w-full border border-zinc-400 focus:border-teal-950 rounded-md outline-none p-2"
            />
          </label>

          <div className="flex flex-row justify-between">
            <button
              type="button"
              className="mt-2 h-10 border-none bg-teal-950 hover:bg-teal-800 text-white rounded-xl 
                  px-3 py-1 transition-all cursor-pointer duration-500"
              disabled={isPending}
              onClick={onClose}
            >
              Закрити
            </button>
            <div className="flex flex-row gap-2">
              <button
                type="submit"
                name="decision"
                value="rejected"
                className="mt-2 h-10 border-none bg-red-500 hover:bg-red-700 text-white rounded-xl 
                  px-3 py-1 transition-all cursor-pointer duration-500"
                disabled={isPending}
              >
                {isPending ? "Відхилення..." : "Відхилити"}
              </button>
              <button
                type="submit"
                name="decision"
                value="approved"
                className="mt-2 h-10 border-none bg-green-700 hover:bg-green-900 text-white rounded-xl 
                  px-3 py-1 transition-all cursor-pointer duration-500"
                disabled={isPending}
              >
                {isPending ? "Погодження..." : "Погодити"}
              </button>
            </div>
          </div>
          {/* {showCreateErrors &&
            createState.error &&
            typeof createState.error === "string" && (
              <p className="font-bold text-red-600">{createState.error}</p>
            )} */}
        </div>
      </form>
    </div>
  );
}
