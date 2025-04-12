// components/Garden.js
"use client";
import React, { useEffect } from "react";
import IsometricTile from "./IsometricTile";

const Garden = ({
  gardenIndex,
  reportTreeCount,
  currentUserEmail,
  ownerEmail,
  onTileClick,
  treeData,
  onHoverTree,
  onLeaveTree,
  ownerName
}) => {
  const gardenSize = 4;
  const tileSize = 40;

  const isOwner = currentUserEmail === ownerEmail;

  const plantedTiles = Object.keys(treeData).filter((key) => key.startsWith(`${gardenIndex}-`));
  const plantedCount = plantedTiles.length;

  useEffect(() => {
    reportTreeCount(plantedCount);
  }, [plantedCount, treeData]);  

  function interpolateColor(start, end, factor) {
    const hexToRgb = (hex) => hex.match(/\w\w/g).map((c) => parseInt(c, 16));
    const rgbToHex = (rgb) => "#" + rgb.map((v) => v.toString(16).padStart(2, "0")).join("");

    const startRGB = hexToRgb(start);
    const endRGB = hexToRgb(end);

    const result = startRGB.map((start, i) =>
      Math.round(start + factor * (endRGB[i] - start))
    );
    return rgbToHex(result);
  }

  const factor = plantedCount / (gardenSize * gardenSize); // 0 to 1
  const backgroundColor = interpolateColor("#e0c68d", "#5c931e", factor);

  const gardenWidth = gardenSize * tileSize;
  const gardenHeight = gardenSize * tileSize / 2;

  return (
    <div
      style={{
        position: "relative",
        width: `${gardenWidth + 40}px`,
        height: `${gardenHeight + 100}px`,
        margin: "20px",
        backgroundColor: "transparent",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <div style={{ fontWeight: "bold", color: "#7c4e0f", marginBottom: "4px", transform: "translate(35px, -16px)" }}>
       {ownerName ? `${ownerName}'s Garden` : "FREE Garden"}
      </div>

      {/* Background dirt layer */}
      <div
        style={{
          position: "absolute",
          top: "-5px",
          left: "70px",
          width: `${gardenWidth - 30}px`,
          height: `${gardenHeight + 50}px`,
          backgroundColor,
          borderRadius: "12px",
          transform: "rotateX(60deg) rotateZ(45deg)",
          zIndex: -1,
          transition: "background-color 0.5s ease-in-out",
        }}
      />

      {/* Tiles */}
      <div style={{ position: "relative", width: `${gardenWidth}px`, height: `${gardenHeight}px`, zIndex: 999, overflow: "visible" }}>
        {Array.from({ length: gardenSize }).map((_, rowIndex) =>
          Array.from({ length: gardenSize }).map((_, colIndex) => {
            const metadata = treeData?.[`${gardenIndex}-${rowIndex}-${colIndex}`];
            const planted = !!metadata;
            return (
              <IsometricTile
                key={`${rowIndex}-${colIndex}`}
                row={rowIndex}
                col={colIndex}
                size={tileSize}
                planted={planted}
                onClick={() => isOwner && onTileClick(rowIndex, colIndex)}
                metadata={metadata}
                onHoverTree={onHoverTree}
                onLeaveTree={onLeaveTree}
              />
            );
          })
        )}
      </div>

      {/* Tree Layer */}
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 10_000,
        overflow: "visible"
      }}>
        {Array.from({ length: gardenSize }).map((_, rowIndex) =>
          Array.from({ length: gardenSize }).map((_, colIndex) => {
            const metadata = treeData?.[`${gardenIndex}-${rowIndex}-${colIndex}`];
            if (!metadata) return null;

            const spacing = 2;
            const left = (colIndex - rowIndex) * (tileSize / 2 + spacing) + tileSize * 2.69;
            const top = (colIndex + rowIndex) * (tileSize / 4 + spacing / 2) - tileSize * 0.31;

            return (
              <div
                key={`tree-${rowIndex}-${colIndex}`}
                style={{
                  position: "absolute",
                  left: `${left + tileSize * 0.22}px`,
                  top: `${top - tileSize * 0.35}px`,
                  width: `${tileSize}px`,
                  height: `${tileSize * 1.6}px`,
                  pointerEvents: "none",
                  zIndex: 10000 + rowIndex + colIndex,
                }}
              >
                <img
                  src="/assets/tiles/tree.png"
                  alt="tree"
                  style={{
                    width: "100%",
                    height: "100%",
                    pointerEvents: "none",
                  }}
                />
                <div
                  onMouseEnter={() => onHoverTree(metadata)}
                  onMouseLeave={onLeaveTree}
                  style={{
                    position: "absolute",
                    bottom: "8px",
                    left: "35%",
                    width: "25%",
                    height: "25%",
                    pointerEvents: "auto",
                    backgroundColor: "transparent",
                  }}
                />
              </div>
            );
          })
        )}
      </div>

      {/* Fence */}
      <div
        style={{
          position: "absolute",
          top: "-8px",
          left: "67px",
          width: `${gardenWidth - 30}px`,
          height: `${gardenHeight + 50}px`,
          border: isOwner ? "4px solid #00ff80" : "4px solid #8b5e3c",
          borderRadius: "12px",
          transform: "rotateX(60deg) rotateZ(45deg)",
          pointerEvents: "none",
          zIndex: 1,
          boxShadow: isOwner ? "0 0 15px #00ff80" : "none"
        }}
      />
    </div>
  );
};

export default Garden;