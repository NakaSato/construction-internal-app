import { Link } from "react-router-dom";
import { NavbarApiStatus } from "../../widgets";
import { Leaf } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white text-gray-600 mt-auto border-t border-gray-200">
      <div className="container mx-auto px-4 py-6">
        {/* Bottom Bar */}{" "}
        <div className="flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0">
          <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-4">
            <p className="text-gray-500 text-sm">
              © {currentYear} Solar Projects Management. All rights reserved.
            </p>
            <div className="flex items-center space-x-2 text-gray-500 text-xs">
              <Leaf className="h-3 w-3 text-emerald-500" />
              <span>Powered by renewable energy</span>
            </div>
            {/* API Status Indicator */}
            <NavbarApiStatus className="inline-flex" />
          </div>
          <div className="flex flex-wrap justify-center space-x-6">
            <a
              href="#"
              className="text-gray-500 hover:text-gray-900 text-sm transition-colors duration-200"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="text-gray-500 hover:text-gray-900 text-sm transition-colors duration-200"
            >
              Terms of Service
            </a>
            <a
              href="#"
              className="text-gray-500 hover:text-gray-900 text-sm transition-colors duration-200"
            >
              Cookie Policy
            </a>
            <a
              href="#"
              className="text-gray-500 hover:text-gray-900 text-sm transition-colors duration-200"
            >
              Security
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

