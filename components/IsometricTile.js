"use client";
import React from "react";
import Image from "next/image";
import dirtTile from "../public/assets/tiles/dirt.png";
import treeImage from "../public/assets/tiles/tree.png";

export default function IsometricTile({ row, col, size, planted, onClick, metadata, onHoverTree, onLeaveTree }) {
  const spacing = 2;
  const left = (col - row) * (size / 2 + spacing) + size * 2.68;
  const top = (col + row) * (size / 4 + spacing / 2) - size * 0.33;

  return (
    <div
      onClick={() => onClick(row, col)}
      style={{
        position: "absolute",
        left,
        top,
        width: size * 0.6,
        height: size * 0.7,
        transform: "scale(1)",
        overflow: "visible",
        transformStyle: "preserve-3d",
        cursor: "pointer",
        zIndex: 10_000 + row + col, // yüksek verildi
      }}
    >
      {/* Dirt (altta) */}
      <Image
        src={dirtTile}
        alt="tile"
        width={size * 0.63}
        height={size * 0.83}
        style={{
          position: "absolute",
          top: -3,
          left: -3,
          pointerEvents: "none",
          transform: "rotateX(60deg) rotateZ(45deg)",
          zIndex: 1,
        }}
      />
    </div>
  );
}
