// components/TreePopup.js

"use client";
import React, { useState, useEffect } from "react";

export default function TreePopup({ row, col, onClose, onConfirm, mode = "add", existingData }) {
  const [occupation, setOccupation] = useState("");
  const [age, setAge] = useState("");

  useEffect(() => {
    if (mode === "remove" && existingData) {
      setOccupation(existingData.occupation || "");
      setAge(existingData.age || "");
    }
  }, [mode, existingData]);

  const handleConfirm = () => {
    if (mode === "add" && (!occupation || !age)) return;
    onConfirm({ row, col, occupation, age });
  };

  return (
    <div
      style={{
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        background: "white",
        padding: "20px",
        borderRadius: "12px",
        boxShadow: "0 2px 12px rgba(0,0,0,0.2)",
        zIndex: 9999,
        width: "320px",
        maxWidth: "90vw",
      }}
    >
      <h4 style={{ marginBottom: "10px" }}>
        {mode === "add" ? "🌳 Add a Tree" : "🗑️ Remove This Tree?"}
      </h4>

      <label style={{ fontSize: "17px", color: "#555" }}>
        Occupation of person presented to:
      </label>
      <input
        type="text"
        placeholder="e.g. Master Student at TUM, Engineer at BSH"
        value={occupation}
        readOnly={mode === "remove"}
        onChange={(e) => setOccupation(e.target.value)}
        style={{
          width: "95%",
          padding: "8px",
          marginBottom: "10px",
          border: "1px solid #ddd",
          borderRadius: "6px",
          backgroundColor: mode === "remove" ? "#f9f9f9" : "white"
        }}
      />

      <label style={{ fontSize: "17px", color: "#555" }}>
        Age of person presented to:
      </label>
      <input
        type="number"
        placeholder="e.g. 25"
        value={age}
        readOnly={mode === "remove"}
        onChange={(e) => setAge(e.target.value)}
        style={{
          width: "95%",
          padding: "8px",
          marginBottom: "10px",
          border: "1px solid #ddd",
          borderRadius: "6px",
          backgroundColor: mode === "remove" ? "#f9f9f9" : "white"
        }}
      />

      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <button
          onClick={onClose}
          style={{
            background: "#ccc",
            color: "#333",
            border: "none",
            padding: "8px 16px",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          Cancel
        </button>
        <button
          onClick={handleConfirm}
          style={{
            background: mode === "add" ? "#4CAF50" : "#e53935",
            color: "#fff",
            border: "none",
            padding: "8px 26px",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          {mode === "add" ? "Plant Tree" : "Yes, Remove"}
        </button>
      </div>
    </div>
  );
}
