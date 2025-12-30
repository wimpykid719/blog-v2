import Link from "next/link";
import type { PaginationProps } from "./Base";

type NumberProps = {
  path?: PaginationProps["path"];
  page: PaginationProps["page"];
  selected: boolean;
  disabled: boolean;
  ariaCurrent?: "true";
};

export default function NumberComponent({
  path,
  page,
  disabled,
  selected,
  ariaCurrent,
}: NumberProps) {
  const variants = {
    default:
      "text-gray-500 bg-gray-300/0 dark:bg-gray-700/0 hover:bg-gray-300/70 dark:hover:bg-gray-700/70",
    selected:
      "sub-text-color bg-primary-blue shadow-pagination hover:bg-primary-blue/70",
  };

  return disabled ? (
    <button
      type="button"
      aria-current={ariaCurrent}
      disabled={disabled}
      className={`
          ${selected ? variants.selected : variants.default}
          w-6 h-6
          text-xs
          rounded font-bold
          flex justify-center items-center
        `}
    >
      {page}
    </button>
  ) : (
    <Link
      href={`${path || ""}${page}`}
      aria-current={ariaCurrent}
      className={`
        ${selected ? variants.selected : variants.default}
        ${page < 100 ? "w-6" : "px-1"} h-6
        text-xs
        rounded font-bold
        flex justify-center items-center
      `}
    >
      {page}
    </Link>
  );
}
