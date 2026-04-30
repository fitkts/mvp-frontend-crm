import { ReactNode } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#fcfdfc]">
      <Sidebar />
      <div className="pl-56">
        <Header />
        <main className="pt-20 p-6 max-w-[1600px] mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
