import { getRoleInfo } from "../../../utils/roles";

export function RoleBadge({ role, size = "sm" }) {
  const info = getRoleInfo(role);
  const Icon = info.icon;

  const sizes = {
    sm: "px-2 py-0.5 text-[10px] gap-1",
    md: "px-3 py-1 text-xs gap-1.5",
    lg: "px-4 py-1.5 text-sm gap-2",
  };
  const iconSize = { sm: 10, md: 12, lg: 14 };

  return (
    <span
      className={`inline-flex items-center rounded-full font-bold uppercase tracking-wider ${info.bgColor} ${info.textColor} ${sizes[size]}`}
    >
      <Icon size={iconSize[size]} />
      {info.shortLabel}
    </span>
  );
}
