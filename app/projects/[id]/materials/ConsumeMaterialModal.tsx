"use client";

import { useState } from "react";

export default function ConsumeMaterialModal({
  projectId,
  materialId,
  name,
  maxQuantity,
  unit,
  action
}: {
  projectId: string;
  materialId: string;
  name: string;
  maxQuantity: number;
  unit: string;
  action: (formData: FormData) => void | Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");

  if (maxQuantity <= 0) return null;

  return (
    <>
      <button type="button" className="btn btn-ghost" style={{ padding: "0.3rem 0.6rem", fontSize: "0.8rem", color: "#166534" }} onClick={() => setOpen(true)}>
        Log Usage
      </button>

      {open ? (
        <div className="modal-layer" onClick={() => setOpen(false)}>
          <form
            action={async (formData) => {
              const amount = parseFloat(String(formData.get("amountToUse") || 0));
              if (amount > maxQuantity) {
                setError(`You cannot use more than the available quantity (${maxQuantity}).`);
                return;
              }
              await action(formData);
              setOpen(false);
            }}
            className="panel modal-card"
            style={{ maxWidth: "400px" }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="users-title-row" style={{ marginBottom: "0.4rem" }}>
              <h3>Log Material Usage</h3>
              <button type="button" className="btn btn-ghost" onClick={() => setOpen(false)}>
                Close
              </button>
            </div>

            <p style={{ fontSize: "0.875rem", color: "#64748b", margin: "0.5rem 0 1rem 0" }}>
              How much <strong>{name}</strong> was used?
            </p>

            <div className="modal-form-vertical" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <input name="projectId" type="hidden" value={projectId} />
              <input name="materialId" type="hidden" value={materialId} />
              
              <label style={{ display: "flex", flexDirection: "column", gap: "0.4rem", fontWeight: 500, fontSize: "14px", color: "#374151" }}>
                Quantity Used (Available: {maxQuantity} {unit})
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <input name="amountToUse" type="number" step="0.01" min="0.01" max={maxQuantity} placeholder="e.g. 10.5" required style={{ fontWeight: "normal", flex: 1 }} />
                  <span style={{ fontSize: "0.875rem", color: "#64748b" }}>{unit}</span>
                </div>
              </label>

              {error && <p style={{ fontSize: "0.875rem", color: "#dc2626", margin: 0 }}>{error}</p>}

              <button className="btn btn-primary" type="submit" style={{ marginTop: "0.5rem" }}>
                Deduct from Inventory
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </>
  );
}