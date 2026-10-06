import React from "react";
import { createRoot } from "react-dom/client";
import "./app.css";
import { AppProvider, useApp } from "./context.jsx";

function Brand() {
  return <div className="app-top__brand">LOGO</div>;
}

function LocationBar() {
  return <div className="app-top__business">ABC Hydraulics</div>;
}

function UserMenu() {
  const { user } = useApp();
  return <div className="app-top__account">{user?.name ?? "Guy"}</div>;
}

function AppTop() {
  return (
    <header className="app-top">
      <Brand />
      <LocationBar />
      <UserMenu />
    </header>
  );
}

function AppMenu() {
  return (
    <aside className="app-left">
      <nav>
        <a href="#">Home</a>
        <a href="#">CRM</a>
        <a href="#">Service</a>
        <a href="#">Inventory</a>
        <a href="#">Accounting</a>
      </nav>
    </aside>
  );
}

function App() {
  return (
    <div className="app">
      <AppTop />
      <AppMenu />
      <main className="app-main">
        <header className="page-header">
          <div>
            <span className="page-header__section">Inventory</span>
            <h1>Inventory</h1>
          </div>

          <div className="page-header__actions">
            <button>Add Item</button>
          </div>
        </header>

        <section className="workspace">
          <div className="workspace__row">
            <span>Part Number</span>
            <span>Description</span>
            <span>Quantity</span>
          </div>

          <div className="workspace__row">
            <span>HOSE-08</span>
            <span>1/2" Hydraulic Hose</span>
            <span>142 ft</span>
          </div>

          <div className="workspace__row">
            <span>FITTING-12</span>
            <span>-12 ORFS Male</span>
            <span>18</span>
          </div>
        </section>
      </main>

      <aside className="app-right">
        <header>Details</header>
        <div className="app-right__content">
          Select a record to view details.
        </div>
      </aside>

      <footer className="app-bottom">
        <span>Connected</span>
        <span>ABC Hydraulics</span>
      </footer>
    </div>
  );
}

const root = createRoot(document.getElementById("app"));
root.render(
  <AppProvider>
    <App />
  </AppProvider>,
);
