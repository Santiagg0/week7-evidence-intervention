"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";

type Vehicle = {
  id: string;
  label: string;
  position: [number, number];
  speed: number;
  speedLimit: number;
  duration: number;
  locationLabel: string;
  coordinates: string;
};

type EventClass = {
  speedDifference: number;
  relativeExcess: number;
  priority: "NO EVENT" | "LOW EVENT PRIORITY" | "MEDIUM EVENT PRIORITY" | "HIGH EVENT PRIORITY";
  explanation: string;
};

const fleetVehicles: Vehicle[] = [
  {
    id: "MX-014",
    label: "MX-014",
    position: [19.4326, -99.1332],
    speed: 42,
    speedLimit: 60,
    duration: 12,
    locationLabel: "Centro Histórico / Paseo de la Reforma",
    coordinates: "19.4326, -99.1332",
  },
  {
    id: "MX-027",
    label: "MX-027",
    position: [19.4196, -99.1667],
    speed: 82,
    speedLimit: 60,
    duration: 18,
    locationLabel: "Insurgentes / Roma Norte",
    coordinates: "19.4196, -99.1667",
  },
  {
    id: "MX-041",
    label: "MX-041",
    position: [19.4815, -99.1465],
    speed: 51,
    speedLimit: 60,
    duration: 9,
    locationLabel: "Colonia del Valle",
    coordinates: "19.4815, -99.1465",
  },
  {
    id: "MX-052",
    label: "MX-052",
    position: [19.3573, -99.1478],
    speed: 57,
    speedLimit: 60,
    duration: 14,
    locationLabel: "Coyoacán / Viveros",
    coordinates: "19.3573, -99.1478",
  },
  {
    id: "MX-063",
    label: "MX-063",
    position: [19.405, -99.084],
    speed: 48,
    speedLimit: 60,
    duration: 11,
    locationLabel: "Tlalpan / Periférico",
    coordinates: "19.4050, -99.0840",
  },
];

const classifyEvent = (speed: number, speedLimit: number, duration: number): EventClass => {
  const speedDifference = speed - speedLimit;
  const relativeExcess = speedLimit === 0 ? 0 : (speedDifference / speedLimit) * 100;

  if (speedDifference <= 0) {
    return {
      speedDifference,
      relativeExcess,
      priority: "NO EVENT",
      explanation: "Observed speed did not exceed the declared threshold.",
    };
  }

  if (speedDifference > 15 && duration >= 10) {
    return {
      speedDifference,
      relativeExcess,
      priority: "HIGH EVENT PRIORITY",
      explanation: `Observed speed was ${speedDifference} km/h above the declared threshold for ${duration} seconds.`,
    };
  }

  if (speedDifference > 5) {
    return {
      speedDifference,
      relativeExcess,
      priority: "MEDIUM EVENT PRIORITY",
      explanation: `Observed speed exceeded the declared threshold by ${speedDifference} km/h for ${duration} seconds.`,
    };
  }

  return {
    speedDifference,
    relativeExcess,
    priority: "LOW EVENT PRIORITY",
    explanation: `Observed speed exceeded the declared threshold by ${speedDifference} km/h for ${duration} seconds.`,
  };
};

const vehiclesWithStatus = fleetVehicles.map((vehicle) => ({
  ...vehicle,
  classification: classifyEvent(vehicle.speed, vehicle.speedLimit, vehicle.duration),
}));

