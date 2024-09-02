import React, { ReactNode } from 'react';
import NavBar from './NavBar';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => (
  <div className="min-h-screen flex flex-col">
    <NavBar />
    <main className="flex-grow p-10">{children}</main>
  </div>
);

export default Layout;
