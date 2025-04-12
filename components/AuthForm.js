// components/AuthForm.js

"use client";
import React, { useState } from "react";
import { loginUser, registerUser } from "@/firebase/users";

export default function AuthForm({ selectedForest, onAuthenticated, isSignup }) {
  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      if (isSignup) {
        if (formData.password !== formData.confirmPassword) {
          return setError("Passwords do not match");
        }
        const user = await registerUser({
          name: formData.name,
          surname: formData.surname,
          email: formData.email,
          password: formData.password,
          forestName: selectedForest,
        });
        onAuthenticated(user);
      } else {
        const user = await loginUser({
          email: formData.email,
          password: formData.password,
          forestName: selectedForest,
        });
        onAuthenticated(user);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f3f4f6",
        fontFamily: "Arial",
      }}
    >
      <h2 style={{ marginBottom: "20px" }}>
        {isSignup ? "Create Your Garden" : "Access Your Garden"}
      </h2>
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "12px", width: "260px" }}
      >
        {isSignup && (
          <>
            <input
              type="text"
              name="name"
              placeholder="Name"
              value={formData.name}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="surname"
              placeholder="Surname"
              value={formData.surname}
              onChange={handleChange}
              required
            />
          </>
        )}
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        {isSignup && (
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
        )}
        <button
          type="submit"
          style={{ padding: "10px", backgroundColor: "#4caf50", color: "white", border: "none", borderRadius: "6px" }}
        >
          {isSignup ? "Register & Claim Garden" : "Login to Garden"}
        </button>
        {error && <p style={{ color: "red" }}>{error}</p>}
      </form>
    </div>
  );
}
