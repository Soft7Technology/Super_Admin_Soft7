/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { createElement, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Phone, Lock, User, Mail, Eye, EyeOff, Shield, Key } from "lucide-react";
import { useRouter } from "next/navigation";
import { gsap } from 'gsap'
import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axiosInstance";
import toast from "react-hot-toast";

type AuthView = "login" | "register" | "forgot";
type ForgotStep = "request" | "verify" | "reset";

// Custom hook for responsive design
const useMediaQuery = (query: string) => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const media = window.matchMedia(query);
      if (media.matches !== matches) {
        setMatches(media.matches);
      }
      const listener = (e: MediaQueryListEvent) => setMatches(e.matches);
      media.addEventListener("change", listener);
      return () => media.removeEventListener("change", listener);
    }
  }, [matches, query]);

  return matches;
};

function maskEmail(email: string) {
  if (!email || !email.includes("@")) return email;

  const [name, domain] = email.split("@");

  if (name.length <= 2) return `**@${domain}`;

  const visible = name.slice(0, 2);
  const hidden = "*".repeat(name.length - 2);

  return `${visible}${hidden}@${domain}`;
  
}

function maskPhone(phone: string) {
  if (!phone || phone.length < 4) return "*".repeat(phone.length || 10);

  const visible = phone.slice(-4);
  const hidden = "*".repeat(phone.length - 4);

  return `${hidden}${visible}`;
}

interface TextTypeProps {
  text: string | string[];
  as?: string;
  typingSpeed?: number;
  initialDelay?: number;
  pauseDuration?: number;
  deletingSpeed?: number;
  loop?: boolean;
  className?: string;
  showCursor?: boolean;
  hideCursorWhileTyping?: boolean;
  cursorCharacter?: string;
  cursorClassName?: string;
  cursorBlinkDuration?: number;
  textColors?: string[];
  variableSpeed?: { min: number; max: number };
  onSentenceComplete?: (text: string, index: number) => void;
  startOnVisible?: boolean;
  reverseMode?: boolean;
  style?: React.CSSProperties;
}

