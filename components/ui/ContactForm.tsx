"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Input from "./Input";
import Textarea from "./Textarea";
import Select from "./Select";
import Button from "./Button";

interface FormData {
  name: string;
  email: string;
  phone: string;
  experience: string;
  market: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  experience?: string;
}

type FormStatus = "idle" | "submitting" | "success" | "error";

export default function ContactForm({ className = "" }: { className?: string }) {
  const [data, setData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    experience: "",
    market: "",
    message: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<FormStatus>("idle");

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!data.name.trim()) newErrors.name = "Name is required";
    if (!data.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      newErrors.email = "Enter a valid email address";
    }
    if (!data.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^[\d\s\-\(\)\+]{7,}$/.test(data.phone)) {
      newErrors.phone = "Enter a valid phone number";
    }
    if (!data.experience) newErrors.experience = "Select your experience level";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setStatus("submitting");

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setStatus("success");
    setData({ name: "", email: "", phone: "", experience: "", market: "", message: "" });
  };

  const update = (field: keyof FormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setData((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className={`surface-float p-8 sm:p-10 ${className}`}>
      <AnimatePresence mode="wait">
        {status === "success" ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center gap-4 py-8 text-center"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 13l4 4L19 7" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-foreground" style={{ fontFamily: "Inter, sans-serif" }}>
              We&apos;ll Be in Touch
            </h3>
            <p className="max-w-sm text-sm text-muted">
              Thanks for reaching out. A member of our team will contact you within 24 hours to schedule your confidential conversation.
            </p>
            <Button
              variant="ghost"
              onClick={() => setStatus("idle")}
              className="mt-2"
            >
              Submit Another Inquiry
            </Button>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onSubmit={handleSubmit}
            noValidate
            className="flex flex-col gap-5"
          >
            <div>
              <h3 className="text-lg font-semibold text-foreground" style={{ fontFamily: "Inter, sans-serif" }}>
                Schedule a Confidential Conversation
              </h3>
              <p className="mt-1 text-sm text-muted">
                Tell us a bit about yourself and we&apos;ll reach out to set up a private call.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <Input
                label="Full Name"
                placeholder="Jane Smith"
                value={data.name}
                onChange={update("name")}
                error={errors.name}
                required
              />
              <Input
                label="Email"
                type="email"
                placeholder="jane@example.com"
                value={data.email}
                onChange={update("email")}
                error={errors.email}
                required
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <Input
                label="Phone"
                type="tel"
                placeholder="(512) 555-0123"
                value={data.phone}
                onChange={update("phone")}
                error={errors.phone}
                required
              />
              <Select
                label="Experience Level"
                value={data.experience}
                onChange={update("experience")}
                error={errors.experience}
                required
                options={[
                  { value: "new", label: "New to Real Estate (0-1 years)" },
                  { value: "developing", label: "Developing Agent (1-3 years)" },
                  { value: "experienced", label: "Experienced Agent (3-7 years)" },
                  { value: "top-producer", label: "Top Producer (7+ years)" },
                  { value: "team-leader", label: "Team Leader / Broker" },
                ]}
              />
            </div>

            <Input
              label="Current Market"
              placeholder="Austin, TX"
              value={data.market}
              onChange={update("market")}
            />

            <Textarea
              label="Anything else you'd like us to know?"
              placeholder="Tell us about your goals, current situation, or questions you have..."
              value={data.message}
              onChange={update("message")}
              rows={4}
            />

            <Button
              variant="primary"
              type="submit"
              disabled={status === "submitting"}
              className="mt-1 w-full sm:w-auto sm:self-end"
            >
              {status === "submitting" ? (
                <span className="flex items-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Sending...
                </span>
              ) : (
                "Send My Info"
              )}
            </Button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
