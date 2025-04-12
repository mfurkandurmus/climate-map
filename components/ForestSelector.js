// components/ForestSelector.js

"use client";
import React, { useEffect, useState } from "react";
import { fetchAllForests, createForest } from "@/firebase/firestoreHelpers";

export default function ForestSelector({ onForestSelected }) {
  const [availableForests, setAvailableForests] = useState([]);
  const [newForestName, setNewForestName] = useState("");
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const loadForests = async () => {
      try {
        const forests = await fetchAllForests();
        setAvailableForests(forests);
      } catch (err) {
        console.error("Failed to fetch forests", err);
      }
    };
    loadForests();
  }, []);

  const handleCreateForest = async () => {
    if (!newForestName.trim()) {
      setError("Please enter a forest name");
      return;
    }

    setCreating(true);
    try {
      await createForest(newForestName.trim());
      onForestSelected(newForestName.trim());
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div
      style={{
        height: "100vh",
        backgroundColor: "#f4f8f2",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Arial",
      }}
    >
      <h2 style={{ marginBottom: "16px", fontSize: "1.6rem", color: "#2c3e50" }}>
        Select or Create Your Forest
      </h2>

      <select
        value=""
        onChange={(e) => onForestSelected(e.target.value)}
        style={{
          padding: "10px",
          fontSize: "1rem",
          marginBottom: "20px",
          borderRadius: "6px",
          border: "1px solid #ccc",
          width: "260px",
        }}
      >
        <option value="">-- Select Forest --</option>
        {availableForests.map((forest) => (
          <option key={forest.id} value={forest.name}>
            {forest.name}
          </option>
        ))}
      </select>

      <input
        type="text"
        placeholder="New Forest Name"
        value={newForestName}
        onChange={(e) => setNewForestName(e.target.value)}
        style={{
          padding: "10px",
          fontSize: "1rem",
          marginBottom: "10px",
          borderRadius: "6px",
          border: "1px solid #ccc",
          width: "260px",
        }}
      />
      <button
        onClick={handleCreateForest}
        disabled={creating}
        style={{
          padding: "10px 20px",
          fontSize: "1rem",
          backgroundColor: "#27ae60",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
        }}
      >
        {creating ? "Creating..." : "Create Forest"}
      </button>
      {error && <p style={{ color: "red", marginTop: "10px" }}>{error}</p>}
    </div>
  );
}
