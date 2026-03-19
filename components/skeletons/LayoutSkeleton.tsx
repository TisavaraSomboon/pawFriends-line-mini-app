export default function LayoutSkeleton() {
  return (
    <div className="main-layout flex min-h-dvh bg-[#f7f7f6] animate-pulse">

      {/* Desktop sidebar skeleton */}
      <aside className="hidden md:flex flex-col w-64 shrink-0 h-screen border-r border-[#ede8e0] bg-[#f7f7f6] px-4 py-6">
        {/* Logo */}
        <div className="flex items-center gap-3 px-2 mb-8">
          <div className="w-10 h-10 rounded-full bg-[rgba(226,207,183,0.4)]" />
          <div className="h-5 w-28 rounded-full bg-[rgba(226,207,183,0.4)]" />
        </div>

        {/* Nav links */}
        <div className="flex flex-col gap-2 flex-1">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-xl">
              <div className="w-6 h-6 rounded-md bg-[rgba(226,207,183,0.4)]" />
              <div className="h-4 w-20 rounded-full bg-[rgba(226,207,183,0.3)]" />
            </div>
          ))}
        </div>

        {/* Create activity button */}
        <div className="h-12 rounded-xl bg-[rgba(226,207,183,0.4)] mt-4" />
      </aside>

      {/* Main content skeleton */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Top bar */}
        <div className="h-16 border-b border-[#ede8e0] px-6 flex items-center gap-4">
          <div className="flex-1 h-10 rounded-xl bg-[rgba(226,207,183,0.3)]" />
          <div className="w-10 h-10 rounded-full bg-[rgba(226,207,183,0.3)]" />
        </div>

        {/* Content area */}
        <div className="flex-1 px-6 py-6 flex flex-col gap-4">
          <div className="h-14 rounded-xl bg-[rgba(226,207,183,0.3)]" />
          <div className="h-6 w-48 rounded-full bg-[rgba(226,207,183,0.4)]" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-xl overflow-hidden border border-[#f1f5f9]">
                <div className="h-48 bg-[rgba(226,207,183,0.3)]" />
                <div className="p-4 flex flex-col gap-3">
                  <div className="h-5 w-36 rounded-full bg-[rgba(226,207,183,0.3)]" />
                  <div className="h-3.5 w-48 rounded-full bg-[rgba(226,207,183,0.2)]" />
                  <div className="h-3.5 w-40 rounded-full bg-[rgba(226,207,183,0.2)]" />
                  <div className="flex justify-between items-center mt-1">
                    <div className="h-8 w-8 rounded-full bg-[rgba(226,207,183,0.3)]" />
                    <div className="h-9 w-20 rounded-xl bg-[rgba(226,207,183,0.3)]" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
