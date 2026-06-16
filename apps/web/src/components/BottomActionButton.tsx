import type { ReactNode } from "react";

interface BottomActionButtonProps {
  onClick: () => void;
  children: ReactNode;
  icon?: ReactNode;
}

export function BottomActionButton({ onClick, children, icon }: BottomActionButtonProps) {
  return (
    <button className="bottomActionButton" type="button" onClick={onClick}>
      {icon}
      {children}
    </button>
  );
}
