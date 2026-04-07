"use client";

import { useMemo, useState } from "react";

interface StageOption {
  id: string;
  title: string;
  order: number;
}

interface WorkerOption {
  id: string;
  fullName: string;
}

export default function CreateTaskModal({
  projectId,
  stages,
  workers,
  action
}: {
  projectId: string;
  stages: StageOption[];
  workers: WorkerOption[];
  action: (formData: FormData) => void | Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const hasData = stages.length > 0 && workers.length > 0;

  return (
    <>
      <button
        type="button"
        className="btn btn-primary"
        onClick={() => {
          if (!hasData) {
            alert("You must create at least one stage and have at least one active worker available in your company before creating a task.");
            return;
          }
          setOpen(true);
        }}
      >
        Create task
      </button>

      {open ? (
        <div className="modal-layer" onClick={() => setOpen(false)}>
          <form
            action={action}
            className="panel modal-card"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="users-title-row" style={{ marginBottom: "0.4rem" }}>
              <h3>Create task</h3>
              <button type="button" className="btn btn-ghost" onClick={() => setOpen(false)}>
                Close
              </button>
            </div>

            <div className="modal-form-vertical" style={{ marginTop: "0.7rem" }}>
              <input type="hidden" name="projectId" value={projectId} />

              <label>
                Task title
                <input name="title" placeholder="e.g. Install facade panels" required />
              </label>

              <label>
                Stage
                <select name="stageId" required defaultValue={stages[0]?.id}>
                  {stages.map((stage) => (
                    <option key={stage.id} value={stage.id}>
                      #{stage.order} {stage.title}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Worker
                <select name="workerId" required defaultValue={workers[0]?.id}>
                  {workers.map((worker) => (
                    <option key={worker.id} value={worker.id}>
                      {worker.fullName}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                "Before" Photos (Optional references for worker)
                <input type="file" name="beforePhotos" accept="image/*" multiple />
              </label>

              <label style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", marginTop: "0.2rem" }}>
                <input type="checkbox" name="requiresAfterPhoto" defaultChecked style={{ width: "auto" }} />
                Require after-photo to complete task
              </label>

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
