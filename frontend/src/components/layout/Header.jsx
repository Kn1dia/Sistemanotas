import React from 'react';
import { Upload, User, Menu, LogOut } from 'lucide-react';

const Header = ({ onOpenUpload, onLogout }) => {
  return (
    <header className="sticky top-0 z-40 backdrop-blur-lg bg-slate-900/90 border-b border-white/5">
      <div className="max-w-lg mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo com hover */}
          <div className="flex items-center space-x-2 group cursor-pointer">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200 shadow-md">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className="font-bold text-white text-lg group-hover:text-purple-300 transition-colors duration-200">SmartSpend</span>
          </div>

          {/* Actions - Mobile Simplificado */}
          <div className="flex items-center space-x-3">
            {/* Upload Button - Desktop Only */}
            <button 
              onClick={onOpenUpload}
              className="hidden sm:flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white px-4 py-2 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg"
            >
              <Upload className="w-4 h-4" />
              <span className="font-medium">Enviar</span>
            </button>

            {/* Profile/Logout */}
            <div className="relative group">
              <button className="flex items-center justify-center w-10 h-10 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg transition-all duration-200 transform hover:scale-105">
                <User className="w-5 h-5" />
              </button>
              
              {/* Dropdown Menu */}
              <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="p-3 border-b border-slate-700">
                  <p className="text-white font-medium text-sm">Vitor</p>
                  <p className="text-gray-400 text-xs">vitor@gmail.com</p>
                </div>
                <button
                  onClick={onLogout}
                  className="w-full flex items-center space-x-2 px-3 py-2 text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors rounded-b-lg"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm">Sair</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
