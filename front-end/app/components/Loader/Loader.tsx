import { SyncLoader } from "react-spinners";

export const Loader = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden">
      <SyncLoader color="#022f2e" />
    </div>
  );
};
