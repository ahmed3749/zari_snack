export default function SectionHeading({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="space-y-2.5">
      <span className="inline-flex rounded-full bg-amber-100 px-4 py-1 text-xs font-bold uppercase tracking-[0.28em] text-amber-800">
        Sélection maison
      </span>
      <h2 className="section-title text-5xl leading-none text-slate-950 md:text-6xl">
        {title}
      </h2>
      <p className="max-w-2xl text-sm leading-6 text-slate-600">{description}</p>
    </div>
  );
}
