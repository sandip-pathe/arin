// MembershipSettings.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FiCheck, FiStar } from "react-icons/fi";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Timestamp } from "firebase/firestore";
import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";
import { firmPlans, soloPlans } from "@/lib/data";
import { useAuthStore } from "@/store/auth-store";

export type MembershipType = "basic" | "pro" | "enterprise";

export const Membership = ({
  isOpen,
  onOpenChange,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const { membership, updateMembership } = useAuthStore();
  const [isUpgrading, setIsUpgrading] = useState<string | null>(null); // plan id upgrading

  const handleUpgrade = async (targetPlan: MembershipType) => {
    setIsUpgrading(targetPlan);
    try {
      await updateMembership({
        status: "active",
        startDate: Timestamp.now(),
        endDate: Timestamp.fromDate(
          new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
        ),
        sessionsRemaining:
          targetPlan === "enterprise"
            ? Infinity
            : targetPlan === "pro"
            ? 100
            : 50,
      });
    } catch (error) {
      console.error("Upgrade failed:", error);
    } finally {
      setIsUpgrading(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTitle className="sr-only">Membership & Plans</DialogTitle>
      <DialogContent className="max-w-6xl p-0 h-[90dvh] bg-gray-50 rounded-3xl overflow-hidden">
        <div className="w-full p-8 space-y-6 overflow-y-auto">
          <div className="text-center mb-4">
            <h2 className="text-3xl font-extrabold">
              Upgrade your Legal Second Brain
            </h2>
            <p className="text-gray-600 mt-2">
              Built for lawyers: case summarization, mock trials, follow-up
              chats, and knowledge management.
            </p>
          </div>

          <div className="flex justify-center">
            <Tabs defaultValue="solo">
              <TabsList className="mx-auto flex w-full">
                <TabsTrigger value="solo">Solo Practitioner</TabsTrigger>
                <TabsTrigger value="firm">Firm / Team</TabsTrigger>
              </TabsList>

              <TabsContent value="solo">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {soloPlans.map((plan) => {
                    const isCurrent = membership.type === plan.id;
                    return (
                      <Card
                        key={plan.id}
                        className={`flex flex-col justify-between min-h-[520px] p-6 shadow-lg border ${
                          plan.recommended
                            ? "ring-2 ring-emerald-500 bg-white"
                            : "bg-white"
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="text-xl font-bold">
                                {plan.title}
                              </h3>
                              <p className="text-sm text-gray-500">
                                {plan.subtitle}
                              </p>
                            </div>
                            {plan.recommended && (
                              <div className="flex items-center gap-1 bg-emerald-600 text-white text-xs px-3 py-1 rounded-full">
                                <FiStar /> Recommended
                              </div>
                            )}
                          </div>

                          <div className="mt-4">
                            <p className="text-3xl font-semibold">
                              {plan.price}
                            </p>
                            <p className="text-sm text-gray-700 mt-1">
                              {plan.description}
                            </p>
                          </div>

                          <div className="mt-6">
                            {isCurrent ? (
                              <Button
                                variant="outline"
                                disabled
                                className="w-full"
                              >
                                {plan.cta}
                              </Button>
                            ) : (
                              <Button
                                className="w-full"
                                onClick={() => handleUpgrade(plan.id)}
                                disabled={!!isUpgrading}
                              >
                                {isUpgrading === plan.id
                                  ? "Upgrading..."
                                  : plan.cta}
                              </Button>
                            )}
                          </div>

                          <div className="mt-6">
                            <ul className="space-y-2 text-sm">
                              {plan.features.map((feature, idx) => (
                                <li
                                  key={idx}
                                  className="flex items-start gap-2"
                                >
                                  <FiCheck className="mt-1 text-green-500" />
                                  <span>{feature}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </TabsContent>

              <TabsContent value="firm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {firmPlans.map((plan) => {
                    const isCurrent = membership.type === plan.id;
                    return (
                      <Card
                        key={plan.id}
                        className={`flex flex-col justify-between min-h-[520px] p-6 shadow-lg border ${
                          plan.recommended
                            ? "ring-2 ring-emerald-500 bg-white"
                            : "bg-white"
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="text-xl font-bold">
                                {plan.title}
                              </h3>
                              <p className="text-sm text-gray-500">
                                {plan.subtitle}
                              </p>
                            </div>
                            {plan.recommended && (
                              <div className="flex items-center gap-1 bg-emerald-600 text-white text-xs px-3 py-1 rounded-full">
                                <FiStar /> Recommended
                              </div>
                            )}
                          </div>

                          <div className="mt-4">
                            <p className="text-3xl font-semibold">
                              {plan.price}
                            </p>
                            <p className="text-sm text-gray-700 mt-1">
                              {plan.description}
                            </p>
                          </div>

                          <div className="mt-6 flex flex-col gap-2">
                            {isCurrent ? (
                              <Button
                                variant="outline"
                                disabled
                                className="w-full"
                              >
                                {plan.cta}
                              </Button>
                            ) : plan.id === "enterprise" ? (
                              <Button className="w-full" onClick={() => {}}>
                                {plan.cta}
                              </Button>
                            ) : (
                              <Button
                                className="w-full"
                                onClick={() => handleUpgrade(plan.id)}
                                disabled={!!isUpgrading}
                              >
                                {isUpgrading === plan.id
                                  ? "Upgrading..."
                                  : plan.cta}
                              </Button>
                            )}
                          </div>

                          <div className="mt-6">
                            <ul className="space-y-2 text-sm">
                              {plan.features.map((feature, idx) => (
                                <li
                                  key={idx}
                                  className="flex items-start gap-2"
                                >
                                  <FiCheck className="mt-1 text-green-500" />
                                  <span>{feature}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
