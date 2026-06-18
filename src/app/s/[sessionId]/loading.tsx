export default function SessionLoading() {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#edeffa] text-foreground">
      <div className="flex items-center gap-4 p-4">
        <div className="text-3xl font-extrabold tracking-normal text-blue-700">
          ANAYA
        </div>
        <div>
          <div className="text-sm font-semibold text-gray-800">
            Opening legal workspace
          </div>
          <div className="text-xs text-gray-500">
            Preparing upload, citations, and chat
          </div>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 gap-4 px-4 pb-4">
        <aside className="hidden w-14 shrink-0 rounded-xl bg-white/80 shadow-sm lg:block">
          <div className="space-y-5 p-4">
            <div className="h-5 w-5 rounded bg-gray-200" />
            <div className="h-5 w-5 rounded bg-gray-200" />
            <div className="h-5 w-5 rounded bg-gray-200" />
          </div>
        </aside>

        <main className="min-w-0 flex-1 rounded-xl bg-white shadow-sm">
          <div className="flex items-center justify-between border-b px-6 py-4">
            <div>
              <div className="h-4 w-48 animate-pulse rounded bg-gray-200" />
              <div className="mt-2 h-3 w-64 animate-pulse rounded bg-gray-100" />
            </div>
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600" />
          </div>
          <div className="mx-auto max-w-3xl space-y-4 p-6">
            <div className="h-6 w-2/3 animate-pulse rounded bg-gray-200" />
            <div className="h-4 w-full animate-pulse rounded bg-gray-100" />
            <div className="h-4 w-5/6 animate-pulse rounded bg-gray-100" />
            <div className="mt-8 h-24 w-full animate-pulse rounded-xl bg-gray-100" />
          </div>
        </main>

        <aside className="hidden w-14 shrink-0 rounded-xl bg-white/80 shadow-sm xl:block" />
      </div>
    </div>
  );
}
