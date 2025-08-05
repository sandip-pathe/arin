// components/MembershipSettings.tsx
import { useAuthStore } from "@/store/auth-store";
import useSessionStore from "@/store/session-store";
import { format } from "date-fns";
import { differenceInDays } from "date-fns";
import React from "react";
import { Membership } from "./membership";

export const MembershipSettings: React.FC = () => {
  const membership = useAuthStore((s) => s.membership);

  const { type, status, startDate, endDate, sessionsRemaining, lastDiscount } =
    membership;

  const { showMembershipModal, setShowMembershipModal } = useSessionStore();

  const isTrial = type === "trial";
  const isActive = status === "active";
  const daysRemaining =
    endDate && endDate.toDate
      ? differenceInDays(endDate.toDate(), new Date())
      : null;

  const formatDate = (date: any) =>
    date && date.toDate ? format(date.toDate(), "PPP") : "N/A";

  const handleManageSubscription = () => {
    // Open customer portal (Stripe or other)
    console.log("Opening subscription management portal...");
  };

  return (
    <div className="space-y-6 p-6 bg-white w-full">
      <h2 className="text-xl font-semibold">Membership Details</h2>

      <div className="space-y-2 text-gray-800">
        <div>
          <strong>Type:</strong> {type.toUpperCase()}
        </div>
        <div>
          <strong>Status:</strong>{" "}
          <span
            className={`font-medium ${
              status === "active"
                ? "text-green-600"
                : status === "expired"
                ? "text-red-500"
                : "text-yellow-600"
            }`}
          >
            {status}
          </span>
        </div>
        <div>
          <strong>Start Date:</strong> {formatDate(startDate)}
        </div>
        <div>
          <strong>End Date:</strong> {formatDate(endDate)}
        </div>
        {daysRemaining !== null && (
          <div>
            <strong>Days Remaining:</strong>{" "}
            {daysRemaining > 0 ? `${daysRemaining} days` : "Expired"}
          </div>
        )}
        {sessionsRemaining !== undefined && (
          <div>
            <strong>Sessions Remaining:</strong> {sessionsRemaining}
          </div>
        )}
        {lastDiscount && (
          <div>
            <strong>Last Discount:</strong> {lastDiscount.code} (
            {lastDiscount.amount}% off)
          </div>
        )}
      </div>

      {isTrial ? (
        <div className="mt-4">
          <p className="text-sm text-gray-600">
            You're on a free trial. Upgrade to unlock full features.
          </p>
          <button
            onClick={() => setShowMembershipModal(true)}
            className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Upgrade Membership
          </button>
        </div>
      ) : (
        <div className="mt-4">
          <button
            onClick={handleManageSubscription}
            className="bg-gray-100 text-gray-800 px-4 py-2 rounded hover:bg-gray-200"
          >
            Manage Subscription
          </button>
        </div>
      )}
      <Membership
        isOpen={showMembershipModal}
        onOpenChange={setShowMembershipModal}
      />
    </div>
  );
};
