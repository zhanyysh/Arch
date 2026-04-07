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
            action={action}
            className="panel modal-card"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="users-title-row" style={{ marginBottom: "0.4rem" }}>
              <h3>Create stage</h3>
              <button type="button" className="btn btn-ghost" onClick={() => setOpen(false)}>
                Close
              </button>
            </div>

            <div className="modal-form-vertical" style={{ marginTop: "0.7rem" }}>
              <input name="projectId" type="hidden" value={projectId} />
              <input name="title" placeholder="Stage title" required />
              <input name="order" type="number" min={1} defaultValue={nextOrder} required />
              <input name="startsAt" type="date" required />
              <input name="dueAt" type="date" required />
              <button className="btn btn-primary" type="submit">
                Create
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </>
  );
}
