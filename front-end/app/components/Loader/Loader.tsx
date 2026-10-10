import { SyncLoader } from "react-spinners";

export const Loader = () => {
  return (
    <div className="w-dvh h-dvh overflow-hidden absolute flex justify-center items-center">
      <SyncLoader color="#022f2e" />
    </div>
  );
};
