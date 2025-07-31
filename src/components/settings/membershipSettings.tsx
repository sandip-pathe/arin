"use client";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { FiCheck } from "react-icons/fi";
import { MembershipType, useAuth } from "@/contexts/auth-context";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { plans } from "@/lib/data";
import { useState } from "react";
import { Timestamp } from "firebase/firestore";
import { ContactSales } from "./b2bsales";
import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";

export const MembershipSettings = ({
  isOpen,
  onOpenChange,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const { membership, updateMembership } = useAuth();
  const [isUpgrading, setIsUpgrading] = useState(false);

  const handleUpgrade = async (targetPlan: MembershipType) => {
    setIsUpgrading(true);
    try {
      await updateMembership({
        type: targetPlan,
        status: "active",
        startDate: Timestamp.now(),
        endDate: Timestamp.fromDate(
          new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
        ),
        sessionsRemaining: targetPlan === "enterprise" ? Infinity : 100,
      });
    } catch (error) {
      console.error("Upgrade failed:", error);
    } finally {
      setIsUpgrading(false);
    }
  };
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTitle className="sr-only">Membership Settings</DialogTitle>
      <DialogContent className="max-w-5xl p-0 h-[90dvh] bg-white shadow-none rounded-3xl border-none overflow-hidden">
        <div className="w-full p-6 space-y-4 overflow-y-auto">
          <div className="my-4 mx-auto text-center">
            <h2 className="text-2xl font-semibold mb-4">Upgrade your plan</h2>
          </div>
          <Tabs defaultValue="personal">
            <div className="flex justify-center space-x-4">
              <TabsList>
                <TabsTrigger value="personal">Personal</TabsTrigger>
                <TabsTrigger value="business">Business</TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="personal">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-8">
                {plans.map((plan) => {
                  const isCurrent = membership.type === plan.id;
                  return (
                    <Card
                      key={plan.id}
                      className={`flex flex-col justify-between min-h-[500px] px-6 py-8 ${
                        plan.bg
                      } ${isCurrent ? "ring-2 ring-emerald-600" : plan.border}`}
                    >
                      <div>
                        <CardHeader className="p-0 space-y-1 mb-4">
                          <h3 className="text-xl font-bold">{plan.title}</h3>
                          <p className="text-lg font-semibold">{plan.price}</p>
                          <p className="text-sm text-gray-700">
                            {plan.description}
                          </p>
                        </CardHeader>
                        {!isCurrent && !plan.disabled && (
                          <Button
                            className="w-full mt-6 bg-emerald-600 hover:bg-emerald-700 text-white"
                            onClick={() =>
                              handleUpgrade(plan.id as MembershipType)
                            }
                          >
                            {plan.cta}
                          </Button>
                        )}

                        {isCurrent && (
                          <Button
                            className="w-full mt-6"
                            variant="outline"
                            disabled
                          >
                            {plan.cta}
                          </Button>
                        )}
                        <CardContent className="space-y-4 p-0 mt-4">
                          <ul className="space-y-2 text-sm">
                            {plan.features.map((feature, idx) => (
                              <li
                                key={idx}
                                className="flex items-center gap-2 text-gray-800"
                              >
                                <FiCheck className="text-green-600" /> {feature}
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>
            <TabsContent value="business">
              <ContactSales />
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};
