import type { SchemaField } from "@/lib/types";

export function SchemaTable({ schema }: { schema: SchemaField[] }) {
  return (
    <div className="overflow-x-auto rounded-[10px] border border-border">
      <table className="w-full min-w-[560px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-border bg-surface text-left font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
            <th className="px-4 py-3 font-normal">Field</th>
            <th className="px-4 py-3 font-normal">Type</th>
            <th className="px-4 py-3 font-normal">Nullable</th>
            <th className="px-4 py-3 font-normal">Description</th>
          </tr>
        </thead>
        <tbody>
          {schema.map((f) => (
            <tr key={f.name} className="border-b border-border last:border-0">
              <td className="px-4 py-3 font-mono text-[13px] text-foreground">{f.name}</td>
              <td className="px-4 py-3 font-mono text-[13px] text-accent-strong dark:text-accent">{f.type}</td>
              <td className="px-4 py-3 font-mono text-[12px] text-muted-foreground">{f.nullable ? "yes" : "no"}</td>
              <td className="px-4 py-3 text-muted-foreground">{f.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
