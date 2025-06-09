import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../ui/custom/Header';
import Footer from '../ui/custom/Footer';

export function Layout() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
