interface ConfigSelectorProps {
  label: string;
  value: string;
  variants: string[];
  labels?: Record<string, string>;
  onChange: (variant: string) => void;
}

export function ConfigSelector({ label, value, variants, labels, onChange }: ConfigSelectorProps) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label
        style={{ display: 'block', fontWeight: 600, marginBottom: 4, fontSize: '0.875rem' }}
      >
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: '100%',
          padding: '8px 12px',
          borderRadius: 8,
          border: '1px solid #d1d5db',
          fontSize: '0.875rem',
          background: 'white',
        }}
      >
        {variants.map((v) => (
          <option key={v} value={v}>
            {labels?.[v] ?? v}
          </option>
        ))}
      </select>
    </div>
  );
}
