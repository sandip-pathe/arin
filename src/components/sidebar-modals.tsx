"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";
import { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  FiSun,
  FiMoon,
  FiType,
  FiGlobe,
  FiHelpCircle,
  FiMessageSquare,
  FiUser,
  FiCreditCard,
  FiLock,
  FiMail,
  FiVolume2,
  FiBookOpen,
  FiStar,
  FiSend,
  FiSettings,
} from "react-icons/fi";
import { Separator } from "./ui/separator";
import { IoInformationCircle } from "react-icons/io5";

const mockUser = {
  name: "Sandeep",
  email: "sandeep@example.com",
  membershipType: "free", // free | pro | trial
  remainingSessions: 3,
  trialEndDate: "2025-08-24",
};

export const ShareModafa = () => {
  const [email, setEmail] = useState("");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const handleShare = () => {
    if (!email || selectedItems.length === 0) {
      alert("Please enter an email and select items to share.");
      return;
    }
    console.log("Sharing with:", email, "Items:", selectedItems);
    setEmail("");
    setSelectedItems([]);
  };

  return (
    <Card className="max-w-xl shadow-none mx-auto border-none overflow-hidden">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold text-gray-900">
          Share This Session
        </CardTitle>
        <p className="text-sm text-gray-500 mt-1">
          Securely grant access to colleagues, clients, or legal collaborators.
        </p>
      </CardHeader>

      <CardContent>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-4"
        >
          {/* Email Input */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-700">
              Recipient Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="e.g. paralegal@firm.com"
              className="py-2 px-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            {!email && (
              <span className="text-xs text-red-500">Email is required.</span>
            )}
          </div>

          {/* Content to Share */}
          <div className="space-y-2">
            <Label className="text-gray-700">Select Content to Share</Label>
            <p className="text-sm text-gray-500 mb-2">
              Only the selected components will be visible to the recipient.
            </p>
            <div className="space-y-3">
              {["Summary", "Chat", "Source Files"].map((item, idx) => (
                <motion.label
                  key={item}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex items-center gap-3 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                    checked={selectedItems.includes(item)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedItems([...selectedItems, item]);
                      } else {
                        setSelectedItems(
                          selectedItems.filter((i) => i !== item)
                        );
                      }
                    }}
                  />
                  <span className="text-gray-800">{item}</span>
                </motion.label>
              ))}
            </div>
            {selectedItems.length === 0 && (
              <span className="text-xs text-red-500">
                Please select at least one item to share.
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-2">
            <Button
              className="w-full py-4 text-base font-medium rounded-xl bg-blue-600 hover:bg-blue-700 transition-shadow shadow-sm"
              disabled={!email || selectedItems.length === 0}
              onClick={handleShare}
            >
              Share Session
            </Button>
            <p className="text-xs text-gray-500 mt-2 text-center">
              The recipient will receive a secure link via email.
            </p>
          </div>
        </motion.div>
      </CardContent>
    </Card>
  );
};

