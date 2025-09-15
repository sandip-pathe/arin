import { useRouter } from "next/navigation";

export default function Logo() {
  const router = useRouter();
  return (
    <div className="flex items-center select-none">
      <span
        onClick={() => router.push("/")}
        className="font-logo text-4xl font-bold tracking-tighter text-primary"
      >
        Anaya
      </span>
    </div>
  );
}
