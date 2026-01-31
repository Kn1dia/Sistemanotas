import React from 'react';
import { Upload, User, Menu } from 'lucide-react';

const Header = ({ onOpenUpload }) => {
  return (
    <header className="bg-white shadow-sm border-b border-purple-100 sticky top-0 z-40 backdrop-blur-sm bg-white/95">
      <div className="container mx-auto px-4 py-4 max-w-md">
        <div className="flex items-center justify-between">
          {/* Logo com hover */}
          <div className="flex items-center space-x-2 group cursor-pointer">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200 shadow-md">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className="font-bold text-purple-900 text-lg group-hover:text-purple-700 transition-colors duration-200">SmartSpend</span>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-3">
            {/* Upload Button */}
            <button 
              onClick={onOpenUpload}
              className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white px-4 py-2 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg"
            >
              <Upload className="w-4 h-4" />
              <span className="font-medium">Enviar</span>
            </button>

            {/* Profile */}
            <button className="flex items-center space-x-2 bg-purple-100 hover:bg-purple-200 text-purple-700 px-3 py-2 rounded-lg transition-all duration-200 transform hover:scale-105">
              <User className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
              <Upload className="w-4 h-4" />
              <span className="text-sm font-medium">Upload</span>
            </button>

            {/* Profile */}
            <button className="w-10 h-10 bg-purple-50 hover:bg-purple-100 rounded-full flex items-center justify-center transition-all duration-200 group">
              <User className="w-5 h-5 text-purple-600 group-hover:text-purple-700 transition-colors duration-200" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
