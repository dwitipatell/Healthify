/**
 * Reusable Logo Component
 * Used consistently across the entire webapp
 */

export function LogoIcon({ size = 24, color = "white" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="18" height="18" rx="4" fill={color} opacity=".2" stroke={color} strokeWidth="1.5" />
      <path d="M12 8v8M8 12h8" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

export function LogoText({ size = "large", color = "text", hideText = false }) {
  const sizes = {
    large: { text: 18, weight: 700 },
    medium: { text: 16, weight: 600 },
    small: { text: 14, weight: 600 },
  };

  const colors = {
    text: "#0F2422",
    white: "#FFFFFF",
    muted: "#4B7B76",
  };

  const sizeStyle = sizes[size];
  const colorValue = colors[color] || color;

  return (
    <span style={{
      fontSize: sizeStyle.text,
      fontWeight: sizeStyle.weight,
      fontFamily: "'DM Sans', sans-serif",
      color: colorValue,
    }}>
      Health<span style={{ color: "#0D9488" }}>ify</span>
    </span>
  );
}

export function Logo({ 
  size = "medium", 
  variant = "horizontal",
  logoColor = "white",
  textColor = "white",
  hideText = false,
}) {
  const sizes = {
    small: { icon: 20, gap: 8, padding: 6 },
    medium: { icon: 24, gap: 10, padding: 8 },
    large: { icon: 30, gap: 12, padding: 10 },
  };

  const sizeStyle = sizes[size];

  if (variant === "icon-only") {
    return <LogoIcon size={sizeStyle.icon} color={logoColor} />;
  }

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: sizeStyle.gap,
      padding: sizeStyle.padding,
    }}>
      <div style={{
        width: sizeStyle.icon + 10,
        height: sizeStyle.icon + 10,
        borderRadius: 6,
        background: logoColor + "15",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        <LogoIcon size={sizeStyle.icon} color={logoColor} />
      </div>
      {!hideText && <LogoText size={size} color={textColor} />}
    </div>
  );
}
