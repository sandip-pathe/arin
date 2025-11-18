import { useRouter } from "next/navigation";
import Image from "next/image";

export default function Logo() {
  const router = useRouter();
  return (
    <div
      className="flex items-center select-none cursor-pointer"
      onClick={() => router.push("/")}
    >
      <Image
        src="/logo.png"
        alt="Anaya Logo"
        width={120}
        height={30}
        priority
        className="object-contain"
        style={{ height: "auto" }}
      />
    </div>
  );
}
