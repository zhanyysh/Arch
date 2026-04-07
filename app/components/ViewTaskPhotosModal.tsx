"use client";

import { useState } from "react";

export default function ViewTaskPhotosModal({ photos, title }: { photos: any[], title: string }) {
  const [open, setOpen] = useState(false);
  
  const beforePhotos = photos.filter((p: any) => p.kind === 'before');
  const afterPhotos = photos.filter((p: any) => p.kind === 'after');

  if (photos.length === 0) return <span style={{color: "#92a0b3", fontSize: "0.85rem"}}>No photos</span>;

  return (
    <>
      <button className="btn btn-ghost" type="button" onClick={() => setOpen(true)} style={{ padding: "0.2rem 0.5rem" }}>
        View Photos ({photos.length})
      </button>

      {open && (
        <div className="modal-layer" onClick={() => setOpen(false)}>
          <div className="panel modal-card" onClick={(e) => e.stopPropagation()} style={{ minWidth: "60vw", maxWidth: "90vw" }}>
            <div className="users-title-row" style={{ marginBottom: "1rem" }}>
              <h3>Photos for "{title}"</h3>
              <button type="button" className="btn btn-ghost" onClick={() => setOpen(false)}>Close</button>
            </div>
            
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.5rem" }}>
              <div>
                <h5 style={{ marginBottom: "0.5rem", color: "#58697f" }}>Before (Reference)</h5>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                  {beforePhotos.length > 0 ? (
                    beforePhotos.map((photo: any) => (
                      <a href={photo.url} target="_blank" rel="noopener noreferrer" key={photo.id}>
                        <img src={photo.url} alt="Before" style={{ width: "300px", height: "300px", objectFit: "cover", borderRadius: "8px", border: "1px solid #e2e8f0" }} />
                      </a>
                    ))
                  ) : <span style={{ color: "#92a0b3" }}>None</span>}
                </div>
              </div>

              <div>
                <h5 style={{ marginBottom: "0.5rem", color: "#58697f" }}>After (Result)</h5>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                  {afterPhotos.length > 0 ? (
                    afterPhotos.map((photo: any) => (
                      <a href={photo.url} target="_blank" rel="noopener noreferrer" key={photo.id}>
                        <img src={photo.url} alt="After" style={{ width: "300px", height: "300px", objectFit: "cover", borderRadius: "8px", border: "1px solid #e2e8f0" }} />
                      </a>
                    ))
                  ) : <span style={{ color: "#92a0b3" }}>None</span>}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
