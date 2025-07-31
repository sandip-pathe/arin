import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FiMail, FiPhone, FiBriefcase, FiSend, FiUser } from "react-icons/fi";

export interface ContactSalesProps {
  onSubmit?: (data: {
    company: string;
    name: string;
    email: string;
    phone?: string;
    message: string;
  }) => Promise<void> | void;
}

export const ContactSales: React.FC<ContactSalesProps> = ({ onSubmit }) => {
  const [company, setCompany] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [challenges, setChallenges] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company || !name || !email || !message) {
      setError("Please fill in all required fields.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit?.({
        company,
        name,
        email,
        phone,
        message,
      });
      setDone(true);
    } catch (err: any) {
      setError(
        err?.message ||
          "Something went wrong. Please try again or email sales directly."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white">
      <div className="text-center">
        <h2 className="text-2xl font-semibold">
          Need more capabilities for your business?
        </h2>
        <p className="text-md text-gray-500 my-2">
          Speak with our team to tailor a plan that scales with your company.
        </p>
      </div>

      <Card className="bg-blue-100 p-6">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle className="text-lg font-semibold sr-only">
              Contact Sales
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            {done ? (
              <div className="px-4 py-6 bg-green-900 rounded-md text-green-200">
                <p className="font-medium">Thank you!</p>
                <p>Our sales team will reach out to you shortly.</p>
              </div>
            ) : (
              <>
                {error && (
                  <div className="px-4 py-3 bg-red-900 rounded-md text-red-200 text-sm">
                    {error}
                  </div>
                )}
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-1">
                    <Label className="flex items-center gap-2">
                      Your Name <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Input
                      placeholder="Your company or team"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      disabled={submitting}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label className="flex items-center gap-2">
                        Company Email Address{" "}
                        <span className="text-red-500 ml-1">*</span>
                      </Label>
                      <Input
                        placeholder="you@company.com"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={submitting}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="flex items-center gap-2">
                        Phone (with country code)
                      </Label>
                      <Input
                        placeholder="+1 (555) 123-4567"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        disabled={submitting}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="flex items-center gap-2">
                      What challenges are you looking to solve?
                    </Label>
                    <Input
                      placeholder="Describe your challenges"
                      value={challenges}
                      onChange={(e) => setChallenges(e.target.value)}
                      disabled={submitting}
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="flex items-center gap-2">
                      Message <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Textarea
                      placeholder="Tell us about your use case, team size, and goals"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      required
                      rows={5}
                      disabled={submitting}
                    />
                  </div>
                </div>
              </>
            )}
          </CardContent>

          {!done && (
            <CardFooter className="flex flex-col sm:flex-row justify-between items-center gap-3">
              <div className="text-xs text-gray-400">
                Prefer direct email?{" "}
                <a
                  className="underline hover:text-white"
                  href={`mailto:sales@yourdomain.com?subject=Business%20Plan%20Inquiry&body=Company:%20${encodeURIComponent(
                    company
                  )}%0AName:%20${encodeURIComponent(
                    name
                  )}%0AEmail:%20${encodeURIComponent(
                    email
                  )}%0APhone:%20${encodeURIComponent(
                    phone
                  )}%0AMessage:%20${encodeURIComponent(message)}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Email sales
                </a>
              </div>
              <Button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2"
              >
                <FiSend className="w-4 h-4" />
                {submitting ? "Submitting..." : "Contact Sales"}
              </Button>
            </CardFooter>
          )}
        </form>
      </Card>

      <div className="mt-4 text-center text-xs text-gray-500">
        <span>For large enterprises or custom contracts, </span>
        <span className="font-medium">request a demo</span>
      </div>
    </div>
  );
};
