import React from "react";

const ModernLayout = ({ children, footer }) => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Main content area */}
      <main className="flex-1">
        {children}
      </main>
      
      {/* Footer - always at bottom */}
      <footer className="mt-auto">
        {footer}
      </footer>
    </div>
  );
};

export default ModernLayout;
