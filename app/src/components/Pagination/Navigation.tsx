import Link from "next/link";
import type { PaginationProps } from "./Base";

type NavigationProps = {
  path?: PaginationProps["path"];
  icon: React.ReactNode;
  page: PaginationProps["page"];
  disabled: PaginationProps["disabled"];
};

export default function Navigation({
  path,
  icon,
  page,
  disabled,
}: NavigationProps) {
  return disabled ? (
    <button
      type="button"
      disabled={disabled}
      className={
        "w-6 h-6 text-gray-500 text-xs rounded font-bold flex justify-center items-center hover:bg-gray-300/70 dark:hover:bg-gray-700/70"
      }
    >
      {icon}
    </button>
  ) : (
    <Link
      href={`${path || ""}${page}`}
      className={
        "w-6 h-6 text-gray-500 text-xs rounded font-bold flex justify-center items-center hover:bg-gray-300/70 dark:hover:bg-gray-700/70"
      }
    >
      {icon}
    </Link>
  );
}
