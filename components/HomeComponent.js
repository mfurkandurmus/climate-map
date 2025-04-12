// components/HomeComponent.js

"use client";
import React, { useState, useEffect, useCallback } from "react";
import Garden from "./Garden";
import { getUserFromLocalStorage } from "../firebase/users";
import { fetchForestByName, fetchUserNameByEmail } from "../firebase/firestoreHelpers";
import TreePopup from "./TreePopup";
import { fetchAllTreesForForest, saveTreeToFirestore, deleteTreeFromFirestore } from "../firebase/firestoreHelpers";
import { useRef } from "react";
import { deleteUserFromFirebase } from "../firebase/firestoreHelpers";

console.log("🔍 saveTreeToFirestore:", saveTreeToFirestore);

export default function HomeComponent({ forestName: initialForestName, currentUser: initialUser }) {
  const totalGardens = 40;
  const plotsPerGarden = 16;

  const [treeCounts, setTreeCounts] = useState(Array(totalGardens).fill(0));
  const [hoveredTreeData, setHoveredTreeData] = useState(null);
  const [forestData, setForestData] = useState(null);
  const [currentUser, setCurrentUser] = useState(initialUser);
  const [selectedPlot, setSelectedPlot] = useState(null);
  const [selectedGardenIndex, setSelectedGardenIndex] = useState(null);
  const [treeData, setTreeData] = useState({});
  const [ownerStatuses, setOwnerStatuses] = useState(Array(totalGardens).fill(false));
  const [ownerNames, setOwnerNames] = useState([]);
  const [activeOwners, setActiveOwners] = useState(0); // Aktif sahip sayısı
  const [popupMode, setPopupMode] = useState("add");
  const [freeGardens, setFreeGardens] = useState(0); // Boş bahçe sayısı

  const containerRef = useRef();
  
  
  // İstatistikleri hesaplama
  const recalculateStats = (updatedForest) => {
    const activeOwnersCount = updatedForest?.owners?.filter(owner => owner !== null).length || 0;
    const freeGardensCount = totalGardens - activeOwnersCount;
  
    setActiveOwners(activeOwnersCount);
    setFreeGardens(freeGardensCount);
  };

  useEffect(() => {
    if (!initialUser) {
      const storedUser = getUserFromLocalStorage();
      setCurrentUser(storedUser);
    }
  }, [initialUser]);


  useEffect(() => {
    const loadForest = async () => {
      if (!initialForestName) return;
      const forest = await fetchForestByName(initialForestName);
      setForestData(forest);
    
      recalculateStats(forest); // <--- 🔧 BU SATIRI EKLE
    
      const names = await Promise.all(
        forest.owners.map(async (email) => {
          if (!email) return null;
          try {
            const name = await fetchUserNameByEmail(email);
            return name || null;
          } catch (err) {
            console.error("Name fetch error for", email, err);
            return null;
          }
        })
      );
      setOwnerNames(names);
    };
    

    loadForest();
  }, [initialForestName]);
  
  useEffect(() => {
    const loadTrees = async () => {
      if (!forestData?.id) return;
      const trees = await fetchAllTreesForForest(forestData.id);
      setTreeData(trees);
    };
    loadTrees();
  }, [forestData]);
  
  useEffect(() => {
    if (forestData) {
      recalculateStats(forestData);
    }
  }, [forestData]);
  

  useEffect(() => {
    if (containerRef.current) {
    }
  }, []);  

  const updateTreeCount = useCallback((index, count) => {
    setTreeCounts((prev) => {
      if (prev[index] === count) return prev; // gereksiz update’i engelle
      const newCounts = [...prev];
      newCounts[index] = count;
      return newCounts;
    });
  
    setOwnerStatuses((prev) => {
      const isOwner = count > 0;
      if (prev[index] === isOwner) return prev; // değişim yoksa güncelleme
      const newStatuses = [...prev];
      newStatuses[index] = isOwner;
      return newStatuses;
    });
  }, []);
  

const totalTrees = treeCounts.reduce((a, b) => a + b, 0);
const averageGreenPercentage = Math.round((totalTrees / (totalGardens * plotsPerGarden)) * 100);  
console.log("treeCounts:", treeCounts);
console.log("totalTrees:", totalTrees);
console.log("freeGardens:", freeGardens);
console.log("activeOwners:", activeOwners);

  const handleTileClick = (gardenIndex, row, col) => {
    const isOwner = forestData?.owners?.[gardenIndex] === currentUser?.email;
    if (!isOwner) return;

    const key = `${gardenIndex}-${row}-${col}`;
    const metadata = treeData[key];

    setSelectedPlot({ row, col });
    setSelectedGardenIndex(gardenIndex);
    setPopupMode(metadata ? "remove" : "add");
  };

  if (!forestData || !currentUser) {
    return <div style={{ padding: 100, textAlign: "center" }}>🌱 Loading forest...</div>;
  }

  return (
    <div style={{ position: "relative" }}>
      <div
  style={{
    position: "fixed",
    top: "30px", // Burayı değiştirdik
    left: "50%",
    transform: "translateX(-50%)",
    background: "#ffffffdd",
    padding: "14px 26px",
    borderRadius: "12px",
    boxShadow: "0 2px 10px rgba(89, 195, 19, 0.15)",
    zIndex: 1000,
    fontSize: "16px",
    fontWeight: 500,
  }}
>
  <strong>Total Garden Owners:</strong> {activeOwners} |{" "}
  <strong>Free Gardens:</strong> {freeGardens} |{" "}
  <strong>Total Trees:</strong> {totalTrees} |{" "}
  <strong>Avg Greenery:</strong> {averageGreenPercentage}%
</div>
{currentUser?.email === "admin@forest.com" && (
    <div style={{ position: "fixed", top: 10, right: 20, zIndex: 9999 }}>
      <button
        onClick={async () => {
          const emailToDelete = prompt("Silinecek e-mail?");
          if (!emailToDelete) return;
  
          const confirmed = confirm(`${emailToDelete} kullanıcısını silmek istiyor musun?`);
          if (!confirmed) return;
  
          await deleteUserFromFirebase(emailToDelete, forestData.id);
          alert("Kullanıcı silindi. Sayfayı yenile lütfen.");
        }}
        style={{
          backgroundColor: "#c0392b",
          color: "white",
          padding: "10px 20px",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
        }}
      >
        🛠 Kullanıcı Sil
      </button>
    </div>
  )}

      {hoveredTreeData && (
        <div
        style={{
          position: "fixed",
          top: "120px", // Burayı değiştirdik
          left: "50%",
          transform: "translateX(-50%)",
          backgroundColor: "#ffffffdd",
          padding: "12px 18px",
          borderRadius: "10px",
          boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
          zIndex: 1001,
          fontSize: "15px",
          width: "320px",
          textAlign: "left",
          pointerEvents: "none",
        }}
      >
        <div><strong>Presented to:</strong></div>
        <div>👤 {hoveredTreeData.occupation}</div>
        <div>🎂 {hoveredTreeData.age} years old</div>
      </div>
      
      )}

<div
  style={{
    position: "relative",
    minWidth: "100vw",   // ekranın tamamını kapsayacak şekilde
    minHeight: "115vh",
    overflowX: "auto",
    overflowY: "hidden", // 2. scroll'u engeller
    backgroundColor: "#a5b4a3",
    display: "flex",
    justifyContent: "flex-start", // sola yasla
    alignItems: "center", // Ortalamanın korunması için ekledik
  }}
>
<div
    style={{
      display: "flex",
      gap: "60px",
      minWidth: "3500px",  // İçeriği daha sıkıştırdık
      marginLeft: "0",  // Sağdaki boşluğu sıfırladık
      marginRight: "0",  // Sağdaki ekstra boşluğu tamamen kaldırıyoruz
      padding: "0",  // Padding sıfırladık
    }}
  >
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        gap: "60px",
        minWidth: "100%",
        transform: "translateX(170px)", // Tüm içeriği sağa kaydır
      }}
    >
      <div style={{ display: "flex", transform: "translateX(-40px)" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, auto)",
            gap: "0px",
            marginRight: "90px",
          }}
        >
          {Array.from({ length: 20 }).map((_, i) => (
            <Garden
              key={`left-${i}`}
              gardenIndex={i}
              reportTreeCount={(count) => updateTreeCount(i, count)}
              ownerEmail={forestData?.owners?.[i] || null}
              currentUserEmail={currentUser?.email || null}
              onTileClick={(row, col) => handleTileClick(i, row, col)}
              treeData={treeData}
              onHoverTree={(metadata) => setHoveredTreeData(metadata)}
              onLeaveTree={() => setHoveredTreeData(null)}
              ownerName={ownerNames?.[i] || null}
            />
          ))}
        </div>

        <div
          style={{
            width: "140px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
            padding: "0 0px",
          }}
        >
          <a
            href="https://www.climaterealityproject.org/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src="/assets/images/climateLogo.jpg"
              alt="Climate Reality"
              width={80}
              style={{
                borderRadius: "50%",
                display: "block",
                marginTop: "-100px",
                marginBottom: "20px",
              }}
            />
          </a>

          <div
            style={{
              textAlign: "center",
              maxWidth: "120px",
              width: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              wordBreak: "break-word",
            }}
          >
            <h2
              style={{
                fontSize: "1.6rem",
                color: "#2e3d27",
                marginBottom: "6px",
                lineHeight: "1.3",
              }}
            >
              Climate Reality Forest
            </h2>
            <p
              style={{
                fontSize: "1.1rem",
                color: "#3f3f3f",
                lineHeight: "1.5",
              }}
            >
              Plant a symbolic tree for every person you’ve reached through your climate presentations. As your garden grows greener, it reflects the increasing impact you’re making against the climate crisis.
            </p>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, auto)",
            gap: "0px",
            marginLeft: "10px",
          }}
        >
          {Array.from({ length: 20 }).map((_, i) => (
            <Garden
              key={`right-${i}`}
              gardenIndex={i + 20}
              reportTreeCount={(count) => updateTreeCount(i + 20, count)}
              ownerEmail={forestData?.owners?.[i + 20] || null}
              currentUserEmail={currentUser?.email || null}
              onTileClick={(row, col) => handleTileClick(i + 20, row, col)}
              treeData={treeData}
              onHoverTree={(metadata) => setHoveredTreeData(metadata)}
              onLeaveTree={() => setHoveredTreeData(null)}
              ownerName={ownerNames[i + 20] || null}
            />
          ))}
        </div>
      </div>
    </div>
  </div>