export const SettingsModal = () => {
  // General settings
  const [theme, setTheme] = useState<"light" | "dark" | "system">("light");
  const [fontSize, setFontSize] = useState(16);
  const [language, setLanguage] = useState("en-US");
  const [saveSession, setSaveSession] = useState(true);

  // Summary settings
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

  // Chat settings
  const [conversationStyle, setConversationStyle] = useState<
    "precise" | "balanced" | "creative"
  >("balanced");
  const [responseLength, setResponseLength] = useState<
    "short" | "medium" | "long"
  >("medium");
  const [autoSuggestions, setAutoSuggestions] = useState(true);
  const [speechFeedback, setSpeechFeedback] = useState(false);

  // Account settings
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [contact, setContact] = useState("");

  // Membership
  const [membershipPlan, setMembershipPlan] = useState<
    "free" | "premium" | "enterprise"
  >("free");

  // Initialize with saved settings
  useEffect(() => {
    const savedSettings = localStorage.getItem("appSettings");
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setTheme(settings.theme || "system");
      setFontSize(settings.fontSize || 16);
      setLanguage(settings.language || "en-US");
      setSaveSession(settings.saveSession !== false);

      setSummaryLength(settings.summary?.length || "medium");
      setComplexity(settings.summary?.complexity || "balanced");
      setTone(settings.summary?.tone || "professional");
      setStyle(settings.summary?.style || "detailed");

      setConversationStyle(settings.chat?.style || "balanced");
      setResponseLength(settings.chat?.length || "medium");
      setAutoSuggestions(settings.chat?.suggestions !== false);
      setSpeechFeedback(settings.chat?.speech || false);

      setName(settings.account?.name || "");
      setEmail(settings.account?.email || "");
      setContact(settings.account?.contact || "");

      setMembershipPlan(settings.membership?.plan || "free");
    }
  }, []);

  // Save settings to localStorage
  const saveSettings = () => {
    const settings = {
      theme,
      fontSize,
      language,
      saveSession,
      summary: {
        length: summaryLength,
        complexity,
        tone,
        style,
      },
      chat: {
        style: conversationStyle,
        length: responseLength,
        suggestions: autoSuggestions,
        speech: speechFeedback,
      },
      account: {
        name,
        email,
        contact,
      },
      membership: {
        plan: membershipPlan,
      },
    };

    localStorage.setItem("appSettings", JSON.stringify(settings));
  };

  // Apply theme to document
  useEffect(() => {
    if (
      theme === "dark" ||
      (theme === "system" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)
    ) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  // Apply font size to document
  useEffect(() => {
    document.documentElement.style.fontSize = `${fontSize}px`;
  }, [fontSize]);

  return (
    <Card className="border-0 max-w-3xl mx-auto">
      <CardHeader className="pb-4">
        <CardTitle className="text-2xl font-bold flex items-center gap-3">
          <FiSettings className="text-blue-600" />
          Application Settings
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-8 max-h-[70vh] overflow-y-auto pr-4">
        {/* General Settings */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          <div className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2 text-gray-800">
              <FiSun className="text-yellow-500" />
              General Settings
            </h3>

            <div className="space-y-4 pl-6">
              <div className="flex items-center justify-between">
                <Label className="text-gray-700 flex items-center gap-2">
                  <FiMoon className="text-indigo-600" />
                  Theme
                </Label>
                <Select value={theme} onValueChange={(v: any) => setTheme(v)}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System Default</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-gray-700 flex items-center gap-2">
                  <FiType className="text-green-600" />
                  Font Size
                </Label>
                <div className="flex items-center gap-4 w-40">
                  <Slider
                    value={[fontSize]}
                    min={12}
                    max={20}
                    step={1}
                    onValueChange={([val]) => setFontSize(val)}
                  />
                  <span className="text-sm w-8">{fontSize}px</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-gray-700 flex items-center gap-2">
                  <FiGlobe className="text-blue-500" />
                  Language
                </Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en-US">English (US)</SelectItem>
                    <SelectItem value="es-ES">Spanish</SelectItem>
                    <SelectItem value="fr-FR">French</SelectItem>
                    <SelectItem value="de-DE">German</SelectItem>
                    <SelectItem value="ja-JP">Japanese</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-gray-700 flex items-center gap-2">
                  <FiHelpCircle className="text-purple-600" />
                  Save Session Online
                </Label>
                <Switch
                  checked={saveSession}
                  onCheckedChange={setSaveSession}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Summary Settings */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2 text-gray-800">
              <FiBookOpen className="text-amber-500" />
              Summary Settings
            </h3>

            <div className="space-y-4 pl-6">
              <div className="space-y-2">
                <Label className="text-gray-700">Summary Length</Label>
                <div className="flex gap-4">
                  <Button
                    variant={summaryLength === "short" ? "default" : "outline"}
                    onClick={() => setSummaryLength("short")}
                  >
                    Short
                  </Button>
                  <Button
                    variant={summaryLength === "medium" ? "default" : "outline"}
                    onClick={() => setSummaryLength("medium")}
                  >
                    Medium
                  </Button>
                  <Button
                    variant={summaryLength === "long" ? "default" : "outline"}
                    onClick={() => setSummaryLength("long")}
                  >
                    Long
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-700">Complexity</Label>
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
                    <SelectItem value="advanced">
                      Advanced Terminology
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-700">Tone</Label>
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
                <Label className="text-gray-700">Style</Label>
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
            </div>
          </div>

          <Separator />

          {/* Chat Settings */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2 text-gray-800">
              <FiMessageSquare className="text-green-500" />
              Chat Settings
            </h3>

            <div className="space-y-4 pl-6">
              <div className="space-y-2">
                <Label className="text-gray-700">Conversation Style</Label>
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
                    <SelectItem value="creative">
                      Creative & Engaging
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-700">Response Length</Label>
                <div className="flex gap-4">
                  <Button
                    variant={responseLength === "short" ? "default" : "outline"}
                    onClick={() => setResponseLength("short")}
                  >
                    Short
                  </Button>
                  <Button
                    variant={
                      responseLength === "medium" ? "default" : "outline"
                    }
                    onClick={() => setResponseLength("medium")}
                  >
                    Medium
                  </Button>
                  <Button
                    variant={responseLength === "long" ? "default" : "outline"}
                    onClick={() => setResponseLength("long")}
                  >
                    Long
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-gray-700">Auto Suggestions</Label>
                <Switch
                  checked={autoSuggestions}
                  onCheckedChange={setAutoSuggestions}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-gray-700 flex items-center gap-2">
                  <FiVolume2 className="text-blue-500" />
                  Speech Feedback
                </Label>
                <Switch
                  checked={speechFeedback}
                  onCheckedChange={setSpeechFeedback}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Account Settings */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2 text-gray-800">
              <FiUser className="text-indigo-500" />
              Account Settings
            </h3>

            <div className="space-y-4 pl-6">
              <div className="space-y-2">
                <Label className="text-gray-700">Name</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-gray-700">Email</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-gray-700">Contact Number</Label>
                <Input
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Membership Settings */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2 text-gray-800">
              <FiCreditCard className="text-amber-500" />
              Membership
            </h3>

            <div className="space-y-4 pl-6">
              <div className="space-y-2">
                <Label className="text-gray-700">Current Plan</Label>
                <div className="flex gap-4">
                  <Button
                    variant={membershipPlan === "free" ? "default" : "outline"}
                    onClick={() => setMembershipPlan("free")}
                  >
                    Free
                  </Button>
                  <Button
                    variant={
                      membershipPlan === "premium" ? "default" : "outline"
                    }
                    onClick={() => setMembershipPlan("premium")}
                  >
                    Premium
                  </Button>
                  <Button
                    variant={
                      membershipPlan === "enterprise" ? "default" : "outline"
                    }
                    onClick={() => setMembershipPlan("enterprise")}
                  >
                    Enterprise
                  </Button>
                </div>
              </div>

              {membershipPlan === "free" && (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="font-medium text-blue-800 flex items-center gap-2">
                    <FiStar className="text-yellow-500" />
                    Upgrade to Premium
                  </h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Get unlimited features, priority support, and advanced AI
                    capabilities.
                  </p>
                  <Button className="mt-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                    Upgrade Now
                  </Button>
                </div>
              )}

              <div className="space-y-3">
                <Button
                  variant="link"
                  className="text-blue-600 px-0 flex items-center gap-2"
                >
                  <FiCreditCard className="h-4 w-4" />
                  Manage Subscription
                </Button>
                <Button
                  variant="link"
                  className="text-blue-600 px-0 flex items-center gap-2"
                >
                  <FiLock className="h-4 w-4" />
                  Restore Purchase
                </Button>
                <Button
                  variant="link"
                  className="text-blue-600 px-0 flex items-center gap-2"
                >
                  <FiMail className="h-4 w-4" />
                  Contact Sales Team
                </Button>
              </div>
            </div>
          </div>

          <Separator />

          {/* Privacy & Support */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2 text-gray-800">
              <FiLock className="text-gray-600" />
              Privacy & Support
            </h3>

            <div className="space-y-3 pl-6">
              <Button variant="link" className="text-blue-600 px-0">
                View Privacy Policy
              </Button>
              <Button variant="link" className="text-blue-600 px-0">
                Terms of Service
              </Button>
              <Button variant="link" className="text-blue-600 px-0">
                Help Center
              </Button>
              <Button variant="link" className="text-blue-600 px-0">
                Submit Feedback
              </Button>
            </div>
          </div>
        </motion.div>
      </CardContent>

      <CardFooter className="flex justify-end pt-6">
        <Button
          variant="outline"
          className="mr-3"
          onClick={() => {
            // Reset to default settings
            setTheme("system");
            setFontSize(16);
            setLanguage("en-US");
            setSaveSession(true);
            setSummaryLength("medium");
            setComplexity("balanced");
            setTone("professional");
            setStyle("detailed");
            setConversationStyle("balanced");
            setResponseLength("medium");
            setAutoSuggestions(true);
            setSpeechFeedback(false);
            setMembershipPlan("free");
          }}
        >
          Reset to Defaults
        </Button>
        <Button
          onClick={saveSettings}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
        >
          <FiSend className="mr-2" />
          Save Settings
        </Button>
      </CardFooter>
    </Card>
  );
};

export const ChatSettingsModal = () => (
  <Card className="border-0">
    <CardHeader className="pb-4">
      <CardTitle className="text-xl font-semibold">Settings</CardTitle>
    </CardHeader>
    <CardContent>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        <div className="space-y-4">
          <h3 className="font-medium text-gray-700">Chat Settings</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-gray-600">Light Mode</Label>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-gray-600">Save Session Online</Label>
              <Switch defaultChecked />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-medium text-gray-700">Summary Settings</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-gray-600">Tone</Label>
              <Select>
                <SelectTrigger className="w-full py-2 px-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500">
                  <SelectValue placeholder="Select tone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="casual">Casual</SelectItem>
                  <SelectItem value="technical">Technical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-600">Complexity</Label>
              <Select>
                <SelectTrigger className="w-full py-2 px-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500">
                  <SelectValue placeholder="Select complexity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="simple">Simple</SelectItem>
                  <SelectItem value="detailed">Detailed</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label className="text-gray-600">Summary Length</Label>
              <div className="px-2">
                <Slider
                  defaultValue={[2]}
                  max={3}
                  min={1}
                  step={1}
                  className="[&>span:first-child]:h-2"
                />
              </div>
              <div className="flex justify-between text-sm text-gray-500 px-1">
                <span>Short</span>
                <span>Medium</span>
                <span>Long</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-medium text-gray-700">Privacy</h3>
          <div className="space-y-3">
            <Button variant="link" className="text-blue-600 px-0">
              View Privacy Policy
            </Button>
            <Button variant="link" className="text-blue-600 px-0">
              Submit Feedback
            </Button>
          </div>
        </div>
      </motion.div>
    </CardContent>
  </Card>
);

export const SummarySettingsModal = () => (
  <Card className="border-0">
    <CardHeader className="pb-4">
      <CardTitle className="text-xl font-semibold">Settings</CardTitle>
    </CardHeader>
    <CardContent>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        <div className="space-y-4">
          <h3 className="font-medium text-gray-700">Chat Settings</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-gray-600">Light Mode</Label>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-gray-600">Save Session Online</Label>
              <Switch defaultChecked />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-medium text-gray-700">Summary Settings</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-gray-600">Tone</Label>
              <Select>
                <SelectTrigger className="w-full py-2 px-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500">
                  <SelectValue placeholder="Select tone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="casual">Casual</SelectItem>
                  <SelectItem value="technical">Technical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-600">Complexity</Label>
              <Select>
                <SelectTrigger className="w-full py-2 px-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500">
                  <SelectValue placeholder="Select complexity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="simple">Simple</SelectItem>
                  <SelectItem value="detailed">Detailed</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label className="text-gray-600">Summary Length</Label>
              <div className="px-2">
                <Slider
                  defaultValue={[2]}
                  max={3}
                  min={1}
                  step={1}
                  className="[&>span:first-child]:h-2"
                />
              </div>
              <div className="flex justify-between text-sm text-gray-500 px-1">
                <span>Short</span>
                <span>Medium</span>
                <span>Long</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-medium text-gray-700">Privacy</h3>
          <div className="space-y-3">
            <Button variant="link" className="text-blue-600 px-0">
              View Privacy Policy
            </Button>
            <Button variant="link" className="text-blue-600 px-0">
              Submit Feedback
            </Button>
          </div>
        </div>
      </motion.div>
    </CardContent>
  </Card>
);

export const AccountModal = () => (
  <Card className="border-0">
    <CardHeader className="pb-4">
      <CardTitle className="text-xl font-semibold">Account</CardTitle>
    </CardHeader>
    <CardContent>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        <div className="flex items-center gap-4">
          <Avatar className="h-14 w-14 border-2 border-blue-500">
            <AvatarFallback className="text-lg">
              {mockUser.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-semibold text-lg">{mockUser.name}</div>
            <div className="text-gray-600">{mockUser.email}</div>
          </div>
        </div>

        <div className="space-y-4 pt-2 border-t border-gray-200">
          <h3 className="font-medium text-gray-700">Membership</h3>
          {mockUser.membershipType === "free" ? (
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="font-medium text-red-700">Free Member</div>
                <div className="text-sm text-red-600">
                  {mockUser.remainingSessions} of 5 sessions remaining
                </div>
              </div>
              <Button
                className={cn(
                  "w-full py-5 rounded-xl text-lg bg-gradient-to-r from-amber-400 to-orange-500",
                  "hover:from-amber-500 hover:to-orange-600 shadow-md relative overflow-hidden"
                )}
              >
                <span className="relative z-10">✨ Upgrade to Pro</span>
                <span className="ml-3 bg-white text-orange-600 text-xs font-bold px-2 py-1 rounded-full z-10">
                  50% OFF
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white opacity-20"></div>
              </Button>
            </div>
          ) : mockUser.membershipType === "trial" ? (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="font-medium text-blue-700">Pro Trial</div>
                <div className="text-sm text-blue-600">
                  Ends on {mockUser.trialEndDate}
                </div>
              </div>
              <Button className="w-full py-5 rounded-xl text-lg bg-blue-600 hover:bg-blue-700 shadow-md">
                Subscribe Now
              </Button>
            </div>
          ) : (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="font-medium text-green-700">Pro Member</div>
              <div className="text-sm text-green-600">Active subscription</div>
            </div>
          )}
        </div>
      </motion.div>
    </CardContent>
  </Card>
);
