"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

import { axiosInstance } from "@/lib/axiosInstance";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { ArrowLeft, Building2, Eye, EyeOff, Plus, UserCog } from "lucide-react";

import { PageContainer, PageHeader } from "@/components/layout";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import Field from "@/components/ui/Field";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import { useTheme } from "@/context/ThemeContext";
import { phoneButtonStyle, phoneDropdownStyle, phoneInputStyle } from "../phoneInputStyles";

export default function CreateCompanyPage() {
  const router = useRouter();
  const { isDark } = useTheme();


  // Company
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [businessId, setBusinessId] = useState("");
  const [reason, setReason] = useState("");

  // Admin
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  //phone validatn
  const [phone, setPhone] = useState("");
  const [adminPhone, setAdminPhone] = useState("");

  const [phoneValid, setPhoneValid] = useState(false);
  const [adminPhoneValid, setAdminPhoneValid] = useState(false);

  const handleSubmit = async () => {
    setErr(null);

    // Company validation
    if (!name.trim()) {
      setErr("Company name is required.");
      return;
    }

    if (!email.trim()) {
      setErr("Company email is required.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email.trim())) {
      setErr("Please enter a valid company email.");
      return;
    }

    if (!phone.trim()) {
      setErr("Company phone is required.");
      return;
    }

    if (!phoneValid) {
      setErr("Please enter a valid company phone number.");
      return;
    }

    if (!businessId.trim()) {
      setErr("Business ID is required.");
      return;
    }

    if (!reason.trim()) {
      setErr("Reason is required.");
      return;
    }

  
    if (!adminName.trim()) {
      setErr("Admin name is required.");
      return;
    }

    if (!adminEmail.trim()) {
      setErr("Admin email is required.");
      return;
    }

    if (!emailRegex.test(adminEmail.trim())) {
      setErr("Please enter a valid admin email.");
      return;
    }

   if (!adminPhone.trim()) {
     setErr("Admin phone is required.");
     return;
   }

   if (!adminPhoneValid) {
     setErr("Please enter a valid admin phone number.");
     return;
   }

    if (!password.trim()) {
      setErr("Admin password is required.");
      return;
    }

    if (password.length < 8) {
      setErr("Password must be at least 8 characters.");
      return;
    }

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!passwordRegex.test(password)) {
      setErr(
        "Password must contain uppercase, lowercase, number and special character.",
      );
      return;
    }

    const payload = {
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      business_id: businessId.trim(),
      user: {
        name: adminName.trim(),
        email: adminEmail.trim(),
        phone: adminPhone.trim(),
        password,
      },
      reason: reason.trim(),
    };

    try {
      setSaving(true);

      console.log("CREATE COMPANY PAYLOAD =>", payload);

      const response = await axiosInstance.post(
        "/v1/super-admin/companies",
        payload,
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      const data = response.data;

      console.log("CREATE COMPANY RESPONSE =>", data);

      if (!data?.success) {
        setErr(
          data?.error?.message || data?.message || "Failed to create company.",
        );
        return;
      }

      toast.success("Company created successfully");

      setTimeout(() => {
        router.push("/user/manage-companies");
      }, 700);
    } catch (error: any) {
      console.error("CREATE COMPANY ERROR =>", error);

      setErr(
        error?.response?.data?.message ||
          error?.response?.data?.error?.message ||
          error?.message ||
          "Failed to create company.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageContainer width="narrow">
      <Button
        variant="ghost"
        size="sm"
        className="-ml-2 mb-3"
        leftIcon={<ArrowLeft size={15} />}
        onClick={() => router.back()}
      >
        Back to Companies
      </Button>
      <PageHeader
        title="Create Company"
        description="Create a new company and its administrator."
      />

      {err && (
        <Alert
          variant="error"
          className="mb-4"
          message={err}
          onClose={() => setErr(null)}
        />
      )}

      <div className="space-y-4">
        {/* COMPANY DETAILS */}
        <Card>
          <CardHeader
            icon={Building2}
            title="Company Details"
            description="Enter the basic company information."
            divided
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Company Name"
              required
              placeholder="Example Company"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <Input
              label="Company Email"
              required
              type="email"
              placeholder="company@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <Field label="Company Phone" required>
              <PhoneInput
                country="in"
                value={phone}
                onChange={setPhone}
                enableSearch
                searchPlaceholder="Search country..."
                placeholder="Enter phone number"
                isValid={(value) => {
                  const valid = value.replace(/\D/g, "").length >= 10;
                  setPhoneValid(valid);
                  return valid;
                }}
                inputStyle={phoneInputStyle}
                buttonStyle={phoneButtonStyle}
                dropdownStyle={phoneDropdownStyle}
              />
            </Field>

            <Input
              label="Business ID"
              required
              placeholder="BUSINESS123"
              value={businessId}
              onChange={(e) => setBusinessId(e.target.value)}
            />

            <Textarea
              wrapperClassName="sm:col-span-2"
              label="Reason"
              required
              placeholder="Approved company onboarding"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              className="min-h-[100px] resize-y"
            />
          </div>
        </Card>

        {/* COMPANY ADMIN */}
        <Card>
          <CardHeader
            icon={UserCog}
            title="Company Admin"
            description="Create the administrator account for this company."
            divided
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Admin Name"
              required
              placeholder="Company Admin"
              value={adminName}
              onChange={(e) => setAdminName(e.target.value)}
            />

            <Input
              label="Admin Email"
              required
              type="email"
              placeholder="admin@example.com"
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
            />

            <Field label="Admin Phone" required>
              <PhoneInput
                country="in"
                value={adminPhone}
                onChange={setAdminPhone}
                enableSearch
                searchPlaceholder="Search country..."
                placeholder="Enter phone number"
                isValid={(value) => {
                  const valid = value.replace(/\D/g, "").length >= 10;
                  setAdminPhoneValid(valid);
                  return valid;
                }}
                inputStyle={phoneInputStyle}
                buttonStyle={phoneButtonStyle}
                dropdownStyle={phoneDropdownStyle}
              />
            </Field>

            <Input
              label="Password"
              required
              type={showPassword ? "text" : "password"}
              placeholder="Min 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="pointer-events-auto flex items-center text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
            />
          </div>
        </Card>

        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} isLoading={saving} leftIcon={<Plus size={15} />}>
            Create Company
          </Button>
        </div>
      </div>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        theme={isDark ? "dark" : "light"}
      />
    </PageContainer>
  );
}
