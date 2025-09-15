import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Gift, CreditCard, HelpCircle, Users } from "lucide-react";
import { useRouter } from "next/navigation";

interface CreditModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreditModal({ isOpen, onOpenChange }: CreditModalProps) {
  const router = useRouter();

  const options = [
    {
      label: "Unlimited Credits (Plans)",
      icon: CreditCard,
      action: () => router.push("/pricing"),
    },
    {
      label: "Referrals (+5 each share)",
      icon: Gift,
      action: () => router.push("/referral"),
    },
    {
      label: "Evangelists (Free Pro, 20 seats)",
      icon: Users,
      action: () => router.push("/evangelist"),
    },
    {
      label: "Answer & Win (+7 credits)",
      icon: HelpCircle,
      action: () => router.push("/answer-win"),
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTitle className="sr-only">Out of Credits</DialogTitle>
      <DialogContent
        className="
          w-full h-full max-w-none max-h-none rounded-none 
          md:max-w-md md:h-auto md:rounded-2xl 
          md:mx-auto md:my-4 md:p-0
          p-0 bg-transparent shadow-none border-none overflow-hidden
        "
      >
        <div
          className="
            relative bg-white h-full md:h-full 
            md:rounded-2xl shadow-lg 
            p-4 md:p-6 text-left space-y-6 overflow-y-auto
          "
        >
          <h2 className="text-xl font-semibold text-gray-900">
            You’re out of credits
          </h2>
          <p className="text-gray-600 text-sm">
            Pick one of the options below to keep using the app.
          </p>

          {/* Options as menu list */}
          <div className="divide-y divide-gray-100 border border-gray-200 rounded-lg">
            {options.map(({ label, icon: Icon, action }) => (
              <button
                key={label}
                onClick={action}
                className="
                  w-full flex items-center gap-3 px-4 py-3 
                  text-sm text-gray-700 hover:bg-gray-50 
                  transition-colors text-left
                "
              >
                <Icon className="w-4 h-4 text-gray-500" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
