"use client";

import { useState } from "react";

export default function CreateStageModal({
  projectId,
  nextOrder,
  action
}: {
  projectId: string;
  nextOrder: number;
  action: (formData: FormData) => void | Promise<void>;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" className="btn btn-primary" onClick={() => setOpen(true)}>
        Create
      </button>

      {open ? (
        <div className="modal-layer" onClick={() => setOpen(false)}>
          <form
            action={async (formData) => {
              await action(formData);
              setOpen(false);
            }}
            className="panel modal-card"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="users-title-row" style={{ marginBottom: "0.4rem" }}>
              <h3>Create stage</h3>
              <button type="button" className="btn btn-ghost" onClick={() => setOpen(false)}>
                Close
              </button>
            </div>

            <div className="modal-form-vertical" style={{ marginTop: "0.7rem", gap: "1rem", display: "flex", flexDirection: "column" }}>
              <input name="projectId" type="hidden" value={projectId} />
              
              <label style={{ display: "flex", flexDirection: "column", gap: "0.4rem", fontWeight: 500, fontSize: "14px", color: "#374151" }}>
                Stage Title
                <input name="title" placeholder="e.g. Foundation" required style={{ fontWeight: "normal" }} />
              </label>

              <label style={{ display: "flex", flexDirection: "column", gap: "0.4rem", fontWeight: 500, fontSize: "14px", color: "#374151" }}>
                Order Number (Sequence)
                <input name="order" type="number" min={1} defaultValue={nextOrder} required style={{ fontWeight: "normal" }} />
              </label>

              <label style={{ display: "flex", flexDirection: "column", gap: "0.4rem", fontWeight: 500, fontSize: "14px", color: "#374151" }}>
                Start Date
                <input name="startsAt" type="date" required style={{ fontWeight: "normal" }} />
              </label>

              <label style={{ display: "flex", flexDirection: "column", gap: "0.4rem", fontWeight: 500, fontSize: "14px", color: "#374151" }}>
                Due Date
                <input name="dueAt" type="date" required style={{ fontWeight: "normal" }} />
              </label>

              <button className="btn btn-primary" type="submit" style={{ marginTop: "0.5rem" }}>
                Create
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </>
  );
}
