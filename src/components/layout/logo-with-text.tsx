import React from "react";
import Logo from "@/components/logo";

interface LogoWithTextProps {
  textSize?: "sm" | "md" | "lg";
  className?: string;
}

export const LogoWithText: React.FC<LogoWithTextProps> = ({
  textSize = "md",
  className = "",
}) => {
  const sizeMap = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
  };

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <Logo size={textSize === "lg" ? 40 : textSize === "md" ? 32 : 24} showText={false} />
      <span 
        className={`${sizeMap[textSize]} font-bold text-primary`}
        style={{
          letterSpacing: "0.5px",
          textShadow: "0 1px 2px rgba(0, 0, 0, 0.05)"
        }}
      >
        فلوسي
      </span>
    </div>
  );
};

export default LogoWithText;