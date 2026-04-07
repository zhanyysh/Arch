"use client";

import { useState } from "react";

interface ForemanOption {
  id: string;
  fullName: string;
}

export default function CreateProjectModal({
  foremen,
  action
}: {
  foremen: ForemanOption[];
  action: (formData: FormData) => void | Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const hasForemen = foremen && foremen.length > 0;

  return (
    <>
      <button 
        type="button" 
        className="btn btn-primary" 
        onClick={() => setOpen(true)}
        disabled={!hasForemen}
        title={!hasForemen ? "Require at least one foreman to create a project" : undefined}
      >
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
              <h3>Create project</h3>
              <button type="button" className="btn btn-ghost" onClick={() => setOpen(false)}>
                Close
              </button>
            </div>

            <div className="modal-form-vertical" style={{ marginTop: "0.7rem" }}>
              <input className="users-filter-input" name="title" placeholder="Title" required />
              <input className="users-filter-input" name="description" placeholder="Description" required />
              <select id="project-foreman" name="foremanId" required defaultValue={foremen[0]?.id}>
                {foremen.map((foreman) => (
                  <option key={foreman.id} value={foreman.id}>
                    {foreman.fullName}
                  </option>
                ))}
              </select>
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
