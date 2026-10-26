import { CITIES } from "../data/cities";

interface TripFiltersProps {
  from: string;
  to: string;
  onFromChange: (city: string) => void;
  onToChange: (city: string) => void;
}

export function TripFilters({ from, to, onFromChange, onToChange }: TripFiltersProps) {
  return (
    <div className="filters">
      <label>
        From
        <select value={from} onChange={(e) => onFromChange(e.target.value)}>
          <option value="">Any city</option>
          {CITIES.map((city) => <option key={city}>{city}</option>)}
        </select>
      </label>
      <label>
        To
        <select value={to} onChange={(e) => onToChange(e.target.value)}>
          <option value="">Any city</option>
          {CITIES.map((city) => <option key={city}>{city}</option>)}
        </select>
      </label>
      {(from || to) && (
        <button type="button" className="secondary" onClick={() => { onFromChange(""); onToChange(""); }}>
          Clear
        </button>
      )}
    </div>
  );
}