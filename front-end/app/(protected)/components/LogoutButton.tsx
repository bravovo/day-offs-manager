"use client";

import { useFormStatus } from "react-dom";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      className="cursor-pointer text-md font-bold bg-red-900 rounded-xl px-2 py-2 w-30
       hover:bg-red-800 transition-colors duration-200 disabled:cursor-wait disabled:opacity-70"
      disabled={pending}
      type="submit"
    >
      {pending ? "Вихід..." : "Вийти"}
    </button>
  );
}

export default SubmitButton;
