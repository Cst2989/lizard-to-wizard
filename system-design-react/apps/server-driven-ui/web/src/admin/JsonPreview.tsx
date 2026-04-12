interface JsonPreviewProps {
  data: unknown;
  title?: string;
}

export function JsonPreview({ data, title }: JsonPreviewProps) {
  return (
    <div>
      {title && (
        <h3
          style={{
            fontSize: '0.875rem',
            fontWeight: 600,
            marginBottom: 8,
            color: '#374151',
          }}
        >
          {title}
        </h3>
      )}
      <pre
        style={{
          background: '#1f2937',
          color: '#e5e7eb',
          padding: 16,
          borderRadius: 8,
          fontSize: '0.75rem',
          overflow: 'auto',
          maxHeight: 400,
          lineHeight: 1.5,
        }}
      >
        <code>{JSON.stringify(data, null, 2)}</code>
      </pre>
    </div>
  );
}
