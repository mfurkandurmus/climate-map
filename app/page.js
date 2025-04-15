"use client";
import React, { useState, useEffect } from "react";
import ForestSelector from "@/components/ForestSelector";
import AuthForm from "@/components/AuthForm";
import HomeComponent from "@/components/HomeComponent";
import { fetchForestByName } from "@/firebase/firestoreHelpers";

export default function Page() {
  const [step, setStep] = useState("selectForest");
  const [selectedForest, setSelectedForest] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [forestData, setForestData] = useState(null);

  useEffect(() => {
    const loadForestData = async () => {
      if (step === "loadingForest" && selectedForest && currentUser) {
        const data = await fetchForestByName(selectedForest);
        setForestData(data);
        setStep("home");
      }
    };
    loadForestData();
  }, [step, selectedForest, currentUser]);

  if (step === "selectForest") {
    return (
      <ForestSelector
        onForestSelected={(forest, mode = "user") => {
          setSelectedForest(forest);
          if (mode === "visitor") {
            const visitorUser = { name: "Visitor", email: "visitor@demo.com", isVisitor: true };
            localStorage.setItem("climate_user", JSON.stringify(visitorUser));
            setCurrentUser(visitorUser);
            setStep("loadingForest");
          } else {
            setStep("chooseRole");
          }
        }}
      />
    );
  }

  if (step === "chooseRole") {
    return (
      <div style={{ height: "100vh", backgroundColor: "#eaf7ee", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "Arial" }}>
        <h2 style={{ fontSize: "1.8rem", marginBottom: "20px", color: "#2d4739" }}>
          Are you a garden owner?
        </h2>
        <button onClick={() => setStep("login")} style={{ backgroundColor: "#4caf50", color: "white", padding: "12px 24px", margin: "10px", border: "none", borderRadius: "8px", fontSize: "1rem", cursor: "pointer" }}>
          ✅ Yes, I already have a garden
        </button>
        <button onClick={() => setStep("signup")} style={{ backgroundColor: "#2196f3", color: "white", padding: "12px 24px", margin: "10px", border: "none", borderRadius: "8px", fontSize: "1rem", cursor: "pointer" }}>
          🌱 No, I want to become a garden owner
        </button>
      </div>
    );
  }

  if ((step === "login" || step === "signup") && !currentUser) {
    return (
      <AuthForm
        selectedForest={selectedForest}
        onAuthenticated={(user) => {
          localStorage.setItem("climate_user", JSON.stringify(user));
          setCurrentUser(user);
          setStep("loadingForest");
        }}
        isSignup={step === "signup"}
      />
    );
  }

  if (step === "loadingForest") {
    return <div style={{ textAlign: "center", marginTop: "200px" }}>🌱 Loading forest...</div>;
  }

  if (step === "home" && forestData && currentUser) {
    return (
      <HomeComponent
        key={selectedForest} // <-- bu önemli, orman değiştiğinde komple refresh sağlar
        forestName={selectedForest}
        currentUser={currentUser}
        isVisitor={currentUser.isVisitor}
        onChangeForest={(newForest) => {
          setSelectedForest(newForest);
          setStep("loadingForest");
        }}
      />
    );
  }

  return null;
}
