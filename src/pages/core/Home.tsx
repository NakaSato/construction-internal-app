import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../shared/hooks/useAuth";

const Home: React.FC = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 bg-cover bg-center bg-no-repeat relative overflow-hidden"
      style={{
        backgroundImage: "url('/images/dashboard.jpg')",
      }}
    >
      {/* Enhanced Background Overlay with Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/50 via-blue-900/30 to-black/60"></div>

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-yellow-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-white/5 rounded-full blur-2xl animate-bounce"></div>
      </div>

      <div className="max-w-6xl mx-auto text-center relative z-10 animate-fade-in-up">
        {/* Logo Section */}
        <div className="mb-20 py-10">
          <div className="flex flex-col lg:flex-row justify-center items-center gap-8 lg:gap-16 xl:gap-20 mb-12 animate-slide-up">
            {/* PEA Logo */}
            <div className="group relative">
              <div className="absolute -inset-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full blur opacity-30 group-hover:opacity-60 transition duration-500"></div>
              <div className="relative w-40 h-40 md:w-48 md:h-48 lg:w-56 lg:h-56 xl:w-64 xl:h-64 bg-white rounded-full flex items-center justify-center shadow-2xl ring-4 ring-white/20 transition-all duration-500">
                <div className="w-4/5 h-4/5 relative overflow-hidden rounded-full">
                  <img
                    src="/images/pea_logo.png"
                    alt="Provincial Electricity Authority"
                    className="w-full h-full object-contain filter drop-shadow-lg"
                    loading="lazy"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = "none";
                    }}
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent opacity-0 transition-opacity duration-500 rounded-full"></div>
              </div>
            </div>

            {/* PWA Logo */}
            <div className="group relative">
              <div className="absolute -inset-2 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-full blur opacity-30 group-hover:opacity-60 transition duration-500"></div>
              <div className="relative w-40 h-40 md:w-48 md:h-48 lg:w-56 lg:h-56 xl:w-64 xl:h-64 bg-white rounded-full flex items-center justify-center shadow-2xl ring-4 ring-white/20 transition-all duration-500">
                <div className="w-4/5 h-4/5 relative overflow-hidden rounded-full">
                  <img
                    src="/images/pwa_logo.png"
                    alt="PWA - Solar Energy Partner"
                    className="w-full h-full object-contain drop-shadow-lg transition-transform duration-500"
                    loading="lazy"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = "none";
                    }}
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent opacity-0 transition-opacity duration-500 rounded-full"></div>
              </div>
            </div>
          </div>

          {/* Partnership Badge */}
          <div className="flex justify-center animate-fade-in delay-300">
            <div className="relative group max-w-5xl">
              <div className="absolute -inset-1 bg-gradient-to-r from-white/20 to-blue-200/20 rounded-full blur opacity-50 group-hover:opacity-75 transition duration-500"></div>
              <div className="relative bg-white/10 backdrop-blur-md rounded-full px-8 py-4 md:px-12 md:py-5 lg:px-16 lg:py-6 xl:px-20 xl:py-7 border border-white/30 shadow-xl hover:shadow-2xl transition-all duration-300 hover:bg-white/15">
                <p className="text-white text-lg md:text-xl lg:text-2xl xl:text-3xl 2xl:text-4xl font-medium tracking-wide text-center leading-tight drop-shadow-lg">
                  โครงการจัดการพลังงานไฟฟ้าจากระบบผลิตไฟฟ้าพลังงานแสงอาทิตย์
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="mb-12 space-y-6 animate-fade-in delay-500">
          {/* Subtitle */}
          <div className="relative">
            <p className="text-lg md:text-xl lg:text-2xl text-gray-200 drop-shadow-md font-light tracking-wide leading-relaxed">
              ระบบจัดการโครงการก่อสร้างภายในองค์กร
            </p>
            <p className="text-base md:text-lg text-blue-200 mt-2 drop-shadow font-medium">
              Internal Construction Management System
            </p>
          </div>
          {/* Call to Action */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center animate-fade-in delay-700">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="group relative inline-flex items-center px-10 py-4 text-lg font-semibold rounded-lg text-white bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900 focus:outline-none focus:ring-4 focus:ring-slate-500/50 transition-all duration-300 hover:scale-105 shadow-xl hover:shadow-2xl border border-slate-500/30"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="relative flex items-center gap-3">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H5m0 0h2M7 21V5a2 2 0 012-2h6a2 2 0 012 2v16"
                    />
                  </svg>
                  เข้าสู่ระบบจัดการโครงการ
                </span>
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="group relative inline-flex items-center px-10 py-4 text-lg font-semibold rounded-lg text-white bg-gradient-to-r from-blue-700 to-blue-800 hover:from-blue-800 hover:to-blue-900 focus:outline-none focus:ring-4 focus:ring-blue-500/50 transition-all duration-300 hover:scale-105 shadow-xl hover:shadow-2xl border border-blue-500/30 hover:text-blue-200"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <span className="relative flex items-center gap-3">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                      />
                    </svg>
                    เข้าสู่ระบบ
                  </span>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
