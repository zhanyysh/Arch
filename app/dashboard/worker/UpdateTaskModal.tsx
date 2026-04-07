"use client";

import { useState } from "react";

interface WorkerTaskOption {
  id: string;
  title: string;
  status: string;
  requiresAfterPhoto: boolean;
  stageTitle: string;
  projectTitle: string;
}

export default function UpdateTaskModal({
  task,
  action
}: {
  task: WorkerTaskOption;
  action: (formData: FormData) => void | Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [statusVal, setStatusVal] = useState(task.status);
  const requirePhoto = task.requiresAfterPhoto && ((statusVal === "review" || statusVal === "done") && task.status !== "review" && task.status !== "done");

  return (
    <>
      <button className="btn btn-ghost" type="button" onClick={() => setOpen(true)}>
        Update status
      </button>

      {open ? (
        <div className="modal-layer" onClick={() => setOpen(false)}>
          <form
            action={async (fd) => {
              await action(fd);
              setOpen(false);
            }}
            className="panel modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="users-title-row" style={{ marginBottom: "0.4rem" }}>
              <h3>Update Task Status</h3>
              <button type="button" className="btn btn-ghost" onClick={() => setOpen(false)}>
                Close
              </button>
            </div>
            
            <p style={{ color: "#58697f", fontSize: "0.9rem", marginBottom: "1rem" }}>
              {task.projectTitle} &gt; {task.stageTitle}
              <br/>
              <strong>{task.title}</strong>
            </p>

            <div className="modal-form-vertical">
              <input type="hidden" name="taskId" value={task.id} />
              
              <label>
                Status
                <select name="status" value={statusVal} onChange={(e) => setStatusVal(e.target.value)}>
                  <option value="new">New</option>
                  <option value="in_progress">In Progress</option>
                  <option value="review">Review</option>
                  <option value="done" disabled>Done (by Manager/Foreman only)</option>
                  <option value="rework" disabled>Rework (Supervisor sets this)</option>
                </select>
              </label>

              {requirePhoto ? (
                <>
                  <label>
                    Upload After-Photo (Required for Review)
                    <input type="file" name="photo" accept="image/*" required={requirePhoto} />
                  </label>
                  <p style={{color: "var(--color-primary)", fontSize: "0.85rem", marginTop: "-0.5rem"}}>
                    A simulated image will be uploaded automatically on submission.
                  </p>
                </>
              ) : null}

              <button className="btn btn-primary" type="submit" style={{ marginTop: "1rem" }}>
                Save Changes
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </>
  );
}