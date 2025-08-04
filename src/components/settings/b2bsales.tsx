// ContactSales.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth-context";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export interface ContactSalesProps {
  onSubmit?: (data: {
    company: string;
    name: string;
    email: string;
    phone?: string;
    message: string;
    companySize?: string;
    timeline?: string;
    leadId?: string;
  }) => Promise<void> | void;
}

export const ContactSales: React.FC<ContactSalesProps> = ({ onSubmit }) => {
  const { dbUser } = useAuth();
  const [company, setCompany] = useState("");
  const [name, setName] = useState(dbUser?.displayName || "");
  const [email, setEmail] = useState(dbUser?.email || "");
  const [phone, setPhone] = useState(dbUser?.phoneNumber || "");
  const [message, setMessage] = useState("");
  const [companySize, setCompanySize] = useState("");
  const [timeline, setTimeline] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !company) {
      setError("Please fill in all required fields.");
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      const db = getFirestore();
      const docRef = await addDoc(collection(db, "sales_leads"), {
        company: company.trim(),
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim() || null,
        companySize: companySize.trim() || null,
        timeline: timeline.trim() || null,
        message: message.trim(),
        status: "new",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        source: "contact_sales_form",
      });

      await onSubmit?.({
        company,
        name,
        email,
        phone,
        message,
        companySize,
        timeline,
        leadId: docRef.id,
      });

      if (toast) {
        toast({
          title: "Request submitted successfully!",
          description: "A sales representative will call you soon.",
        });
      }

      setDone(true);
    } catch (err: any) {
      console.error("Submission error:", err);
      setError(err?.message || "Failed to submit. Please try again later.");
    } finally {
      setSubmitting(false);
    }
  };

  const calendlyLink = `https://calendly.com/your-sales-team/30min?name=${encodeURIComponent(
    name
  )}&email=${encodeURIComponent(email)}&a1=${encodeURIComponent(company)}`;

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Schedule Your Business Consultation
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Speak directly with our sales team to find the perfect solution for
          your business needs.
        </p>
      </div>

      {done ? (
        <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
          <div className="text-green-600 text-5xl mb-4">✓</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Thank you, {name || "there"}!
          </h2>
          <p className="text-lg text-gray-700 mb-6">
            Our sales team will contact you within 24 hours at{" "}
            <span className="font-semibold">{email}</span>. We look forward to
            discussing your business needs.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button
              size="lg"
              onClick={() => setDone(false)}
              className="bg-indigo-600 hover:bg-indigo-700 text-lg"
            >
              Submit Another Request
            </Button>
            <Button variant="outline" size="lg" asChild>
              <a href={calendlyLink} target="_blank" className="text-lg">
                Schedule Immediate Call
              </a>
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
              {error}
            </div>
          )}

          <div className="space-y-8">
            <div>
              <Label className="text-lg font-medium text-gray-900 mb-2 block">
                Your Full Name <span className="text-red-500">*</span>
              </Label>
              <Input
                placeholder="John Smith"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-14 text-lg px-4"
                required
              />
            </div>

            <div>
              <Label className="text-lg font-medium text-gray-900 mb-2 block">
                Company Name <span className="text-red-500">*</span>
              </Label>
              <Input
                placeholder="Your company"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="h-14 text-lg px-4"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="text-lg font-medium text-gray-900 mb-2 block">
                  Business Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  placeholder="you@company.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-14 text-lg px-4"
                  required
                />
              </div>
              <div>
                <Label className="text-lg font-medium text-gray-900 mb-2 block">
                  Phone Number
                </Label>
                <Input
                  placeholder="(123) 456-7890"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="h-14 text-lg px-4"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="text-lg font-medium text-gray-900 mb-2 block">
                  Company Size
                </Label>
                <select
                  value={companySize}
                  onChange={(e) => setCompanySize(e.target.value)}
                  className="w-full h-14 text-lg px-4 border rounded-md border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                >
                  <option value="">Select size</option>
                  <option value="1-10">1-10 employees</option>
                  <option value="11-50">11-50 employees</option>
                  <option value="51-200">51-200 employees</option>
                  <option value="201-500">201-500 employees</option>
                  <option value="501+">501+ employees</option>
                </select>
              </div>
              <div>
                <Label className="text-lg font-medium text-gray-900 mb-2 block">
                  Implementation Timeline
                </Label>
                <select
                  value={timeline}
                  onChange={(e) => setTimeline(e.target.value)}
                  className="w-full h-14 text-lg px-4 border rounded-md border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                >
                  <option value="">Select timeline</option>
                  <option value="immediately">Immediately</option>
                  <option value="1-3 months">1-3 months</option>
                  <option value="3-6 months">3-6 months</option>
                  <option value="6+ months">6+ months</option>
                </select>
              </div>
            </div>

            <div>
              <Label className="text-lg font-medium text-gray-900 mb-2 block">
                Business Requirements
              </Label>
              <Textarea
                placeholder="Tell us about your specific needs, challenges, and what you're looking to achieve..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
                className="text-lg p-4"
              />
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row justify-between gap-4">
            <p className="text-gray-600 text-base">
              By submitting, you agree to our{" "}
              <a href="/privacy" className="text-indigo-600 hover:underline">
                Privacy Policy
              </a>
            </p>
            <Button
              type="submit"
              size="lg"
              disabled={submitting}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-lg px-8 py-6"
            >
              {submitting ? "Scheduling Your Call..." : "Schedule Sales Call"}
            </Button>
          </div>
        </form>
      )}

      <div className="mt-10 text-center border-t pt-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Prefer to schedule immediately?
        </h3>
        <p className="text-gray-600 mb-4">
          Book directly on our calendar for a guaranteed time slot
        </p>
        <Button variant="outline" size="lg" asChild>
          <a href={calendlyLink} target="_blank" className="text-lg">
            View Available Times
          </a>
        </Button>
      </div>
    </div>
  );
};
