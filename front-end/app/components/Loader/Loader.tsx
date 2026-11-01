import { SyncLoader } from "react-spinners";

export const Loader = () => {
  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center overflow-hidden bg-gray-300/80">
      <SyncLoader color="#022f2e" />
    </div>
  );
};