const TextType: React.FC<TextTypeProps> = ({
  text,
  as: Component = "span",
  typingSpeed = 50,
  initialDelay = 0,
  pauseDuration = 2000,
  deletingSpeed = 30,
  loop = true,
  className = "",
  showCursor = true,
  hideCursorWhileTyping = false,
  cursorCharacter = "|",
  cursorClassName = "",
  cursorBlinkDuration = 0.5,
  textColors = [],
  variableSpeed,
  onSentenceComplete,
  startOnVisible = false,
  reverseMode = false,
  ...props
}) => {
  const [displayedText, setDisplayedText] = useState("");
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(!startOnVisible);
  const cursorRef = useRef(null);
  const containerRef = useRef(null);


  const textArray = useMemo(() => (Array.isArray(text) ? text : [text]), [text])

  const getRandomSpeed = useCallback(() => {
    if (!variableSpeed) return typingSpeed;
    const { min, max } = variableSpeed;
    return Math.random() * (max - min) + min;
  }, [variableSpeed, typingSpeed]);

  const getCurrentTextColor = () => {
    if (textColors.length === 0) return;
    return textColors[currentTextIndex % textColors.length];
  };

  useEffect(() => {
    if (!startOnVisible || !containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.1 },
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [startOnVisible]);

  useEffect(() => {
    if (showCursor && cursorRef.current) {
      gsap.set(cursorRef.current, { opacity: 1 });
      gsap.to(cursorRef.current, {
        opacity: 0,
        duration: cursorBlinkDuration,
        repeat: -1,
        yoyo: true,
        ease: "power2.inOut",
      });
    }
  }, [showCursor, cursorBlinkDuration]);

  useEffect(() => {
    if (!isVisible) return;

    let timeout: NodeJS.Timeout | undefined;
    const currentText = textArray[currentTextIndex];
    const processedText = reverseMode
      ? currentText.split("").reverse().join("")
      : currentText;

    const executeTypingAnimation = () => {
      if (isDeleting) {
        if (displayedText === "") {
          setIsDeleting(false);
          if (currentTextIndex === textArray.length - 1 && !loop) {
            return;
          }

          if (onSentenceComplete) {
            onSentenceComplete(textArray[currentTextIndex], currentTextIndex);
          }

          setCurrentTextIndex((prev) => (prev + 1) % textArray.length);
          setCurrentCharIndex(0);
          timeout = setTimeout(() => {}, pauseDuration);
        } else {
          timeout = setTimeout(() => {
            setDisplayedText((prev) => prev.slice(0, -1));
          }, deletingSpeed);
        }
      } else {
        if (currentCharIndex < processedText.length) {
          timeout = setTimeout(
            () => {
              setDisplayedText(
                (prev) => prev + processedText[currentCharIndex],
              );
              setCurrentCharIndex((prev) => prev + 1);
            },
            variableSpeed ? getRandomSpeed() : typingSpeed,
          );
        } else if (textArray.length >= 1) {
          if (!loop && currentTextIndex === textArray.length - 1) return;
          timeout = setTimeout(() => {
            setIsDeleting(true);
          }, pauseDuration);
        }
      }
    };

    if (currentCharIndex === 0 && !isDeleting && displayedText === "") {
      timeout = setTimeout(executeTypingAnimation, initialDelay);
    } else {
      executeTypingAnimation();
    }

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    currentCharIndex,
    displayedText,
    isDeleting,
    typingSpeed,
    deletingSpeed,
    pauseDuration,
    textArray,
    currentTextIndex,
    loop,
    initialDelay,
    isVisible,
    reverseMode,
    variableSpeed,
    onSentenceComplete,
  ]);

  const shouldHideCursor =
    hideCursorWhileTyping &&
    (currentCharIndex < textArray[currentTextIndex].length || isDeleting);

  return createElement(
    Component,
    {
      ref: containerRef,
      className: `text-type ${className}`,
      ...props,
    },
    <span className="text-type__content text-black!">{displayedText}</span>,
    showCursor && (
      <span
        ref={cursorRef}
        className={`text-type__cursor ${cursorClassName} ${shouldHideCursor ? "text-type__cursor--hidden" : ""}`}
      >
        {cursorCharacter}
      </span>
    ),
  );
};

export default function AuthPage() {
  const [authView, setAuthView] = useState<AuthView>("login");
  const [isForgotActive, setIsForgotActive] = useState(false);
  const [isRegisterActive, setIsRegisterActive] = useState(false);
  const [loginErrors, setLoginErrors] = useState<Record<string, string>>({});
  const [registerErrors, setRegisterErrors] = useState<Record<string, string>>(
    {},
  );
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [registerPassword, setRegisterPassword] = useState("");
  const [forgotStep, setForgotStep] = useState<ForgotStep>("request");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [channel, setChannel] = useState<"email" | "whatsapp">("email");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [timer, setTimer] = useState(0);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isEditingDetails, setIsEditingDetails] = useState(true);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [otpError, setOtpError] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [emailError, setEmailError] = useState("");
  const router = useRouter()
  const queryClient = useQueryClient();

  // Responsive hooks
  const isMobile = useMediaQuery("(max-width: 768px)");
  const isTablet = useMediaQuery("(min-width: 769px) and (max-width: 1024px)");

  const COUNTRY_CODES: { code: string; name: string; flag: string }[] = [
    { code: "+1", name: "United States / Canada", flag: "🇺🇸" },
    { code: "+91", name: "India", flag: "🇮🇳" },
    { code: "+44", name: "United Kingdom", flag: "🇬🇧" },
    { code: "+971", name: "United Arab Emirates", flag: "🇦🇪" },
  ];

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const loginMutation = useMutation({
    mutationFn: async ({
      email,
      password,
    }: {
      email: string;
      password: string;
    }) => {
      const { data } = await axiosInstance.post("/api/auth/login", {
        email,
        password,
      });
      return data;
    },
    onMutate: () => setLoginErrors({}),
    onError: (error: any) => {
      const data = error?.response?.data;
      if (data?.fieldErrors) {
        setLoginErrors(data.fieldErrors);
      } else {
        setLoginErrors({ general: data?.error || "Login failed" });
      }
    },
    onSuccess: (data) => {
      if (data?.success) {
        if (data.user?.role === "SUPER ADMIN") {
          router.replace("/user/dashboard");
        } else {
          router.replace("/user/dashboard");
          queryClient.invalidateQueries({queryKey: ["user-role"]});
        }
        toast.success("Logged in successfully");
      }
    },
  });

  const registerMutation = useMutation({
    mutationFn: async ({
      name,
      email,
      phone,
      password,
      countryCode,
    }: {
      name: string;
      email: string;
      phone: string;
      password: string;
      countryCode: string;
    }) => {
      const { data } = await axiosInstance.post("/api/auth/registration", {
        name,
        email,
        phone,
        password,
        countryCode,
      });
      return data;
    },
    onMutate: (variables) => {
      setRegisterErrors({});
      const passwordValid = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/.test(
        variables.password,
      );
      if (!passwordValid) {
        setRegisterErrors({
          password:
            "Password must be 8+ chars, include uppercase, lowercase, number, and special character",
        });
        throw new Error("Invalid password");
      }
    },
    onError: (error: any) => {
      const data = error?.response?.data;
      if (data?.fieldErrors) {
        setRegisterErrors(data.fieldErrors);
      } else {
        setRegisterErrors({ general: data?.error });
      }
    },
    onSuccess: () => {
      toast.success("Registered successfully! Please login.");
      setIsRegisterActive(false);
      setRegisterErrors({});
    },
  });

  // Handle login form submission
  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = form.get("email") as string;
    const password = form.get("password") as string;
    
    loginMutation.mutate({ email, password });
  };

  // Handle register form submission
  const handleRegister = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = new FormData(e.currentTarget);
    const name = form.get("name") as string;
    const email = form.get("email") as string;
    const countryCode = form.get("countryCode") as string;
    const phone = form.get("phone") as string;
    const password = registerPassword;

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      setRegisterErrors(prev => ({ ...prev, email: "Please enter a valid email address" }));
      return;
    }

    registerMutation.mutate({
      name,
      email,
      countryCode,
      phone,
      password,
    });
  };

  // Handle forgot password flow
  const handleSendOtp = async () => {
    // Clear previous errors
    setEmailError("");

    // Validate email format
    if (!email || email.trim() === "") {
      toast.error("Please enter your email");
      setEmailError("Email is required");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      setEmailError("Invalid email format");
      return;
    }

    // Validate phone if WhatsApp selected
    if (channel === "whatsapp" && !phone) {
      toast.error("Please enter your phone number");
      return;
    }

    try {
      const response = await axiosInstance.post("/api/auth/send-otp", {
        email,
        phone,
        channel,
      });

      setForgotStep("verify");
      setTimer(60);
      setIsEditingDetails(false);
      setEmailError("");
      toast.success(
        `OTP sent to ${channel === "email" ? maskEmail(email) : maskPhone(phone)}`,
      );
    } catch (error: any) {
      const errorMsg = error?.response?.data?.error;
      if (error?.response?.status === 404) {
        toast.error("No account found with this email");
        setEmailError("Email not registered");
      } else if (errorMsg) {
        toast.error(errorMsg);
        setEmailError(errorMsg);
      } else {
        toast.error("Failed to send OTP");
        setEmailError("Failed to send OTP");
      }
    }
  };

  const handleVerifyOtp = async () => {
    // Clear previous error
    setOtpError(false);

    // OTP validation
    if (!otp || otp.trim() === "") {
      toast.error("Please enter OTP");
      setOtpError(true);
      return;
    }

    if (otp.length !== 6) {
      toast.error("OTP must be 6 digits");
      setOtpError(true);
      return;
    }

    // Check if OTP contains only numbers
    if (!/^\d+$/.test(otp)) {
      toast.error("OTP must contain only numbers");
      setOtpError(true);
      return;
    }

    try {
      const { data } = await axiosInstance.post("/api/auth/verify-otp", {
        email,
        otp,
      });

      toast.success(data?.message || "OTP verified successfully");
      setOtpError(false);
      setForgotStep("reset");
    } catch (error: any) {
      setOtpError(true);
      const errorMessage = error?.response?.data?.error;

      if (errorMessage) {
        toast.error(errorMessage);
      } else if (error?.response?.status === 400) {
        toast.error("Invalid OTP. Please try again.");
      } else if (error?.response?.status === 500) {
        toast.error("Server error. Please try again later.");
      } else {
        toast.error("Failed to verify OTP. Please try again.");
      }
    }
  };

  const handleResetPassword = async () => {
    // Clear previous errors
    setPasswordError("");

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      setPasswordError("Passwords do not match");
      return;
    }

    // Validate password is not empty
    if (!newPassword || newPassword.trim() === "") {
      toast.error("Please enter a password");
      setPasswordError("Password is required");
      return;
    }

    // Validate password format
    const passwordValid = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\W).{8,}$/.test(
      newPassword,
    );
    if (!passwordValid) {
      toast.error(
        "Password must be 8+ chars, include upper, lower, and special character",
      );
      setPasswordError(
        "Password must be 8+ chars with uppercase, lowercase, and special character",
      );
      return;
    }

    try {
      await axiosInstance.post("/api/auth/reset-password", {
        email,
        password: newPassword,
      });
      toast.success("Password updated successfully");
      
      // Reset states
      setAuthView("login");
      setIsForgotActive(false);
      setForgotStep("request");
      setEmail("");
      setPhone("");
      setOtp("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordError("");
      setIsEditingDetails(true);
    } catch (error: any) {
      const errorMsg =
        error?.response?.data?.error || "Failed to reset password";
      toast.error(errorMsg);
      setPasswordError(errorMsg);
    }
  };

  const handleResendOtp = async () => {
    if (timer > 0) return;
    await handleSendOtp();
  };

  const clearFieldError = (form: "login" | "register", field: string) => {
    if (form === "login") {
      setLoginErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    } else {
      setRegisterErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const isPhoneError = registerErrors.countryCode || registerErrors.phone;

  const inputStyle: React.CSSProperties = {
    width: "100%",
    height: isMobile ? "44px" : "48px",
    background: "transparent",
    border: "2px solid rgba(255,255,255,0.3)",
    borderRadius: "40px",
    fontSize: isMobile ? "14px" : "16px",
    color: "#fff",
    padding: "0 20px",
    outline: "none",
    marginBottom: "12px",
    transition: "border-color 0.3s ease",
  };

  const buttonStyle: React.CSSProperties = {
    width: "100%",
    height: isMobile ? "44px" : "48px",
    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    border: "none",
    borderRadius: "40px",
    cursor: "pointer",
    fontSize: isMobile ? "15px" : "17px",
    fontWeight: 600,
    color: "#fff",
    textTransform: "uppercase",
    letterSpacing: "1px",
    transition: "0.3s",
    boxShadow: "0 4px 15px rgba(16, 185, 129, 0.3)",
  };

  // Responsive container styles
 const containerStyle: React.CSSProperties = {
  position: "relative",
  width: isMobile ? "95%" : isTablet ? "90%" : "1000px",
  maxWidth: isMobile ? "400px" : "none",
  height: isMobile ? "auto" : isTablet ? "550px" : "600px",
  minHeight: isMobile ? "600px" : "auto",
  background: "var(--container-bg)",
  border: "1px solid var(--border-color)",
  borderRadius: "20px",
  backdropFilter: "blur(25px)",
  boxShadow: "var(--box-shadow)",
  display: "flex",
  overflow: "hidden",
  transition: "1s ease-in-out",
  margin: 0,
  flexDirection: isMobile ? "column" as const : "row" as const,
}

  return (
    <div className="auth-background">
      <div style={containerStyle} className="border-[#ACECC8]!">
          
          {/* Animated background shapes - hide on mobile */}
          {!isMobile && (
            <>
              <div
                style={{
                  position: "absolute",
                  width: isTablet ? "500px" : "700px",
                  height: isTablet ? "500px" : "700px",
                  borderRadius: "50%",
                  background: "var(--shape-bg1)",
                  top: isTablet ? "-250px" : "-350px",
                  right: isRegisterActive ? "50%" : isTablet ? "-200px" : "-300px",
                  transform: isRegisterActive ? "translateX(50%)" : "none",
                  transition: "1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                }}
                className="bg-shape left-shape"
              ></div>

              <div
                style={{
                  position: "absolute",
                  width: isTablet ? "500px" : "700px",
                  height: isTablet ? "500px" : "700px",
                  borderRadius: "50%",
                  background: "var(--shape-bg2)",
                  bottom: isTablet ? "-250px" : "-350px",
                  left: isRegisterActive ? "50%" : isTablet ? "-200px" : "-300px",
                  transform: isRegisterActive ? "translateX(-50%)" : "none",
                  transition: "1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                }}
                className="bg-shape right-shape"
              ></div>
            </>
          )}

          {/* LOGIN FORM */}
          <div
            style={{
              position: isMobile ? "relative" : "absolute",
              display: "flex",
              justifyContent: "center",
              flexDirection: "column",
              width: isMobile ? "100%" : "50%",
              height: isMobile ? "auto" : "100%",
              left: isMobile ? 0 : 0,
              padding: isMobile ? "30px 20px" : "0 70px 0 50px",
              pointerEvents: isRegisterActive ? "none" : "all",
              zIndex: 2,
              order: isMobile ? (isRegisterActive ? 2 : 1) : 0,
              alignItems: isMobile ? "center" : "flex-start",
            }}
          >
            <div style={{ width: "100%", maxWidth: "400px" }}>
              <h2
                style={{
                  fontSize: isMobile ? "32px" : "38px",
                  color: "var(--text-color)",
                  textAlign: "center",
                  marginBottom: isMobile ? "20px" : "25px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: isMobile ? "1px" : "2px",
                  transition: "0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                  transform: isRegisterActive
                    ? "translateX(-100%)"
                    : "translateX(0)",
                  opacity: isRegisterActive ? 0 : 1,
                  filter: isRegisterActive ? "blur(10px)" : "blur(0)",
                }}
              >
                <TextType
                  text="LOGIN"
                  typingSpeed={50}
                  loop={true}
                  showCursor={true}
                  cursorCharacter="|"
                  cursorBlinkDuration={0.5}
                  className="text-black!"
                />
              </h2>

              {loginErrors.general && (
                <div
                  style={{
                    color: "var(--error-color)",
                    fontSize: isMobile ? "12px" : "13px",
                    marginBottom: "12px",
                    padding: "8px",
                    background: "rgba(255, 68, 68, 0.1)",
                    borderRadius: "8px",
                    border: "1px solid rgba(255, 68, 68, 0.3)",
                    textAlign: "center",
                  }}
                >
                  ⚠️ {loginErrors.general}
                </div>
              )}

              <form onSubmit={handleLogin}>
                <div
                  className="input-anim"
                  style={{
                    position: "relative",
                    width: "100%",
                    margin: isMobile ? "10px 0" : "15px 0",
                    transition:
                      "0.5s 0.1s, transform 0.3s ease, box-shadow 0.3s ease",
                    transform: isRegisterActive
                      ? "translateX(-100%)"
                      : "translateX(0)",
                    opacity: isRegisterActive ? 0 : 1,
                    filter: isRegisterActive ? "blur(10px)" : "blur(0)",
                    borderRadius: "40px",
                    padding: "2px",
                    background:
                      "linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(5, 150, 105, 0.05))",
                  }}
                >
                  <input
                    type="email"
                    name="email"
                    required
                    className="border-white/30! focus:border-green-500!"
                    placeholder="Email"
                    onChange={() => clearFieldError("login", "email")}
                    style={{
                      width: "100%",
                      height: isMobile ? "44px" : "50px",
                      background: "transparent",
                      border: `2px solid ${loginErrors.email ? "var(--error-color)" : "var(--input-border)"}`,
                      borderRadius: "40px",
                      fontSize: isMobile ? "14px" : "16px",
                      color: "var(--text-color)",
                      padding: "0 45px 0 20px",
                      outline: "none",
                      transition: "border-color 0.3s ease",
                    }}
                    onFocus={(e) => {
                      if (!loginErrors.email) {
                        e.target.style.borderColor = "var(--input-focus-border)";
                        e.target.style.boxShadow =
                          "0 0 0 3px rgba(16, 185, 129, 0.1)";
                      }
                    }}
                    onBlur={(e) => {
                      if (!loginErrors.email) {
                        e.target.style.borderColor = "var(--input-border)";
                        e.target.style.boxShadow = "none";
                      }
                    }}
                  />
                  <Mail
                    style={{
                      position: "absolute",
                      right: "20px",
                      top: isMobile ? "12px" : "15px",
                      color: "rgba(0,0,0,0.6)",
                      transition:
                        "all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                      zIndex: 1,
                    }}
                    size={isMobile ? 18 : 20}
                  />
                  {loginErrors.email && (
                    <p
                      style={{
                        color: "#ff4444",
                        fontSize: isMobile ? "11px" : "12px",
                        marginTop: "4px",
                        marginLeft: "10px",
                      }}
                    >
                      ⚠️ {loginErrors.email}
                    </p>
                  )}
                </div>

                <div
                  className="input-anim"
                  style={{
                    position: "relative",
                    width: "100%",
                    margin: isMobile ? "10px 0" : "15px 0",
                    transition: "0.8s 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                    transform: isRegisterActive
                      ? "translateX(-100%)"
                      : "translateX(0)",
                    opacity: isRegisterActive ? 0 : 1,
                    filter: isRegisterActive ? "blur(10px)" : "blur(0)",
                  }}
                >
                  <input
                    type={showLoginPassword ? "text" : "password"}
                    name="password"
                    required
                    className="border-white/30! focus:border-green-500!"
                    placeholder="Password"
                    onChange={() => clearFieldError("login", "password")}
                    style={{
                      width: "100%",
                      height: isMobile ? "44px" : "50px",
                      background: "transparent",
                      border: `2px solid ${loginErrors.password ? "var(--error-color)" : "var(--input-border)"}`,
                      borderRadius: "40px",
                      fontSize: isMobile ? "14px" : "16px",
                      color: "var(--text-color)",
                      padding: "0 45px 0 20px",
                      outline: "none",
                      transition: "border-color 0.3s ease",
                    }}
                    onFocus={(e) => {
                      if (!loginErrors.password) {
                        e.target.style.borderColor = "var(--input-focus-border)";
                        e.target.style.boxShadow =
                          "0 0 0 3px rgba(16, 185, 129, 0.1)";
                      }
                    }}
                    onBlur={(e) => {
                      if (!loginErrors.password) {
                        e.target.style.borderColor = "var(--input-border)";
                        e.target.style.boxShadow = "none";
                      }
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      right: "20px",
                      top: isMobile ? "12px" : "15px",
                      display: "flex",
                      gap: "8px",
                    }}
                  >
                    <Lock
                      size={isMobile ? 18 : 20}
                      style={{
                        color: "rgba(0,0,0,0.6)",
                      }}
                    />
                    {showLoginPassword ? (
                      <Eye
                        size={isMobile ? 18 : 20}
                        style={{
                          color: "rgba(16, 185, 129, 0.8)",
                          cursor: "pointer",
                        }}
                        onClick={() => setShowLoginPassword(false)}
                      />
                    ) : (
                      <EyeOff
                        size={isMobile ? 18 : 20}
                        style={{
                          color: "rgba(16, 185, 129, 0.8)",
                          cursor: "pointer",
                        }}
                        onClick={() => setShowLoginPassword(true)}
                      />
                    )}
                  </div>
                  {loginErrors.password && (
                    <p
                      style={{
                        color: "#ff4444",
                        fontSize: isMobile ? "11px" : "12px",
                        marginTop: "4px",
                        marginLeft: "10px",
                      }}
                    >
                      ⚠️ {loginErrors.password}
                    </p>
                  )}
                </div>

                <div
                  style={{
                    width: "100%",
                    marginTop: isMobile ? "10px" : "15px",
                    transition: "0.8s 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                    transform: isRegisterActive
                      ? "translateX(-100%)"
                      : "translateX(0)",
                    opacity: isRegisterActive ? 0 : 1,
                  }}
                >
                  <button
                    type="submit"
                    className="btn-anim text-white!"
                    style={buttonStyle}
                    disabled={registerMutation.isPending}
                  >
                    {registerMutation.isPending ? "Registering..." : "Register"}
                  </button>
                </div>

                <div
                  style={{
                    textAlign: "center",
                    marginTop: isMobile ? "15px" : "18px",
                    transition: "0.8s 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                    transform: isRegisterActive
                      ? "translateX(-100%)"
                      : "translateX(0)",
                    opacity: isRegisterActive ? 0 : 1,
                  }}
                >
                  <p style={{ fontSize: isMobile ? "14px" : "15px", color: "var(--text-secondary)" }} className="text-black!">
                    Don&apos;t have an account?{" "}
                    <span
                      className="text-black!"
                      onClick={(e) => {
                        e.preventDefault();
                        setIsRegisterActive(true);
                        setLoginErrors({});
                      }}
                      style={{
                        color: "#000",
                        fontWeight: 700,
                        textDecoration: "none",
                        cursor: "pointer",
                      }}
                    >
                      Sign Up
                    </span>
                  </p>
                </div>
                <div
                  style={{
                    textAlign: "center",
                    marginTop: isMobile ? "8px" : "6px",
                    transition: "0.5s 0.45s",
                    transform:
                      isRegisterActive || isForgotActive
                        ? "translateX(-100%)"
                        : "translateX(0)",
                    opacity: isRegisterActive || isForgotActive ? 0 : 1,
                    pointerEvents:
                      isRegisterActive || isForgotActive ? "none" : "auto",
                    position: "relative",
                    zIndex: 9999,
                  }}
                >
                  <span
                    className="text-black!"
                    onClick={() => {
                      setIsForgotActive(true);
                      setAuthView("forgot");
                      setLoginErrors({});
                    }}
                    style={{
                      fontSize: isMobile ? "13px" : "14px",
                      color: "rgba(255,255,255,0.8)",
                      cursor: "pointer",
                      textDecoration: "underline",
                    }}
                  >
                    Forgot password?
                  </span>
                </div>
              </form>
            </div>
          </div>

          {/* LOGIN INFO - Only visible on desktop */}
          {!isMobile && (
            <div
              style={{
                position: "absolute",
                width: "50%",
                height: "100%",
                display: "flex",
                justifyContent: "center",
                flexDirection: "column",
                right: 0,
                textAlign: "right",
                padding: "0 50px 0 70px",
                zIndex: 1,
              }}
            >
              <h2
                style={{
                  fontSize: "42px",
                  color: "var(--text-color)",
                  lineHeight: 1.2,
                  textTransform: "uppercase",
                  marginBottom: "20px",
                  fontWeight: 800,
                  letterSpacing: "3px",
                  transform: isRegisterActive
                    ? "translateX(100%)"
                    : "translateX(0)",
                  opacity: isRegisterActive ? 0 : 1,
                  filter: isRegisterActive ? "blur(10px)" : "blur(0)",
                  transition: "0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                }}
                className="text-black!"
              >
                Welcome Back!
              </h2>
              <p
                style={{
                  fontSize: "17px",
                  color: "var(--text-secondary)",
                  lineHeight: 1.7,
                  transition: "0.8s 0.1s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                  transform: isRegisterActive
                    ? "translateX(100%)"
                    : "translateX(0)",
                  opacity: isRegisterActive ? 0 : 1,
                  filter: isRegisterActive ? "blur(10px)" : "blur(0)",
                }}
              >
                <TextType
                  text="We're happy to see you again. Let's continue your journey."
                  typingSpeed={50}
                  loop={true}
                  showCursor={true}
                  cursorCharacter="|"
                  cursorBlinkDuration={0.5}
                  className=""
                />
              </p>
            </div>
          )}

          {/* REGISTER FORM */}
          <div
            style={{
              position: isMobile ? "relative" : "absolute",
              display: "flex",
              justifyContent: "center",
              flexDirection: "column",
              width: isMobile ? "100%" : "50%",
              height: isMobile ? "auto" : "100%",
              right: isMobile ? 0 : 0,
              padding: isMobile ? "30px 20px" : "0 50px 0 70px",
              pointerEvents: isRegisterActive ? "all" : "none",
              zIndex: 2,
              order: isMobile ? (isRegisterActive ? 1 : 2) : 0,
              alignItems: isMobile ? "center" : "flex-start",
            }}
          >
            <div style={{ width: "100%", maxWidth: "400px" }}>
              <h2
                style={{
                  fontSize: isMobile ? "32px" : "38px",
                  color: "var(--text-color)",
                  textAlign: "center",
                  marginBottom: isMobile ? "20px" : "20px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: isMobile ? "1px" : "2px",
                  transition: "0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                  transform: isRegisterActive
                    ? "translateX(0)"
                    : "translateX(100%)",
                  opacity: isRegisterActive ? 1 : 0,
                  filter: isRegisterActive ? "blur(0)" : "blur(10px)",
                }}
              >
                <TextType
                  text="REGISTER"
                  typingSpeed={50}
                  loop={true}
                  showCursor={true}
                  cursorCharacter="|"
                  cursorBlinkDuration={0.5}
                  className=""
                />
              </h2>

              {registerErrors.general && (
                <div
                  style={{
                    color: "var(--error-color)",
                    fontSize: isMobile ? "12px" : "13px",
                    marginBottom: "10px",
                    padding: "8px",
                    background: "rgba(255, 68, 68, 0.1)",
                    borderRadius: "8px",
                    border: "1px solid rgba(255, 68, 68, 0.3)",
                    textAlign: "center",
                  }}
                >
                  ⚠️ {registerErrors.general}
                </div>
              )}

              <form onSubmit={handleRegister}>
                {/* Name Field */}
                <div
                  className="input-anim"
                  style={{
                    position: "relative",
                    width: "100%",
                    margin: isMobile ? "8px 0" : "12px 0",
                    transition: "0.8s 0.1s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                    transform: isRegisterActive
                      ? "translateX(0)"
                      : "translateX(100%)",
                    opacity: isRegisterActive ? 1 : 0,
                    filter: isRegisterActive ? "blur(0)" : "blur(10px)",
                  }}
                >
                  <input
                    type="text"
                    name="name"
                    required
                    className="border-white/30! focus:border-green-500!"
                    placeholder="Full Name"
                    onChange={() => clearFieldError("register", "name")}
                    style={{
                      width: "100%",
                      height: isMobile ? "44px" : "48px",
                      background: "transparent",
                      border: `2px solid ${registerErrors.name ? "var(--error-color)" : "var(--input-border)"}`,
                      borderRadius: "40px",
                      fontSize: isMobile ? "14px" : "16px",
                      color: "var(--text-color)",
                      padding: "0 45px 0 20px",
                      outline: "none",
                      transition: "border-color 0.3s ease",
                    }}
                    onFocus={(e) => {
                      if (!registerErrors.name) {
                        e.target.style.borderColor = "var(--input-focus-border)";
                        e.target.style.boxShadow =
                          "0 0 0 3px rgba(16, 185, 129, 0.1)";
                      }
                    }}
                    onBlur={(e) => {
                      if (!registerErrors.name) {
                        e.target.style.borderColor = "var(--input-border)";
                        e.target.style.boxShadow = "none";
                      }
                    }}
                  />
                  <User
                    style={{
                      position: "absolute",
                      right: "20px",
                      top: isMobile ? "12px" : "14px",
                      color: "rgba(0,0,0,0.6)",
                      transition:
                        "all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                      zIndex: 1,
                    }}
                    size={isMobile ? 18 : 20}
                  />
                  {registerErrors.name && (
                    <p
                      style={{
                        color: "#ff4444",
                        fontSize: isMobile ? "10px" : "11px",
                        marginTop: "3px",
                        marginLeft: "10px",
                      }}
                    >
                      ⚠️ {registerErrors.name}
                    </p>
                  )}
                </div>

                {/* Email Field */}
                <div
                  className="input-anim"
                  style={{
                    position: "relative",
                    width: "100%",
                    margin: isMobile ? "8px 0" : "12px 0",
                    transition: "0.5s 0.15s",
                    transform: isRegisterActive
                      ? "translateX(0)"
                      : "translateX(100%)",
                    opacity: isRegisterActive ? 1 : 0,
                    filter: isRegisterActive ? "blur(0)" : "blur(10px)",
                  }}
                >
                  <input
                    type="email"
                    name="email"
                    required
                    className="border-white/30! focus:border-green-500!"
                    placeholder="Email"
                    onChange={() => clearFieldError("register", "email")}
                    style={{
                      width: "100%",
                      height: isMobile ? "44px" : "48px",
                      background: "transparent",
                      border: `2px solid ${registerErrors.email ? "#ff4444" : "rgba(255,255,255,0.3)"}`,
                      borderRadius: "40px",
                      fontSize: isMobile ? "14px" : "16px",
                      color: "var(--text-color)",
                      padding: "0 45px 0 20px",
                      outline: "none",
                      transition: "border-color 0.3s ease",
                    }}
                    onFocus={(e) => {
                      if (!registerErrors.email) {
                        e.target.style.borderColor = "rgba(16, 185, 129, 0.6)";
                        e.target.style.boxShadow =
                          "0 0 0 3px rgba(16, 185, 129, 0.1)";
                      }
                    }}
                    onBlur={(e) => {
                      if (!registerErrors.email) {
                        e.target.style.borderColor = "rgba(255,255,255,0.3)";
                        e.target.style.boxShadow = "none";
                      }
                    }}
                  />
                  <Mail
                    style={{
                      position: "absolute",
                      right: "20px",
                      top: isMobile ? "12px" : "14px",
                      color: "rgba(0,0,0,0.6)",
                      transition:
                        "all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                      zIndex: 1,
                    }}
                    size={isMobile ? 18 : 20}
                  />
                </div>

                {registerErrors.email && (
                  <p
                    style={{
                      color: "#ff4444",
                      fontSize: isMobile ? "10px" : "11px",
                      marginTop: "-5px",
                      marginBottom: "8px",
                      marginLeft: "10px",
                    }}
                  >
                    ⚠️ {registerErrors.email}
                  </p>
                )}


                {/* Phone Field */}
                <div
                  style={{
                    width: "100%",
                    margin: isMobile ? "8px 0" : "12px 0",
                    transition: "0.5s 0.2s",
                    transform: isRegisterActive
                      ? "translateX(0)"
                      : "translateX(100%)",
                    opacity: isRegisterActive ? 1 : 0,
                    filter: isRegisterActive ? "blur(0)" : "blur(10px)",
                  }}
                >
                  <div
                    className="input-anim"
                    style={{ position: "relative", width: "100%", display: "flex" }}
                  >
                    <input
                      type="text"
                      name="countryCode"
                      list="countryCodes"
                      required
                      defaultValue="+91"
                      placeholder="Code"
                      className="border-white/30!"
                      onChange={() => {
                        clearFieldError("register", "countryCode");
                        clearFieldError("register", "phone");
                      }}
                      style={{
                        width: "30%",
                        maxWidth: isMobile ? "80px" : "95px",
                        height: isMobile ? "44px" : "48px",
                        background: "transparent",
                        border: `2px solid ${registerErrors.countryCode ? "#ff4444" : "rgba(255,255,255,0.3)"}`,
                        borderRadius: "40px 0 0 40px",
                        fontSize: isMobile ? "14px" : "16px",
                        color: "#000",
                        padding: "0 8px",
                        outline: "none",
                        textAlign: "center",
                        borderRight: "none",
                        transition: "border-color 0.3s ease",
                      }}
                      onFocus={(e) => {
                        if (!registerErrors.countryCode) {
                          e.target.style.borderColor = "rgba(16, 185, 129, 0.6)";
                          e.target.style.boxShadow =
                            "0 0 0 3px rgba(16, 185, 129, 0.1)";
                        }
                      }}
                      onBlur={(e) => {
                        if (!registerErrors.countryCode) {
                          e.target.style.borderColor = "rgba(255,255,255,0.3)";
                          e.target.style.boxShadow = "none";
                        }
                      }}
                    />
                    <datalist id="countryCodes">
                      {COUNTRY_CODES.map(({ code, name, flag }) => (
                        <option
                          key={code}
                          value={code}
                          label={`${flag} ${name} (${code})`}
                        ></option>
                      ))}
                    </datalist>

                    <input
                      type="tel"
                      name="phone"
                      required
                      className="border-white/30!"
                      placeholder="Phone Number"
                      maxLength={10}
                      pattern="[0-9]{10}"
                      inputMode="numeric"
                      onInput={e => {
                        const input = e.target as HTMLInputElement;
                        input.value = input.value.replace(/\D/g, '').slice(0, 10);
                      }}
                      onChange={e => {
                        clearFieldError("register", "countryCode");
                        clearFieldError("register", "phone");
                      }}
                      style={{
                        flexGrow: 1,
                        height: isMobile ? "44px" : "48px",
                        background: "transparent",
                        border: `2px solid ${registerErrors.phone ? "#ff4444" : "rgba(255,255,255,0.3)"}`,
                        borderRadius: "0 40px 40px 0",
                        fontSize: isMobile ? "14px" : "16px",
                        color: "#000",
                        padding: "0 45px 0 15px",
                        outline: "none",
                        borderLeft: "none",
                        transition: "border-color 0.3s ease",
                      }}
                      onFocus={(e) => {
                        if (!registerErrors.phone) {
                          e.target.style.borderColor = "rgba(16, 185, 129, 0.6)";
                          e.target.style.boxShadow =
                            "0 0 0 3px rgba(16, 185, 129, 0.1)";
                        }
                      }}
                      onBlur={(e) => {
                        if (!registerErrors.phone) {
                          e.target.style.borderColor = "rgba(255,255,255,0.3)";
                          e.target.style.boxShadow = "none";
                        }
                      }}
                    />
                    <Phone
                      style={{
                        position: "absolute",
                        right: "20px",
                        top: isMobile ? "12px" : "14px",
                        color: "rgba(0,0,0,0.6)",
                        transition:
                          "all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                        zIndex: 1,
                      }}
                      size={isMobile ? 18 : 20}
                    />
                  </div>

                  {registerErrors.countryCode && (
                    <p
                      style={{
                        color: "#ff4444",
                        fontSize: isMobile ? "10px" : "11px",
                        marginTop: "3px",
                        marginLeft: "10px",
                      }}
                    >
                      ⚠️ Country Code: {registerErrors.countryCode}
                    </p>
                  )}
                  {registerErrors.phone && (
                    <p
                      style={{
                        color: "#ff4444",
                        fontSize: isMobile ? "10px" : "11px",
                        marginTop: "3px",
                        marginLeft: "10px",
                      }}
                    >
                      ⚠️ Phone: {registerErrors.phone}
                    </p>
                  )}
                </div>

                {/* Password Field */}
                <div
                  className="input-anim"
                  style={{
                    position: "relative",
                    width: "100%",
                    margin: isMobile ? "8px 0" : "12px 0",
                    transition: "0.5s 0.25s",
                    transform: isRegisterActive
                      ? "translateX(0)"
                      : "translateX(100%)",
                    opacity: isRegisterActive ? 1 : 0,
                    filter: isRegisterActive ? "blur(0)" : "blur(10px)",
                  }}
                >
                  <input
                    type={showRegisterPassword ? "text" : "password"}
                    name="password"
                    required
                    className="border-white/30! focus:border-green-500!"
                    placeholder="Password"
                    value={registerPassword}
                    onChange={e => {
                      setRegisterPassword(e.target.value);
                      clearFieldError("register", "password");
                      const passwordValid = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/.test(e.target.value);
                      if (!passwordValid) {
                        setRegisterErrors(prev => ({
                          ...prev,
                          password: "Password must be 8+ chars, include uppercase, lowercase, number, and special character"
                        }));
                      } else {
                        setRegisterErrors(prev => {
                          const newErrors = { ...prev };
                          delete newErrors.password;
                          return newErrors;
                        });
                      }
                    }}
                    style={{
                      width: "100%",
                      height: isMobile ? "44px" : "48px",
                      background: "transparent",
                      border: `2px solid ${registerErrors.password ? "#ff4444" : "rgba(255,255,255,0.3)"}`,
                      borderRadius: "40px",
                      fontSize: isMobile ? "14px" : "16px",
                      color: "var(--text-color)",
                      padding: "0 45px 0 20px",
                      outline: "none",
                      transition: "border-color 0.3s ease",
                    }}
                    onFocus={(e) => {
                      if (!registerErrors.password) {
                        e.target.style.borderColor = "rgba(16, 185, 129, 0.6)";
                        e.target.style.boxShadow = "0 0 0 3px rgba(16, 185, 129, 0.1)";
                      }
                    }}
                    onBlur={(e) => {
                      if (!registerErrors.password) {
                        e.target.style.borderColor = "rgba(255,255,255,0.3)";
                        e.target.style.boxShadow = "none";
                      }
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      right: "20px",
                      top: isMobile ? "12px" : "14px",
                      display: "flex",
                      gap: "8px",
                    }}
                  >
                    <Lock
                      size={isMobile ? 18 : 20}
                      style={{
                        color: "rgba(0,0,0,0.6)",
                      }}
                    />
                    {showRegisterPassword ? (
                      <Eye
                        size={isMobile ? 18 : 20}
                        style={{
                          color: "rgba(16, 185, 129, 0.8)",
                          cursor: "pointer",
                        }}
                        onClick={() => setShowRegisterPassword(false)}
                      />
                    ) : (
                      <EyeOff
                        size={isMobile ? 18 : 20}
                        style={{
                          color: "rgba(16, 185, 129, 0.8)",
                          cursor: "pointer",
                        }}
                        onClick={() => setShowRegisterPassword(true)}
                      />
                    )}
                  </div>
                  {registerErrors.password && (
                    <p
                      style={{
                        color: "#ff4444",
                        fontSize: isMobile ? "10px" : "11px",
                        marginTop: "3px",
                        marginLeft: "10px",
                      }}
                    >
                      ⚠️ {registerErrors.password}
                    </p>
                  )}
                </div>

                <div
                  style={{
                    width: "100%",
                    marginTop: isMobile ? "15px" : "12px",
                    transition: "0.5s 0.3s",
                    transform: isRegisterActive
                      ? "translateX(0)"
                      : "translateX(100%)",
                    opacity: isRegisterActive ? 1 : 0,
                  }}
                >
                  <button
                    type="submit"
                    className="btn-anim"
                    style={buttonStyle}
                  >
                    Register
                  </button>
                </div>

                <div
                  style={{
                    textAlign: "center",
                    marginTop: isMobile ? "15px" : "12px",
                    transition: "0.5s 0.35s",
                    transform: isRegisterActive
                      ? "translateX(0)"
                      : "translateX(100%)",
                    opacity: isRegisterActive ? 1 : 0,
                  }}
                >
                  <p style={{ fontSize: isMobile ? "14px" : "15px" }} className="text-black!">
                    Already have an account?{" "}
                    <span
                      onClick={(e) => {
                        e.preventDefault();
                        setIsRegisterActive(false);
                        setRegisterErrors({});
                      }}
                      style={{
                        fontWeight: 700,
                        textDecoration: "none",
                        cursor: "pointer",
                      }}
                      className="text-black!"
                    >
                      Login
                    </span>
                  </p>
                </div>
              </form>
            </div>
          </div>

          {/* REGISTER INFO - Only visible on desktop */}
          {!isMobile && (
            <div
              style={{
                position: "absolute",
                width: "50%",
                height: "100%",
                display: "flex",
                justifyContent: "center",
                flexDirection: "column",
                left: 0,
                textAlign: "left",
                padding: "0 70px 0 50px",
                zIndex: 1,
              }}
            >
              <h2
                style={{
                  fontSize: "42px",
                  color: "var(--text-color)",
                  lineHeight: 1.2,
                  textTransform: "uppercase",
                  marginBottom: "20px",
                  fontWeight: 800,
                  letterSpacing: "3px",
                  transform: isRegisterActive
                    ? "translateX(0)"
                    : "translateX(-100%)",
                  opacity: isRegisterActive ? 1 : 0,
                  filter: isRegisterActive ? "blur(0)" : "blur(10px)",
                  transition: "0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                }}
                className="text-black!"
              >
                Welcome!
              </h2>
              <p
                style={{
                  fontSize: "17px",
                  color: "var(--text-secondary)",
                  lineHeight: 1.7,
                  transition: "0.8s 0.1s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                  transform: isRegisterActive
                    ? "translateX(0)"
                    : "translateX(-100%)",
                  opacity: isRegisterActive ? 1 : 0,
                  filter: isRegisterActive ? "blur(0)" : "blur(10px)",
                }}
              >
                <TextType
                  text="We're delighted to have you here. Start your journey with us today!"
                  typingSpeed={50}
                  loop={true}
                  showCursor={true}
                  cursorCharacter="|"
                  cursorBlinkDuration={0.5}
                  className=""
                />
              </p>
            </div>
          )}
       
      </div>

      <style jsx>{`
        .auth-background {
          font-family: "Poppins", sans-serif;
          width: 100%;
          min-height: 100vh;
          background: linear-gradient(
            135deg,
            #ffffff 0%,
            #f0fdf4 25%,
            #dcfce7 50%,
            #bbf7d0 75%,
            #10b981 100%
          ) !important;
          display: flex;
          justify-content: center;
          align-items: center;
          position: relative;
          overflow: hidden;
          transition: background 1s ease;
          color-scheme: light !important;
          --container-bg: rgba(255, 255, 255, 0.08);
          --shape-bg1: linear-gradient(
            135deg,
            rgba(16, 185, 129, 0.1),
            rgba(5, 150, 105, 0.05)
          );
          --shape-bg2: linear-gradient(
            135deg,
            rgba(16, 185, 129, 0.08),
            rgba(5, 150, 105, 0.03)
          );
          --text-color: #000;
          --text-secondary: rgba(0, 0, 0, 0.9);
          --error-color: #ff4444;
          --input-border: rgba(255, 255, 255, 0.3);
          --input-focus-border: rgba(16, 185, 129, 0.6);
          --btn-bg: linear-gradient(135deg, #10b981 0%, #059669 100%);
          --btn-color: #fff;
          --border-color: rgba(16, 185, 129, 0.2);
          --box-shadow:
            0 8px 40px rgba(16, 185, 129, 0.15),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
        }

        @media (max-width: 768px) {
          .auth-background {
            padding: 0;
          }
        }

        /* Smooth floating background shapes */
        .bg-shape.left-shape {
          animation: floatTop 12s ease-in-out infinite;
        }
        .bg-shape.right-shape {
          animation: floatBottom 14s ease-in-out infinite;
        }
        @keyframes floatTop {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        @keyframes floatBottom {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(20px); }
        }

        /* Input hover/focus animations */
        .input-anim {
          transition:
            transform 360ms cubic-bezier(0.2, 0.9, 0.3, 1),
            box-shadow 360ms cubic-bezier(0.2, 0.9, 0.3, 1),
            border-color 260ms ease,
            background 260ms ease;
          border-radius: 14px;
          will-change: transform, box-shadow;
        }
        
        @media (min-width: 769px) {
          .input-anim:hover,
          .input-anim:focus-within {
            transform: translateY(-4px) scale(1.01);
            box-shadow:
              0 18px 40px rgba(16, 185, 129, 0.14),
              0 6px 18px rgba(2, 48, 36, 0.06);
            background: linear-gradient(
              180deg,
              rgba(16, 185, 129, 0.03),
              rgba(255, 255, 255, 0.01)
            );
          }
        }
        
        .input-anim input,
        .input-anim textarea,
        .input-anim select {
          transition:
            border-color 260ms ease,
            box-shadow 260ms ease;
        }
        .input-anim:focus-within input {
          border-color: rgba(16, 185, 129, 0.72) !important;
          box-shadow: 0 0 0 8px rgba(16, 185, 129, 0.06);
        }

        /* Button animations */
        .btn-anim {
          transition:
            transform 320ms cubic-bezier(0.16, 0.84, 0.24, 1),
            box-shadow 320ms cubic-bezier(0.16, 0.84, 0.24, 1),
            opacity 200ms ease;
          will-change: transform, box-shadow;
        }
        
        @media (min-width: 769px) {
          .btn-anim:hover {
            transform: translateY(-5px) scale(1.01);
            box-shadow:
              0 20px 50px rgba(16, 185, 129, 0.22),
              0 6px 20px rgba(2, 48, 36, 0.06);
          }
          .btn-anim:active {
            transform: translateY(-2px) scale(0.998);
            box-shadow: 0 10px 28px rgba(16, 185, 129, 0.18);
          }
        }

        /* Mobile optimizations */
        @media (max-width: 768px) {
          .input-anim:active {
            transform: scale(0.99);
          }
          
          .btn-anim:active {
            transform: scale(0.98);
          }
        }
      `}</style>

      {/* FORGOT PASSWORD FLOW */}
      {isForgotActive && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
            background: "rgba(6, 95, 70, 0.5)",
            backdropFilter: "blur(8px)",
          }}
          onClick={() => {
            setIsForgotActive(false);
            setAuthView("login");
            setIsEditingDetails(true);
            setEmailError("");
          }}
        >
          <div
            style={{
              width: isMobile ? "90%" : "420px",
              maxWidth: "420px",
              padding: isMobile ? "25px" : "30px",
              borderRadius: "20px",
              background: "rgba(255,255,255,0.95)",
              backdropFilter: "blur(25px)",
              border: "1px solid rgba(16,185,129,0.3)",
              color: "#000",
              boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
              margin: isMobile ? "20px" : "0",
              position: "relative",
              zIndex: 10000,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* STEP 1: REQUEST OTP */}
            {forgotStep === "request" && (
              <>
                <h2 style={{ 
                  marginBottom: "20px", 
                  textAlign: "center", 
                  fontSize: isMobile ? "24px" : "28px",
                  color: "#000",
                  fontWeight: 600
                }}>
                  Forgot Password
                </h2>

                <div style={{ marginBottom: "20px", textAlign: "center" }}>
                  <label style={{ marginRight: "15px", cursor: "pointer", color: "#000" }}>
                    <input
                      type="radio"
                      checked={channel === "email"}
                      onChange={() => {
                        setChannel("email");
                        setEmailError("");
                      }}
                      style={{ cursor: "pointer", marginRight: "5px" }}
                    />{" "}
                    Email
                  </label>

                  <label style={{ cursor: "pointer", color: "#000" }}>
                    <input
                      type="radio"
                      checked={channel === "whatsapp"}
                      onChange={() => {
                        setChannel("whatsapp");
                        setEmailError("");
                      }}
                      style={{ cursor: "pointer", marginRight: "5px" }}
                    />{" "}
                    WhatsApp
                  </label>
                </div>

                {channel === "email" && (
                  <div style={{ marginBottom: "12px" }}>
                    <label
                      style={{
                        fontSize: "13px",
                        opacity: 0.8,
                        marginBottom: "6px",
                        display: "block",
                        color: "#000",
                      }}
                    >
                      Email
                    </label>
                    <input
                      type="email"
                      placeholder="Enter your email"
                      value={isEditingDetails ? email : maskEmail(email)}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setEmailError("");
                      }}
                      disabled={!isEditingDetails}
                      style={{
                        ...inputStyle,
                        color: "#000",
                        background: "rgba(255,255,255,0.9)",
                        border: emailError
                          ? "2px solid #ff4444"
                          : "2px solid rgba(0,0,0,0.2)",
                        boxShadow: emailError
                          ? "0 0 0 3px rgba(255, 68, 68, 0.1)"
                          : "none",
                        marginBottom: "0",
                      }}
                    />
                    {emailError && (
                      <p
                        style={{
                          color: "#ff4444",
                          fontSize: "12px",
                          marginTop: "6px",
                          marginBottom: "0",
                          marginLeft: "10px",
                        }}
                      >
                        ⚠️ {emailError}
                      </p>
                    )}
                  </div>
                )}

                {channel === "whatsapp" && (
                  <>
                    <div style={{ marginBottom: "12px" }}>
                      <label
                        style={{
                          fontSize: "13px",
                          opacity: 0.8,
                          marginBottom: "6px",
                          display: "block",
                          color: "#000",
                        }}
                      >
                        Email (Required)
                      </label>
                      <input
                        type="email"
                        placeholder="Enter your email"
                        value={isEditingDetails ? email : maskEmail(email)}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setEmailError("");
                        }}
                        disabled={!isEditingDetails}
                        style={{
                          ...inputStyle,
                          color: "#000",
                          background: "rgba(255,255,255,0.9)",
                          border: emailError
                            ? "2px solid #ff4444"
                            : "2px solid rgba(0,0,0,0.2)",
                          boxShadow: emailError
                            ? "0 0 0 3px rgba(255, 68, 68, 0.1)"
                            : "none",
                          marginBottom: "0",
                        }}
                      />
                      {emailError && (
                        <p
                          style={{
                            color: "#ff4444",
                            fontSize: "12px",
                            marginTop: "6px",
                            marginBottom: "0",
                            marginLeft: "10px",
                          }}
                        >
                          ⚠️ {emailError}
                        </p>
                      )}
                    </div>

                    <div style={{ marginBottom: "12px" }}>
                      <label
                        style={{
                          fontSize: "13px",
                          opacity: 0.8,
                          marginBottom: "6px",
                          display: "block",
                          color: "#000",
                        }}
                      >
                        WhatsApp Number
                      </label>
                      <input
                        type="tel"
                        placeholder="+919876543210"
                        value={isEditingDetails ? phone : maskPhone(phone)}
                        onChange={(e) => setPhone(e.target.value)}
                        disabled={!isEditingDetails}
                        style={{
                          ...inputStyle,
                          color: "#000",
                          background: "rgba(255,255,255,0.9)",
                          border: "2px solid rgba(0,0,0,0.2)",
                          marginBottom: "0",
                        }}
                      />
                      <p
                        style={{
                          fontSize: "11px",
                          color: "rgba(0,0,0,0.6)",
                          marginTop: "-8px",
                          marginLeft: "10px",
                        }}
                      >
                        Include country code (e.g., +91 for India)
                      </p>
                    </div>
                  </>
                )}

                {!isEditingDetails && (
                  <p
                    onClick={() => {
                      setIsEditingDetails(true);
                      setEmailError("");
                    }}
                    style={{
                      fontSize: "12px",
                      cursor: "pointer",
                      textDecoration: "underline",
                      textAlign: "right",
                      marginBottom: "12px",
                      color: "rgba(16, 185, 129, 0.9)",
                    }}
                  >
                    Edit details
                  </p>
                )}

                <button onClick={handleSendOtp} style={buttonStyle}>
                  Send OTP
                </button>

                <p
                  onClick={() => {
                    setAuthView("login");
                    setIsForgotActive(false);
                    setIsEditingDetails(true);
                    setEmailError("");
                  }}
                  style={{
                    marginTop: "15px",
                    cursor: "pointer",
                    textDecoration: "underline",
                    fontSize: "14px",
                    textAlign: "center",
                    color: "#000",
                  }}
                >
                  Back to Login
                </p>
              </>
            )}

            {/* STEP 2: VERIFY OTP */}
            {forgotStep === "verify" && (
              <>
                <h2 style={{ 
                  marginBottom: "20px", 
                  textAlign: "center", 
                  fontSize: isMobile ? "24px" : "28px",
                  color: "#000",
                  fontWeight: 600
                }}>
                  Enter OTP
                </h2>

                <p
                  style={{
                    fontSize: "14px",
                    marginBottom: "15px",
                    opacity: 0.85,
                    textAlign: "center",
                    color: "#000",
                  }}
                >
                  OTP sent to{" "}
                  <b>
                    {channel === "email" ? maskEmail(email) : maskPhone(phone)}
                  </b>
                </p>

                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  maxLength={6}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    setOtp(value);
                    setOtpError(false);
                  }}
                  style={{
                    ...inputStyle,
                    color: "#000",
                    background: "rgba(255,255,255,0.9)",
                    border: otpError
                      ? "2px solid #ff4444"
                      : "2px solid rgba(0,0,0,0.2)",
                    boxShadow: otpError
                      ? "0 0 0 3px rgba(255, 68, 68, 0.1)"
                      : "none",
                    textAlign: "center",
                    fontSize: isMobile ? "18px" : "20px",
                    letterSpacing: isMobile ? "4px" : "6px",
                    fontWeight: "600",
                  }}
                />

                {otpError && (
                  <p
                    style={{
                      color: "#ff4444",
                      fontSize: "13px",
                      marginTop: "-8px",
                      marginBottom: "12px",
                      textAlign: "center",
                    }}
                  >
                    ⚠️ Please enter a valid 6-digit OTP
                  </p>
                )}

                <button onClick={handleVerifyOtp} style={buttonStyle}>
                  Verify OTP
                </button>

                <button
                  disabled={timer > 0}
                  onClick={handleResendOtp}
                  style={{
                    ...buttonStyle,
                    marginTop: "10px",
                    opacity: timer > 0 ? 0.6 : 1,
                    cursor: timer > 0 ? "not-allowed" : "pointer",
                    background:
                      timer > 0
                        ? "rgba(16, 185, 129, 0.3)"
                        : "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                  }}
                >
                  {timer > 0 ? `Resend OTP in ${timer}s` : "Resend OTP"}
                </button>

                <p
                  onClick={() => {
                    setForgotStep("request");
                    setOtp("");
                    setOtpError(false);
                    setIsEditingDetails(true);
                  }}
                  style={{
                    marginTop: "15px",
                    cursor: "pointer",
                    textDecoration: "underline",
                    fontSize: "14px",
                    textAlign: "center",
                    color: "#000",
                  }}
                >
                  Back
                </p>
              </>
            )}

            {/* STEP 3: RESET PASSWORD */}
            {forgotStep === "reset" && (
              <>
                <h2 style={{ 
                  marginBottom: "20px", 
                  textAlign: "center", 
                  fontSize: isMobile ? "24px" : "28px",
                  color: "#000",
                  fontWeight: 600
                }}>
                  Set New Password
                </h2>

                <div style={{ position: "relative", marginBottom: "15px" }}>
                  <input
                    type={showNewPassword ? "text" : "password"}
                    placeholder="New password"
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      setPasswordError("");
                    }}
                    style={{
                      ...inputStyle,
                      color: "#000",
                      background: "rgba(255,255,255,0.9)",
                      padding: "0 45px 0 20px",
                      border: passwordError
                        ? "2px solid #ff4444"
                        : "2px solid rgba(0,0,0,0.2)",
                      boxShadow: passwordError
                        ? "0 0 0 3px rgba(255, 68, 68, 0.1)"
                        : "none",
                      marginBottom: "0",
                    }}
                  />
                  <Lock
                    size={isMobile ? 18 : 20}
                    style={{
                      position: "absolute",
                      right: "20px",
                      top: isMobile ? "12px" : "15px",
                      color: "rgba(0,0,0,0.7)",
                    }}
                  />
                </div>

                <div style={{ position: "relative", marginBottom: "15px" }}>
                  <input
                    type={showNewPassword ? "text" : "password"}
                    placeholder="Confirm password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setPasswordError("");
                    }}
                    style={{
                      ...inputStyle,
                      color: "#000",
                      background: "rgba(255,255,255,0.9)",
                      padding: "0 45px 0 20px",
                      border: passwordError
                        ? "2px solid #ff4444"
                        : "2px solid rgba(0,0,0,0.2)",
                      boxShadow: passwordError
                        ? "0 0 0 3px rgba(255, 68, 68, 0.1)"
                        : "none",
                      marginBottom: "0",
                    }}
                  />
                  <Lock
                    size={isMobile ? 18 : 20}
                    style={{
                      position: "absolute",
                      right: "20px",
                      top: isMobile ? "12px" : "15px",
                      color: "rgba(0,0,0,0.7)",
                    }}
                  />
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: "8px",
                    marginBottom: "15px",
                    cursor: "pointer",
                  }}
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? (
                    <EyeOff
                      size={isMobile ? 18 : 20}
                      style={{
                        color: "rgba(16, 185, 129, 0.8)",
                      }}
                    />
                  ) : (
                    <Eye
                      size={isMobile ? 18 : 20}
                      style={{
                        color: "rgba(16, 185, 129, 0.8)",
                      }}
                    />
                  )}
                  <span
                    style={{
                      fontSize: isMobile ? "12px" : "13px",
                      color: "rgba(0,0,0,0.8)",
                    }}
                  >
                    {showNewPassword ? "Hide passwords" : "Show passwords"}
                  </span>
                </div>

                {passwordError && (
                  <p
                    style={{
                      color: "#ff4444",
                      fontSize: "13px",
                      marginTop: "0px",
                      marginBottom: "12px",
                      textAlign: "center",
                    }}
                  >
                    ⚠️ {passwordError}
                  </p>
                )}

                <p
                  style={{
                    fontSize: isMobile ? "10px" : "11px",
                    color: "rgba(0,0,0,0.6)",
                    textAlign: "center",
                    marginBottom: "15px",
                  }}
                >
                  Password must be 8+ characters with uppercase, lowercase, and
                  special character
                </p>

                <button onClick={handleResetPassword} style={buttonStyle}>
                  Update Password
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}