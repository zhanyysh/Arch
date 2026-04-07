"use client";

import { useState } from "react";

export default function CreateMaterialModal({
  projectId,
  action
}: {
  projectId: string;
  action: (formData: FormData) => void | Promise<void>;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" className="btn btn-primary" onClick={() => setOpen(true)}>
        Add Material
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
              <h3>Add Project Material</h3>
              <button type="button" className="btn btn-ghost" onClick={() => setOpen(false)}>
                Close
              </button>
            </div>

            <div className="modal-form-vertical" style={{ marginTop: "0.7rem", gap: "1rem", display: "flex", flexDirection: "column" }}>
              <input name="projectId" type="hidden" value={projectId} />
              
              <label style={{ display: "flex", flexDirection: "column", gap: "0.4rem", fontWeight: 500, fontSize: "14px", color: "#374151" }}>
                Name
                <input name="name" placeholder="e.g. Cement M500, Plywood, Nails..." required style={{ fontWeight: "normal" }} />
              </label>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <label style={{ display: "flex", flexDirection: "column", gap: "0.4rem", fontWeight: 500, fontSize: "14px", color: "#374151" }}>
                  Quantity
                  <input name="quantity" type="number" step="0.01" min="0.01" placeholder="e.g. 50" required style={{ fontWeight: "normal" }} />
                </label>

                <label style={{ display: "flex", flexDirection: "column", gap: "0.4rem", fontWeight: 500, fontSize: "14px", color: "#374151" }}>
                  Unit
                  <input name="unit" placeholder="e.g. kg, pieces, sheets" required style={{ fontWeight: "normal" }} />
                </label>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <label style={{ display: "flex", flexDirection: "column", gap: "0.4rem", fontWeight: 500, fontSize: "14px", color: "#374151" }}>
                  Cost / Price (Optional)
                  <input name="cost" type="number" step="0.01" min="0" placeholder="e.g. 15000" style={{ fontWeight: "normal" }} />
                </label>

                <label style={{ display: "flex", flexDirection: "column", gap: "0.4rem", fontWeight: 500, fontSize: "14px", color: "#374151" }}>
                  Supplier (Optional)
                  <input name="supplier" placeholder="e.g. Home Depot" style={{ fontWeight: "normal" }} />
                </label>
              </div>

              <button className="btn btn-primary" type="submit" style={{ marginTop: "0.5rem" }}>
                Add Material
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </>
  );
}