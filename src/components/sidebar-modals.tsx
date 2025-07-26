"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiCreditCard,
  FiLock,
  FiStar,
  FiSend,
  FiAward,
  FiZap,
} from "react-icons/fi";
import { useAuth } from "@/contexts/auth-context";
import { getFirestore, doc, updateDoc, Timestamp } from "firebase/firestore";
import { cn } from "@/lib/utils";
import { Separator } from "./ui/separator";
import { Badge } from "./ui/badge";

// 1. Summary Settings Component
export const SummarySettings = () => {
  const [summaryLength, setSummaryLength] = useState<
    "short" | "medium" | "long"
  >("medium");
  const [complexity, setComplexity] = useState<
    "simple" | "balanced" | "advanced"
  >("balanced");
  const [tone, setTone] = useState<
    "professional" | "formal" | "casual" | "technical"
  >("professional");
  const [style, setStyle] = useState<"concise" | "detailed" | "bullet">(
    "detailed"
  );

  const { settings, updateSettings } = useAuth();

  const handleSave = () => {
    updateSettings({
      summary: {
        length: summaryLength,
        complexity,
        tone,
        style,
      },
    });
  };

  return (
    <Card className="border-0">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">
          Summary Settings
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Summary Length</Label>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={summaryLength === "short" ? "default" : "outline"}
              onClick={() => setSummaryLength("short")}
            >
              Short
            </Button>
            <Button
              size="sm"
              variant={summaryLength === "medium" ? "default" : "outline"}
              onClick={() => setSummaryLength("medium")}
            >
              Medium
            </Button>
            <Button
              size="sm"
              variant={summaryLength === "long" ? "default" : "outline"}
              onClick={() => setSummaryLength("long")}
            >
              Long
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Complexity</Label>
          <Select
            value={complexity}
            onValueChange={(v: any) => setComplexity(v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select complexity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="simple">Simple Language</SelectItem>
              <SelectItem value="balanced">Balanced</SelectItem>
              <SelectItem value="advanced">Advanced Terminology</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Tone</Label>
          <Select value={tone} onValueChange={(v: any) => setTone(v)}>
            <SelectTrigger>
              <SelectValue placeholder="Select tone" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="professional">Professional</SelectItem>
              <SelectItem value="formal">Formal</SelectItem>
              <SelectItem value="casual">Casual</SelectItem>
              <SelectItem value="technical">Technical</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Style</Label>
          <Select value={style} onValueChange={(v: any) => setStyle(v)}>
            <SelectTrigger>
              <SelectValue placeholder="Select style" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="concise">Concise</SelectItem>
              <SelectItem value="detailed">Detailed</SelectItem>
              <SelectItem value="bullet">Bullet Points</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button onClick={handleSave}>
          <FiSend className="mr-2" />
          Save Changes
        </Button>
      </CardFooter>
    </Card>
  );
};

// 2. Chat Settings Component
export const ChatSettings = () => {
  const { updateSettings } = useAuth();
  const [conversationStyle, setConversationStyle] = useState<
    "precise" | "balanced" | "creative"
  >("balanced");
  const [responseLength, setResponseLength] = useState<
    "short" | "medium" | "long"
  >("medium");
  const [autoSuggestions, setAutoSuggestions] = useState(true);

  const handleSave = () => {
    updateSettings({
      chat: {
        conversationStyle,
        responseLength,
        autoSuggestions,
      },
    });
  };

  return (
    <Card className="border-0">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Chat Settings</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Conversation Style</Label>
          <Select
            value={conversationStyle}
            onValueChange={(v: any) => setConversationStyle(v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select style" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="precise">Precise & Factual</SelectItem>
              <SelectItem value="balanced">Balanced</SelectItem>
              <SelectItem value="creative">Creative & Engaging</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Response Length</Label>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={responseLength === "short" ? "default" : "outline"}
              onClick={() => setResponseLength("short")}
            >
              Short
            </Button>
            <Button
              size="sm"
              variant={responseLength === "medium" ? "default" : "outline"}
              onClick={() => setResponseLength("medium")}
            >
              Medium
            </Button>
            <Button
              size="sm"
              variant={responseLength === "long" ? "default" : "outline"}
              onClick={() => setResponseLength("long")}
            >
              Long
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <Label>Auto Suggestions</Label>
          <Switch
            checked={autoSuggestions}
            onCheckedChange={setAutoSuggestions}
          />
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button onClick={handleSave}>
          <FiSend className="mr-2" />
          Save Changes
        </Button>
      </CardFooter>
    </Card>
  );
};

// 3. Account Settings Component
export const AccountSettings = () => {
  const { user } = useAuth();
  const [name, setName] = useState(user?.displayName);
  const [contact, setContact] = useState(user?.phoneNumber);

  const handleSave = async () => {
    try {
      if (!user?.uid) return;
      const db = getFirestore();
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        displayName: name,
        phoneNumber: contact,
      });
      console.log("Account info updated in Firestore:", { name, contact });
    } catch (error) {
      console.error("Error updating account info:", error);
    }
  };

  return (
    <Card className="border-0">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">
          Account Settings
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <FiUser className="text-indigo-500" />
            Name
          </Label>
          <Input
            value={name || ""}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your full name"
          />
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <FiPhone className="text-green-500" />
            Contact Number
          </Label>
          <Input
            value={contact || ""}
            onChange={(e) => setContact(e.target.value)}
            placeholder={"Your phone number"}
          />
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <FiMail className="text-blue-500" />
            Email
          </Label>
          <p>{user?.email}</p>
        </div>
      </CardContent>

      <CardFooter className="flex justify-end">
        <Button onClick={handleSave}>
          <FiSend className="mr-2" />
          Save Changes
        </Button>
      </CardFooter>
    </Card>
  );
};

// 4. Membership Settings Component
export const MembershipSettings = () => {
  const { dbUser } = useAuth();

  const membershipPlan = dbUser?.membershipType || "trial";
  const membershipSince = dbUser?.membershipSince || "2024-12-01";
  const lastDiscount = dbUser?.lastDiscountCode || "SUMMER25";

  const handleUpgrade = (targetPlan: string) => {
    console.log("Starting upgrade process to:", targetPlan);
  };

  const plans = [
    {
      id: "trial",
      title: "Trial",
      icon: <FiZap className="text-yellow-500" size={22} />,
      price: "Free for 7 days",
      description: "Explore all features with limited AI usage.",
      features: ["Basic tools", "Limited AI access", "Upgrade anytime"],
      cta: "Start Trial",
      gradient: "from-yellow-100 to-yellow-50",
    },
    {
      id: "plus",
      title: "Plus",
      icon: <FiStar className="text-blue-600" size={22} />,
      price: "$24.99 / month",
      description: "Unlock all features and advanced AI capabilities.",
      features: ["Priority AI access", "Project tools", "Community"],
      cta: "Upgrade to Plus",
      gradient: "from-blue-100 to-blue-50",
    },
    {
      id: "pro",
      title: "Pro",
      icon: <FiAward className="text-purple-600" size={22} />,
      price: "$99.99 / month",
      description: "Maximum power with enterprise-grade access.",
      features: ["All Plus features", "Team tools", "Advanced insights"],
      cta: "Upgrade to Pro",
      gradient: "from-purple-100 to-purple-50",
    },
  ];

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-none">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">
            Membership Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>
            <strong>Current Plan:</strong>{" "}
            <Badge variant="outline" className="capitalize">
              {membershipPlan}
            </Badge>
          </p>
          <p>
            <strong>Member Since:</strong> {membershipSince}
          </p>
          <p>
            <strong>Last Discount Used:</strong> {lastDiscount}
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plans.map((plan) => (
          <Card
            key={plan.id}
            className={`transition hover:shadow-lg border ${
              membershipPlan === plan.id ? "ring-2 ring-blue-500" : ""
            } bg-gradient-to-br ${plan.gradient}`}
          >
            <CardHeader className="flex flex-col items-start space-y-1">
              <div className="flex items-center gap-2">
                {plan.icon}
                <h3 className="text-lg font-semibold">{plan.title}</h3>
                {membershipPlan === plan.id && (
                  <Badge variant="secondary" className="text-xs">
                    Current
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {plan.description}
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="font-medium text-gray-800">{plan.price}</p>
              <ul className="list-disc pl-5 text-xs text-gray-600 space-y-1">
                {plan.features.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
              {membershipPlan !== plan.id && (
                <Button
                  className="w-full mt-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
                  onClick={() => handleUpgrade(plan.id)}
                >
                  {plan.cta}
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
