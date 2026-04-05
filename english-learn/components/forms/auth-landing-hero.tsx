import Image from "next/image";

type AuthLandingHeroProps = {
  badge: string;
  title: string;
  subtitle: string;
  highlights: string[];
  caption: string;
};

export function AuthLandingHero({
  badge,
  title,
  subtitle,
  highlights,
  caption,
}: AuthLandingHeroProps) {
  return (
    <div className="relative z-10 flex h-full flex-col">
      <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/85 bg-white/88 px-4 py-2 text-[11px] font-semibold tracking-[0.24em] text-slate-500 shadow-[0_8px_18px_rgba(90,123,255,0.08)]">
        <span className="inline-block h-2 w-2 rounded-full bg-[#5a7bff]" />
        {badge}
      </div>

      <h1 className="font-display mt-7 max-w-[760px] text-[42px] leading-[1.06] tracking-[-0.035em] text-[#1f2b43] md:text-[58px] lg:text-[72px]">
        {title}
      </h1>

      <p className="mt-5 max-w-[620px] text-[18px] leading-8 text-slate-500">
        {subtitle}
      </p>

      <div className="mt-6 flex flex-wrap gap-3">
        {highlights.map((item) => (
          <span
            key={item}
            className="rounded-full border border-white/85 bg-white/82 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#5f6f90] shadow-[0_8px_18px_rgba(90,123,255,0.08)]"
          >
            {item}
          </span>
        ))}
      </div>

      <div className="mt-8 overflow-hidden rounded-[2.2rem] border-2 border-white/80 bg-white/70 shadow-[0_16px_0_rgba(143,196,255,0.12),0_24px_40px_rgba(90,123,255,0.1)]">
        <Image
          src="/Gemini_Generated_Image_bjoegbbjoegbbjoe.png"
          alt="DIICSU campus welcome illustration"
          width={1365}
          height={768}
          priority
          className="h-auto w-full object-cover"
        />
      </div>

      <div className="mt-5 rounded-[1.6rem] border border-white/80 bg-white/80 px-5 py-4 text-sm leading-7 text-slate-600 shadow-[0_10px_22px_rgba(90,123,255,0.08)]">
        {caption}
      </div>
    </div>
  );
}