</div>

      {selectedPlot && (
        <TreePopup
          row={selectedPlot.row}
          col={selectedPlot.col}
          mode={popupMode}
          existingData={
            popupMode === "remove"
              ? treeData[`${selectedGardenIndex}-${selectedPlot.row}-${selectedPlot.col}`]
              : null
          }
          onClose={() => setSelectedPlot(null)}
          
          onConfirm={async (data) => {
            const key = `${selectedGardenIndex}-${data.row}-${data.col}`;
          
            try {
              if (popupMode === "add") {
                const newTree = {
                  gardenIndex: selectedGardenIndex,
                  row: data.row,
                  col: data.col,
                  age: data.age,
                  occupation: data.occupation,
                };
                setTreeData((prev) => ({ ...prev, [key]: newTree }));
                await saveTreeToFirestore(forestData.id, newTree);
              } else if (popupMode === "remove") {
                setTreeData((prev) => {
                  const newData = { ...prev };
                  delete newData[key];
                  return newData;
                });
                await deleteTreeFromFirestore(forestData.id, selectedGardenIndex, data.row, data.col);
              }
            } catch (error) {
              console.error("🚨 Error while saving/deleting tree:", error);
              alert("An error occurred while updating the tree. Please try again.");
            } finally {
              // 💡 Her durumda popup'ı kapat
              setSelectedPlot(null);
            }
          }}         
        />
      )}
    </div>
  );
}
