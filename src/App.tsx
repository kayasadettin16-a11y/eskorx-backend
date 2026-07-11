import React from "react";
import MainApp from "./components/AndroidEmulator"; // Renaming or keeping the import is fine, but it's the main logic

export default function App() {
  return (
    <div className="min-h-screen bg-black">
      <MainApp />
    </div>
  );
}
