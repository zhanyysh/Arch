"use client";

import { useState } from "react";
import Image from "next/image";
import { approveTaskAction, rejectTaskAction } from "./actions";

export default function ForemanTaskReview({ tasks }: { tasks: any[] }) {
  const [rejecting, setRejecting] = useState<string | null>(null);
  
  if (tasks.length === 0) {
    return (
      <div className="card-panel" style={{ marginTop: "2rem" }}>
        <h3>Tasks Awaiting Review</h3>
        <p>No tasks are currently waiting for your review.</p>
      </div>
    );
  }

  return (
    <div style={{ marginTop: "2rem" }}>
      <h3 style={{ marginBottom: "1rem" }}>Tasks Awaiting Review</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {tasks.map(task => {
          const beforePhotos = task.photos.filter((p: any) => p.kind === 'before');
          const afterPhotos = task.photos.filter((p: any) => p.kind === 'after');

          return (
            <div key={task.id} className="card-panel">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <h4 style={{ margin: "0 0 0.5rem 0" }}>{task.title}</h4>
                  <div style={{ display: "flex", gap: "1rem", fontSize: "0.85rem", color: "#58697f" }}>
                    <span>Project: {task.project.title}</span>
                    <span>Stage: {task.stage.title}</span>
                    <span>Worker: {task.worker.fullName}</span>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button 
                    className="btn btn-primary"
                    onClick={async () => await approveTaskAction(task.id)}
                  >
                    Approve
                  </button>
                  <button 
                    className="btn btn-ghost" 
                    style={{ color: "red" }}
                    onClick={() => setRejecting(task.id)}
                  >
                    Reject
                  </button>
                </div>
              </div>

              {rejecting === task.id && (
                <div style={{ marginTop: "1rem", padding: "1rem", backgroundColor: "#fff5f5", borderRadius: "8px" }}>
                  <form action={async (formData) => {
                    const reason = formData.get("reason") as string;
                    await rejectTaskAction(task.id, reason);
                    setRejecting(null);
                  }}>
                    <label style={{ display: "block", marginBottom: "0.5rem" }}>
                      Reason for rejection (will be sent to worker):
                      <input name="reason" required placeholder="E.g. Incomplete finish on edges" />
                    </label>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <button className="btn btn-primary" type="submit">Submit Rejection</button>
                      <button className="btn btn-ghost" type="button" onClick={() => setRejecting(null)}>Cancel</button>
                    </div>
                  </form>
                </div>
              )}

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginTop: "1.5rem" }}>
                <div>
                  <h5 style={{ marginBottom: "0.5rem", color: "#58697f" }}>Before (Reference)</h5>
                  <div style={{ display: "flex", gap: "0.5rem", overflowX: "auto", paddingBottom: "0.5rem" }}>
                    {beforePhotos.length > 0 ? (
                      beforePhotos.map((photo: any) => (
                        <div key={photo.id} style={{ position: "relative", width: "300px", height: "300px", flexShrink: 0 }}>
                          <a href={photo.url} target="_blank" rel="noopener noreferrer">
                            <img src={photo.url} alt="Before" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "8px", border: "1px solid #e2e8f0" }} />
                          </a>
                        </div>
                      ))
                    ) : (
                      <div style={{ padding: "2rem", backgroundColor: "#f9fbfd", borderRadius: "8px", width: "100%", textAlign: "center", color: "#92a0b3" }}>
                        No reference photos
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <h5 style={{ marginBottom: "0.5rem", color: "#58697f" }}>After (Result)</h5>
                  <div style={{ display: "flex", gap: "0.5rem", overflowX: "auto", paddingBottom: "0.5rem" }}>
                    {afterPhotos.length > 0 ? (
                      afterPhotos.map((photo: any) => (
                        <div key={photo.id} style={{ position: "relative", width: "300px", height: "300px", flexShrink: 0 }}>
                          <a href={photo.url} target="_blank" rel="noopener noreferrer">
                            <img src={photo.url} alt="After" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "8px", border: "1px solid #e2e8f0" }} />
                          </a>
                        </div>
                      ))
                    ) : (
                      <div style={{ padding: "2rem", backgroundColor: "#f9fbfd", borderRadius: "8px", width: "100%", textAlign: "center", color: "#92a0b3" }}>
                        No result photos
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}