import React from "react";

interface LogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ 
  className = "", 
  size = 40,
  showText = true
}) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div 
        style={{ 
          width: size * 1.3, 
          height: size * 1.3, 
          borderRadius: "50%", 
          backgroundColor: "hsl(176, 70%, 33%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 8px rgba(0, 150, 136, 0.2)"
        }}
      >
        <div 
          style={{ 
            width: size * 1.2, 
            height: size * 1.2, 
            borderRadius: "50%", 
            backgroundColor: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            boxShadow: "inset 0 2px 4px rgba(0, 0, 0, 0.05)"
          }}
        >
          <img 
            src="/images/logo-black-riyal-larger.png" 
            alt="شعار فلوسي" 
            style={{ 
              width: size * 1.15,
              height: size * 1.15,
              objectFit: "cover",
              transform: "scale(1.05)"
            }}
          />
        </div>
      </div>
      
      {showText && (
        <span 
          className="font-bold text-primary mr-2"
          style={{
            fontSize: size * 0.5,
            letterSpacing: "0.5px",
            textShadow: "0 1px 2px rgba(0, 0, 0, 0.05)"
          }}
        >
          فلوسي
        </span>
      )}
    </div>
  );
};

export default Logo;