export default function AboutPage() {
  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div>
        <span className="text-xs uppercase tracking-[0.3em] text-marigold-400">
          Est. 1971
        </span>
        <h1 className="text-2xl font-semibold text-oyster-100 mt-2">
          About Lucky Sofa 88
        </h1>
      </div>

      <p className="text-oyster-300">
        Lucky Sofa 88 has been furnishing rooms for a good, long night since
        1971. Every piece in our catalogue has featured at the Milan
        International Furniture Show — the kind of pedigree you feel the
        moment you sit down.
      </p>

      <p className="text-oyster-300">
        We only use the finest and rarest materials: chrome that catches the
        lamplight just right, smoked glass, and upholstery built for a room
        at 11pm, not a showroom at noon.
      </p>

      <p className="text-oyster-400 text-sm">
        Browse the catalogue, keep an eye on your balance, and let our
        shopping assistant help you find something very comfy.
      </p>
    </div>
  );
}
