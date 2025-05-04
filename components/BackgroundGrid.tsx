import Image from "next/image";
import React from "react";

export default function BackgroundGrid() {
  return (
    <div className="absolute z-[-1] top-0 left-0 right-0 bottom-0">
      <Image
        src="/ooorganize.svg"
        layout="fill"
        objectFit="cover"
        alt="background"
        className="dark:invert"
      />
    </div>
  );
}
