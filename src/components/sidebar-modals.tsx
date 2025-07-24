"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

const mockUser = {
  name: "Sandeep",
  email: "sandeep@example.com",
  membershipType: "free", // free | pro | trial
  remainingSessions: 3,
  trialEndDate: "2025-08-24",
};

// Modal Components with improved styling
export const HomeModal = () => (
  <Card className="border-0">
    <CardHeader className="pb-4">
      <CardTitle className="text-xl font-semibold">
        Session Management
      </CardTitle>
    </CardHeader>
    <CardContent>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        <Button className="w-full py-6 rounded-xl text-lg bg-blue-600 hover:bg-blue-700 shadow-md">
          Start New Session
        </Button>

        <div className="space-y-3">
          <h3 className="font-medium text-gray-700">Session History</h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {[1, 2, 3].map((item) => (
              <motion.div
                key={item}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: item * 0.1 }}
                className="p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 cursor-pointer transition-colors"
              >
                <div className="font-medium">Session {item}</div>
                <div className="text-sm text-gray-500">
                  July {20 + item}, 2025 - 45 min
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </CardContent>
  </Card>
);

export const ShareModal = () => (
  <Card className="border-0">
    <CardHeader className="pb-4">
      <CardTitle className="text-xl font-semibold">Share Session</CardTitle>
    </CardHeader>
    <CardContent>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-5"
      >
        <div className="space-y-2">
          <Label htmlFor="email" className="text-gray-700">
            Recipient Email
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="name@example.com"
            className="py-2 px-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="space-y-3">
          <Label className="text-gray-700">Share Content</Label>
          <div className="space-y-3">
            {["Summary", "Chat", "Source Files"].map((item, idx) => (
              <motion.div
                key={item}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-center gap-3"
              >
                <div className="h-5 w-5 flex items-center justify-center rounded border border-gray-300">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 rounded"
                  />
                </div>
                <span>{item}</span>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-gray-700">Access Type</Label>
          <Select>
            <SelectTrigger className="w-full py-2 px-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500">
              <SelectValue placeholder="Select access type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="view">View Only</SelectItem>
              <SelectItem value="edit">Can Edit</SelectItem>
              <SelectItem value="admin">Admin Access</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button className="w-full py-5 rounded-xl text-lg bg-blue-600 hover:bg-blue-700 shadow-md mt-4">
          Share Session
        </Button>
      </motion.div>
    </CardContent>
  </Card>
);

export const SettingsModal = () => (
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
          <h3 className="font-medium text-gray-700">General Settings</h3>
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
