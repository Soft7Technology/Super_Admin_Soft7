"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

import { axiosInstance } from "@/lib/axiosInstance";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { Eye, EyeOff, ArrowLeft, AlertCircle } from "lucide-react";

import "../manage-companies.css";

export default function CreateCompanyPage() {
  const router = useRouter();

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
    <div className="mc-root">
      {/* HEADER */}
      <div className="mc-header">
        <div>
          <button
            type="button"
            onClick={() => router.back()}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "transparent",
              border: "none",
              color: "var(--mc-muted)",
              cursor: "pointer",
              padding: 0,
              marginBottom: 10,
              fontSize: 13,
            }}
          >
            <ArrowLeft size={16} />
            Back to Companies
          </button>

          <h1 className="mc-header__title">Create Company</h1>

          <p className="mc-header__sub">
            Create a new company and its administrator.
          </p>
        </div>
      </div>

      <div
        style={{
          maxWidth: 1000,
          margin: "0 auto",
        }}
      >
        {err && (
          <div
            className="mc-error-banner"
            role="alert"
            style={{ marginBottom: 20 }}
          >
            <AlertCircle size={18} className="mc-error-banner__icon" />

            <span className="mc-error-banner__text">{err}</span>

            <button
              type="button"
              className="mc-error-banner__close"
              onClick={() => setErr(null)}
            >
              ×
            </button>
          </div>
        )}

        {/* COMPANY DETAILS */}
        <div
          className="mc-modal"
          style={{
            width: "100%",
            maxWidth: "none",
          }}
        >
          <div className="mc-modal__header">
            <div>
              <div className="mc-modal__title">Company Details</div>

              <div className="mc-modal__sub">
                Enter the basic company information.
              </div>
            </div>
          </div>

          <div className="mc-modal__body">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: 18,
              }}
            >
              <div className="mc-field">
                <div className="mc-field__label">COMPANY NAME *</div>

                <input
                  className="mc-input"
                  placeholder="Example Company"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="mc-field">
                <div className="mc-field__label">COMPANY EMAIL *</div>

                <input
                  className="mc-input"
                  type="email"
                  placeholder="company@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="mc-field">
                <div className="mc-field__label">COMPANY PHONE *</div>

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
                  inputStyle={{
                    width: "100%",
                    height: "48px",
                    background: "#12182b",
                    color: "#fff",
                    border: "1px solid #2c3657",
                    borderRadius: "10px",
                    paddingLeft: "55px",
                  }}
                  buttonStyle={{
                    background: "#12182b",
                    border: "1px solid #2c3657",
                    borderRadius: "10px 0 0 10px",
                  }}
                  dropdownStyle={{
                    background: "#1b2338",
                    color: "#fff",
                    border: "1px solid #2c3657",
                    maxHeight: "250px",
                  }}
                />
              </div>

              <div className="mc-field">
                <div className="mc-field__label">BUSINESS ID *</div>

                <input
                  className="mc-input"
                  placeholder="BUSINESS123"
                  value={businessId}
                  onChange={(e) => setBusinessId(e.target.value)}
                />
              </div>
            </div>

            <div className="mc-field">
              <div className="mc-field__label">REASON *</div>

              <textarea
                className="mc-input"
                placeholder="Approved company onboarding"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={4}
                style={{
                  resize: "vertical",
                  minHeight: 100,
                }}
              />
            </div>
          </div>
        </div>

        {/* COMPANY ADMIN */}
        <div
          className="mc-modal"
          style={{
            width: "100%",
            maxWidth: "none",
            marginTop: 20,
          }}
        >
          <div className="mc-modal__header">
            <div>
              <div className="mc-modal__title">Company Admin</div>

              <div className="mc-modal__sub">
                Create the administrator account for this company.
              </div>
            </div>
          </div>

          <div className="mc-modal__body">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: 18,
              }}
            >
              <div className="mc-field">
                <div className="mc-field__label">ADMIN NAME *</div>

                <input
                  className="mc-input"
                  placeholder="Company Admin"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                />
              </div>

              <div className="mc-field">
                <div className="mc-field__label">ADMIN EMAIL *</div>

                <input
                  className="mc-input"
                  type="email"
                  placeholder="admin@example.com"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                />
              </div>

              <div className="mc-field">
                <div className="mc-field__label">ADMIN PHONE *</div>

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
                  inputStyle={{
                    width: "100%",
                    height: "48px",
                    background: "#12182b",
                    color: "#fff",
                    border: "1px solid #2c3657",
                    borderRadius: "10px",
                    paddingLeft: "55px",
                  }}
                  buttonStyle={{
                    background: "#12182b",
                    border: "1px solid #2c3657",
                    borderRadius: "10px 0 0 10px",
                  }}
                  dropdownStyle={{
                    background: "#1b2338",
                    color: "#fff",
                    border: "1px solid #2c3657",
                    maxHeight: "250px",
                  }}
                />
              </div>

              <div className="mc-field">
                <div className="mc-field__label">PASSWORD *</div>

                <div
                  style={{
                    position: "relative",
                  }}
                >
                  <input
                    className="mc-input"
                    type={showPassword ? "text" : "password"}
                    placeholder="Min 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{
                      paddingRight: 48,
                    }}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    style={{
                      position: "absolute",
                      right: 12,
                      top: "50%",
                      transform: "translateY(-50%)",
                      border: "none",
                      background: "transparent",
                      color: "#9ca3af",
                      cursor: "pointer",
                    }}
                  >
                    {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                  </button>
                </div>
              </div>
            </div>

            <div className="mc-modal__divider" />

            <div
              className="mc-modal__actions"
              style={{
                justifyContent: "flex-end",
              }}
            >
              <button
                type="button"
                className="mc-btn mc-btn--ghost"
                onClick={() => router.back()}
                style={{
                  width: "auto",
                  minWidth: 100,
                  padding: "9px 16px",
                  flex: "0 0 auto",
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                className="mc-btn mc-btn--primary"
                onClick={handleSubmit}
                disabled={saving}
                style={{
                  width: "auto",
                  minWidth: 130,
                  padding: "9px 16px",
                  flex: "0 0 auto",
                }}
              >
                {saving ? "Creating…" : "Create Company"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        theme="dark"
      />
    </div>
  );
}
