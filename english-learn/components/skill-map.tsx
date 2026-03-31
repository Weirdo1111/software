import Link from "next/link";
import { CheckCircle2, Circle, Lock } from "lucide-react";

const nodes = [
  { id: "node-1", label: "Listening Basics", status: "done", href: "/listening" },
  { id: "node-2", label: "Speaking Starter", status: "done", lesson: "A2-speaking-starter" },
  { id: "node-3", label: "Reading Library", status: "active", href: "/reading" },
  { id: "node-4", label: "Writing Focus", status: "active", lesson: "A2-writing-starter" },
  { id: "node-5", label: "Integrated Challenge", status: "locked", lesson: "A2-integrated-challenge" },
] as const;

export function SkillMap({ locale }: { locale: "zh" | "en" }) {
  return (
    <section className="rounded-3xl border border-black/15 bg-white p-5">
      <h2 className="text-lg font-semibold tracking-tight">Skill Map</h2>
      <p className="mt-1 text-sm text-black/60">Follow the path from single skills to integrated communication.</p>

      <ol className="mt-5 grid gap-3">
        {nodes.map((node, index) => {
          const isDone = node.status === "done";
          const isLocked = node.status === "locked";

          return (
            <li key={node.id} className="relative rounded-2xl border border-black/10 p-4">
              {index < nodes.length - 1 ? (
                <span className="absolute -bottom-4 left-5 h-4 w-px bg-black/15" aria-hidden />
              ) : null}

              <div className="flex items-start justify-between gap-3">
                <div className="inline-flex items-center gap-2">
                  {isDone ? (
                    <CheckCircle2 className="size-5 text-emerald-600" />
                  ) : isLocked ? (
                    <Lock className="size-5 text-black/45" />
                  ) : (
                    <Circle className="size-5 text-blue-600" />
                  )}
                  <div>
                    <p className="text-sm font-semibold tracking-tight">{node.label}</p>
                    <p className="text-xs text-black/55">
                      {isLocked
                        ? "Complete previous nodes to unlock"
                        : "href" in node
                          ? "Browse articles, save favorites, and continue to feedback practice"
                          : "Recommended 8-10 minutes"}
                    </p>
                  </div>
                </div>

                {isLocked ? (
                  <span className="rounded-full bg-black/10 px-2 py-1 text-xs font-medium text-black/55">Locked</span>
                ) : (
                  <Link
                    href={"href" in node ? `${node.href}?lang=${locale}` : `/lesson/${node.lesson}?lang=${locale}`}
                    className="rounded-full border border-black/25 px-3 py-1 text-xs font-semibold text-black transition hover:bg-black hover:text-white"
                  >
                    Open
                  </Link>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
