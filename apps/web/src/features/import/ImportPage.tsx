export function ImportPage() {
  return (
    <main className="screen library">
      <section className="readingHeader">
        <p>TXT / Markdown</p>
        <h1>Articles</h1>
      </section>

      <section className="importPanel">
        <label className="importDrop">
          <span>Import TXT or Markdown article</span>
          <strong>Choose a .txt or .md file</strong>
          <input
            aria-label="Import TXT or Markdown article"
            type="file"
            accept=".txt,.md,.markdown,text/plain,text/markdown"
          />
        </label>
        <div className="generationSteps" aria-label="Fixture import generation state">
          <span>Stored article</span>
          <span>First segment starts first</span>
          <span>Later segments preparing</span>
        </div>
      </section>

      <section className="libraryItem">
        <p>Fixture mode</p>
        <h2>City reading program</h2>
        <span>First segment generated</span>
      </section>
    </main>
  );
}
