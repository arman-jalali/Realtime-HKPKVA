import React from "react";
import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center">
      <div className="max-w-md">
        <h1 className="text-6xl font-black text-teal-600 mb-4">404</h1>
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Seite nicht gefunden</h2>
        <p className="text-slate-500 mb-8">
          Die angeforderte Seite existiert nicht oder wurde verschoben.
        </p>
        <Link 
          href="/"
          className="inline-block px-8 py-3 bg-teal-600 text-white rounded-xl font-bold shadow-md hover:bg-teal-700 transition-colors"
        >
          Zurück zur Sitzung
        </Link>
      </div>
    </div>
  );
}
