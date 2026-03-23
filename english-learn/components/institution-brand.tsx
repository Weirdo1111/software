import Image from "next/image";

import { type Locale } from "@/lib/i18n/dictionaries";
import { cn } from "@/lib/utils";

export function InstitutionBrand({
  locale,
  className,
  embedded = false,
}: {
  locale: Locale;
  className?: string;
  embedded?: boolean;
}) {
  const alt =
    locale === "zh"
      ? "中南大学邓迪国际学院官方标识"
      : "Dundee International Institute of Central South University official logo";

  if (embedded) {
    return (
      <div className={cn("institution-brand", className)}>
        <Image
          src="/dii-brand/ddlogo.png"
          alt={alt}
          width={380}
          height={52}
          priority
          className="institution-brand-image"
        />
      </div>
    );
  }

  return (
    <div className={cn("institution-brand", className)}>
      <div className="institution-brand-plate">
        <Image
          src="/dii-brand/ddlogo.png"
          alt={alt}
          width={380}
          height={52}
          priority
          className="institution-brand-image"
        />
      </div>
    </div>
  );
}
