import React from "react";

export default function GridShape() {
  return (
    <>
      <div className="pointer-events-none absolute -right-16 top-0 -z-1 h-64 w-64 rounded-full bg-brand-500/10 blur-3xl xl:h-80 xl:w-80" />
      <div className="pointer-events-none absolute -bottom-16 -left-16 -z-1 h-64 w-64 rounded-full bg-brand-400/10 blur-3xl xl:h-80 xl:w-80" />
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent dark:via-gray-700" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 -z-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent dark:via-gray-700" />
      <div className="pointer-events-none absolute inset-y-0 left-0 -z-1 w-px bg-gradient-to-b from-transparent via-gray-300 to-transparent dark:via-gray-700" />
      <div className="pointer-events-none absolute inset-y-0 right-0 -z-1 w-px bg-gradient-to-b from-transparent via-gray-300 to-transparent dark:via-gray-700" />
    </>
  );
}
