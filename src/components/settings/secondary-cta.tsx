import { useRouter } from "next/navigation";

type PageType = "pricing" | "referral" | "evangelist" | "join";

export default function SecondaryCTAs({ current }: { current: PageType }) {
  const router = useRouter();

  const options: Record<PageType, { label: string; path: string }[]> = {
    pricing: [
      { label: "Refer a Friend (+5 credits)", path: "/referrals" },
      { label: "Join as Evangelist (+10 credits)", path: "/evangelist" },
      { label: "Answer 3 Questions (+7 credits)", path: "/join" },
    ],
    referral: [
      { label: "Join as Evangelist (+10 credits)", path: "/evangelist" },
      { label: "Answer 3 Questions (+7 credits)", path: "/join" },
      { label: "Pay for Pro (instant unlimited access)", path: "/pricing" },
    ],
    evangelist: [
      { label: "Refer a Friend (+5 credits)", path: "/referrals" },
      { label: "Answer 3 Questions (+7 credits)", path: "/join" },
      { label: "Pay for Pro (instant unlimited access)", path: "/pricing" },
    ],
    join: [
      { label: "Refer a Friend (+5 credits)", path: "/referrals" },
      { label: "Join as Evangelist (+10 credits)", path: "/evangelist" },
      { label: "Pay for Pro (instant unlimited access)", path: "/pricing" },
    ],
  };

  return (
    <div className="mt-10 flex flex-wrap justify-center gap-4 text-sm">
      <button
        onClick={() => router.push("/referrals")}
        className="px-4 py-1.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
      >
        🎁 Refer a Friend (+5 credits)
      </button>
      <button
        onClick={() => router.push("/evangelist")}
        className="px-4 py-1.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
      >
        🚀 Join as Evangelist (+10 credits)
      </button>
      <button
        onClick={() => router.push("/join")}
        className="px-4 py-1.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
      >
        ✨ Answer 3 Questions (+7 credits)
      </button>
    </div>
  );
}
