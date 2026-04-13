import TagSelector from "./TagSelector";

export default function CartaoTags(props) {
  return (
    <section
      className="mb-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
      aria-labelledby="cartao-tags-titulo"
    >
      <h2 id="cartao-tags-titulo" className="sr-only">
        Tags do cartão
      </h2>
      <TagSelector {...props} />
    </section>
  );
}