const FleetMap = dynamic(
  async () => {
    const { MapContainer, Marker, Popup, TileLayer } = await import("react-leaflet");
    const { divIcon } = await import("leaflet");

    return function FleetMap({
      vehicles,
      selectedVehicleId,
      onSelect,
    }: {
      vehicles: { id: string; label: string; position: [number, number]; classification: EventClass }[];
      selectedVehicleId: string;
      onSelect: (vehicleId: string) => void;
    }) {
      return (
        <MapContainer
          center={[19.4326, -99.1332]}
          zoom={11}
          scrollWheelZoom
          className="fleet-map"
          maxZoom={18}
          minZoom={8}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {vehicles.map((vehicle) => {
            const isSelected = vehicle.id === selectedVehicleId;
            const isPrimary = vehicle.id === "MX-027";
            const markerColor = isPrimary ? "#f97316" : isSelected ? "#1d4ed8" : "#2563eb";

            const icon = divIcon({
              className: "fleet-marker-wrapper",
              html: `<div style="background:${markerColor}; border: ${isSelected ? "3px solid #0f172a" : "2px solid #ffffff"}; box-shadow: 0 8px 22px rgba(15, 23, 42, 0.2); width: ${isPrimary ? 22 : 16}px; height: ${isPrimary ? 22 : 16}px; border-radius: 9999px; transform: scale(${isPrimary ? 1.3 : 1});"></div>`,
              iconSize: [28, 28],
              iconAnchor: [14, 14],
            });

            return (
              <Marker
                key={vehicle.id}
                position={vehicle.position}
                icon={icon}
                eventHandlers={{
                  click: () => onSelect(vehicle.id),
                }}
              >
                <Popup>
                  <div className="popup-card">
                    <strong>{vehicle.label}</strong>
                    <div>{vehicle.classification.priority}</div>
                    <div>{vehicle.classification.explanation}</div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      );
    };
  },
  { ssr: false, loading: () => <div className="map-loading">Loading map…</div> }
);

export default function Home() {
  const [selectedVehicleId, setSelectedVehicleId] = useState("MX-027");
  const [reviewOpened, setReviewOpened] = useState(false);
  const [interventionRecorded, setInterventionRecorded] = useState(false);
  const [retestRun, setRetestRun] = useState(false);

  const selectedVehicle = useMemo(
    () => vehiclesWithStatus.find((vehicle) => vehicle.id === selectedVehicleId) ?? vehiclesWithStatus[1],
    [selectedVehicleId]
  );

  const highPriority = selectedVehicle.classification.priority === "HIGH EVENT PRIORITY";

  const observedChange = -40;
  const baselineRate = 8.2;
  const retestRate = 4.9;

  return (
    <div className="dashboard-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Evidence-to-Intervention Layer</p>
          <h1>Evidence-to-Intervention Layer</h1>
        </div>
        <div className="header-right">
          <span className="pilot-label">Mexico Fleet Pilot</span>
          <span className="simulated-badge">SIMULATED DATA — NO REAL DRIVER INFORMATION</span>
        </div>
      </header>

      <main className="dashboard-grid">
        <section className="panel map-panel">
          <div className="panel-header">
            <h2>Vehicle network</h2>
            <span className="muted-tag">SENSE</span>
          </div>
          <FleetMap
            vehicles={vehiclesWithStatus}
            selectedVehicleId={selectedVehicleId}
            onSelect={setSelectedVehicleId}
          />
          <div className="legend">
            <span><i className="dot blue" /> Active</span>
            <span><i className="dot orange" /> Primary event</span>
          </div>
        </section>

        <aside className="stack">
          <section className="panel telemetry-panel">
            <div className="panel-header">
              <h2>Telemetry</h2>
              <span className="muted-tag">MX-027 selected</span>
            </div>
            <div className="telemetry-grid">
              <div className="metric-row"><span>Observed speed</span><strong>{selectedVehicle.speed} km/h</strong></div>
              <div className="metric-row"><span>Declared threshold</span><strong>{selectedVehicle.speedLimit} km/h</strong></div>
              <div className="metric-row"><span>Magnitude above threshold</span><strong>+{selectedVehicle.classification.speedDifference} km/h</strong></div>
              <div className="metric-row"><span>Duration</span><strong>{selectedVehicle.duration} seconds</strong></div>
            </div>
            <div className="location-box">
              <span className="label">Location</span>
              <p>{selectedVehicle.locationLabel}</p>
              <p className="small-print">Coordinates: {selectedVehicle.coordinates}</p>
            </div>
          </section>

          <section className="panel triage-panel">
            <div className="panel-header">
              <h2>Event-level ML triage</h2>
              <span className="muted-tag">TRIAGE</span>
            </div>
            <div className="priority-header">
              <span className="priority-pill high">{selectedVehicle.classification.priority}</span>
            </div>
            <p className="triage-text">
              Speed difference: {selectedVehicle.classification.speedDifference} km/h
            </p>
            <p className="triage-text">
              Relative excess: {selectedVehicle.classification.relativeExcess.toFixed(1)}%
            </p>
            <p className="triage-text">
              {selectedVehicle.classification.explanation}
            </p>
          </section>
        </aside>
      </main>

      <section className="bottom-grid">
        <div className="panel review-panel">
          {highPriority && (
            <>
              <div className="panel-header review-header">
                <div>
                  <h2>MANAGER REVIEW REQUIRED</h2>
                  <p>This event needs human review before the intervention is finalized.</p>
                </div>
              </div>

              {!reviewOpened && !interventionRecorded && (
                <button className="primary-button" onClick={() => setReviewOpened(true)}>
                  Review event
                </button>
              )}

              {reviewOpened && !interventionRecorded && (
                <div className="evidence-box">
                  <div className="evidence-summary">
                    <span>Evidence reviewed</span>
                    <strong>MX-027 speeding episode</strong>
                  </div>
                  <ul>
                    <li>Observed speed: 82 km/h</li>
                    <li>Declared threshold: 60 km/h</li>
                    <li>Duration: 18 seconds</li>
                    <li>Classification: HIGH EVENT PRIORITY</li>
                  </ul>
                  <button
                    className="success-button"
                    onClick={() => {
                      setReviewOpened(false);
                      setInterventionRecorded(true);
                    }}
                  >
                    Approve targeted feedback
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        <div className="panel intervention-panel">
          {interventionRecorded ? (
            <>
              <div className="panel-header intervention-header">
                <h2>Targeted feedback recorded</h2>
                <span className="muted-tag success">INTERVENTION</span>
              </div>
              <div className="intervention-list">
                <div><span>Event:</span> MX-027 speeding episode</div>
                <div><span>Action:</span> Event-specific speeding feedback</div>
                <div><span>Status:</span> Intervention recorded</div>
              </div>
              <button className="primary-button" onClick={() => setRetestRun(true)}>
                Run simulated retest
              </button>
            </>
          ) : (
            <div className="panel-header">
              <h2>Intervention</h2>
              <span className="muted-tag">WAITING</span>
            </div>
          )}
        </div>

        <div className="panel retest-panel">
          {retestRun ? (
            <>
              <div className="panel-header">
                <h2>Simulated retest</h2>
                <span className="muted-tag">RETEST</span>
              </div>
              <div className="retest-grid">
                <div className="retest-box">
                  <span>BASELINE</span>
                  <strong>{baselineRate.toFixed(1)} speeding episodes / 100 km</strong>
                </div>
                <div className="retest-box">
                  <span>RETEST</span>
                  <strong>{retestRate.toFixed(1)} speeding episodes / 100 km</strong>
                </div>
              </div>
              <div className="delta-box">
                <span>OBSERVED CHANGE</span>
                <strong>approximately {observedChange}%</strong>
              </div>
              <div className="claim-box">
                <h3>SUPPORTED CLAIM</h3>
                <p>Observed speeding episodes decreased by approximately 40% under the declared comparison conditions.</p>
              </div>
              <div className="limit-box">
                <h3>EVIDENCE LIMIT</h3>
                <p>This does NOT mean transportation became 40% safer. Crash risk, injuries and total transportation safety were not measured.</p>
                <p>Compared per 100 km under the same declared speeding-event definition. Route and traffic conditions may still differ.</p>
              </div>
            </>
          ) : (
            <div className="panel-header">
              <h2>Retest</h2>
              <span className="muted-tag">PENDING</span>
            </div>
          )}
        </div>
      </section>

      <section className="principles panel">
        <div className="principle-column">
          <h3>WHAT THIS SYSTEM DOES</h3>
          <p>Classifies measurable events and routes interventions.</p>
        </div>
        <div className="principle-column danger-column">
          <h3>WHAT THIS SYSTEM DOES NOT DO</h3>
          <p>It does not classify people, rank drivers, predict crashes, or make disciplinary decisions.</p>
        </div>
      </section>
    </div>
  );
}
