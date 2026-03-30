import { BuddyCompanion } from "@/components/home/buddy-companion";

export default function Loading() {
  return (
    <main className="buddy-loading-screen" aria-live="polite" aria-busy="true">
      <div className="buddy-loading-card">
        <div className="buddy-loading-badge">Loading</div>

        <div className="buddy-loading-stage">
          <div className="buddy-loading-orbit" />
          <div className="buddy-loading-orbit buddy-loading-orbit-delayed" />

          <div className="buddy-loading-track">
            <span className="buddy-loading-lane buddy-loading-lane-one" />
            <span className="buddy-loading-lane buddy-loading-lane-two" />
            <span className="buddy-loading-spark buddy-loading-spark-one" />
            <span className="buddy-loading-spark buddy-loading-spark-two" />
            <span className="buddy-loading-spark buddy-loading-spark-three" />

            <div className="buddy-loading-runner">
              <BuddyCompanion
                stage="growing"
                focus="coursework"
                variant="bear"
                mood="proud"
                float={false}
                className="buddy-loading-pet"
              />
            </div>
          </div>
        </div>

        <p className="buddy-loading-title">Loading</p>
        <p className="buddy-loading-note">Your buddy is hurrying to the next stop.</p>
      </div>
    </main>
  );
}
