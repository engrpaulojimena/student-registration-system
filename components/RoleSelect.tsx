"use client";

import { useRef } from "react";

export default function RoleSelect({
  userId,
  email,
  currentRole,
  action,
}: {
  userId: number;
  email: string;
  currentRole: string;
  action: (formData: FormData) => void;
}) {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form ref={formRef} action={action} className="flex items-center gap-2">
      <input type="hidden" name="user_id" value={userId} />
      <input type="hidden" name="email" value={email} />
      <select
        name="role"
        defaultValue={currentRole}
        className="text-xs px-2 py-1.5 rounded-lg outline-none"
        style={{
          background: "var(--bg-glass)",
          border: "1px solid var(--border-glass)",
          color: "var(--text-secondary)",
        }}
        onChange={() => formRef.current?.requestSubmit()}
      >
        <option value="user">user</option>
        <option value="admin">admin</option>
      </select>
    </form>
  );
}
