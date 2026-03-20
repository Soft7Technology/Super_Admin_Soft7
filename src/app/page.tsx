"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
export default function RootPage() {
  const router = useRouter();
  useEffect(() => {
    // Check if accessToken cookie exists
    const hasToken = document.cookie.split(";").some((c) => c.trim().startsWith("accessToken="));
    if (hasToken) {
      router.replace("/user/dashboard");
    } else {
      router.replace("/auth");
    }
  }, [router]);
  return (
    <div style={{ display:"flex",alignItems:"center",justifyContent:"center",height:"100vh",background:"#070b14",flexDirection:"column",gap:"16px" }}>
      <div style={{ width:"36px",height:"36px",border:"3px solid #1c2333",borderTop:"3px solid #4dabf7",borderRadius:"50%",animation:"spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
