import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col min-h-dvh bg-[#f5f0e8] md:flex-row">

      {/* Desktop: left hero panel */}
      <div className="hidden md:flex md:w-1/2 md:sticky md:top-0 md:h-screen relative overflow-hidden">
        <img
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDIq5NDOeilq8jFxGvhxjaDy8GSB2M5XnNndxf48Yc_LuTFetZ61bEGHTsufwzTJzG-Mcn88WxXaBcrEvey10Fh_XIcbBug5kEtQPHUsy9XSI75_J53NNsAPn9djVGHpKROkcMoY8sDrUh_ClK-V3mxlIFVKOicK58_Bx5w407G3HpVuTsE-L_mDcFMncaz25X_h-3RtgAApD-VsXiJNYyaVOduzrHsTNhd5v_uV8RcoP4mQmfDU9zXDyGZb01P-v0zqtSnjXhaqyIU"
          alt="Dogs playing"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[rgba(30,41,59,0.55)] via-transparent to-transparent flex flex-col justify-end p-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-[rgba(226,207,183,0.3)] backdrop-blur-sm flex items-center justify-center">
              <span className="text-xl">🐾</span>
            </div>
            <span className="text-2xl font-extrabold text-white">PawFriends</span>
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight leading-snug">
            Every dog finds<br />their pack
          </h2>
          <p className="mt-3 text-[15px] text-[rgba(255,255,255,0.8)] leading-relaxed max-w-xs">
            Join the world&apos;s friendliest community for dog lovers and their furry best friends.
          </p>
        </div>
      </div>

      {/* Right / mobile panel */}
      <div className="flex flex-col flex-1 overflow-y-auto md:justify-center md:items-center">
        <div className="w-full md:max-w-md md:px-0">

          {/* Mobile: top app bar */}
          <div className="flex items-center px-6 py-4 md:hidden">
            <div className="w-10 h-10 rounded-full bg-[rgba(226,207,183,0.2)] flex items-center justify-center">
              <span className="text-xl">🐾</span>
            </div>
            <h1 className="flex-1 text-center text-xl font-extrabold text-[#1e293b] -mr-10">
              PawFriends
            </h1>
            <div className="w-10" />
          </div>

          {/* Mobile: hero image */}
          <div className="mx-4 rounded-2xl overflow-hidden h-[280px] bg-[#e2cfb7] md:hidden">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDIq5NDOeilq8jFxGvhxjaDy8GSB2M5XnNndxf48Yc_LuTFetZ61bEGHTsufwzTJzG-Mcn88WxXaBcrEvey10Fh_XIcbBug5kEtQPHUsy9XSI75_J53NNsAPn9djVGHpKROkcMoY8sDrUh_ClK-V3mxlIFVKOicK58_Bx5w407G3HpVuTsE-L_mDcFMncaz25X_h-3RtgAApD-VsXiJNYyaVOduzrHsTNhd5v_uV8RcoP4mQmfDU9zXDyGZb01P-v0zqtSnjXhaqyIU"
              alt="Dogs playing"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Mobile: welcome text */}
          <div className="px-6 pt-8 pb-2 text-center md:hidden">
            <h2 className="text-[28px] font-extrabold text-[#1e293b] tracking-tight mb-3">
              Every dog finds their pack
            </h2>
            <p className="text-[15px] font-medium text-[#64748b] leading-relaxed px-2">
              Join the world&apos;s friendliest community for dog lovers and their furry best friends.
            </p>
          </div>

          {children}

        </div>
      </div>

    </div>
  );
}
