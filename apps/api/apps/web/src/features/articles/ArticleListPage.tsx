1|import { useState, useEffect } from 'react';
2|import { Upload, FileText, CheckCircle, AlertCircle, BookOpen, Clock, Edit2, Trash2, X } from 'lucide-react';
3|import { importArticle, listArticles, deleteArticle, type Article } from '../../api/articles';
4|
5|export function ArticleListPage() {
6|  const [articles, setArticles] = useState<Article[]>([]);
7|  const [loading, setLoading] = useState(true);
8|  const [showImportForm, setShowImportForm] = useState(false);
9|  const [editMode, setEditMode] = useState(false);
10|  const [selectedArticles, setSelectedArticles] = useState<Set<string>>(new Set());
11|  const [deleting, setDeleting] = useState(false);
12|  
13|  // Import form state
14|  const [title, setTitle] = useState('');
15|  const [text, setText] = useState('');
16|  const [importing, setImporting] = useState(false);
17|  const [success, setSuccess] = useState(false);
18|  const [error, setError] = useState<string | null>(null);
19|
20|  useEffect(() => {
21|    loadArticles();
22|  }, []);
23|
24|  async function loadArticles() {
25|    setLoading(true);
26|    try {
27|      const result = await listArticles();
28|      setArticles(result);
29|    } catch (err) {
30|      console.error('Failed to load articles:', err);
31|    } finally {
32|      setLoading(false);
33|    }
34|  }
35|
36|  async function handleImport() {
37|    if (!title.trim() || !text.trim()) {
38|      setError('Title and text are required');
39|      return;
40|    }
41|
42|    setImporting(true);
43|    setError(null);
44|    setSuccess(false);
45|
46|    try {
47|      await importArticle({
48|        title: title.trim(),
49|        rawText: text.trim(),
50|        sourceType: 'txt',
51|      });
52|
53|      setSuccess(true);
54|      setTitle('');
55|      setText('');
56|      setShowImportForm(false);
57|
58|      // Reload articles list
59|      await loadArticles();
60|
61|      setTimeout(() => setSuccess(false), 3000);
62|    } catch (err) {
63|      console.error('Import failed:', err);
64|      setError(err instanceof Error ? err.message : 'Import failed');
65|    } finally {
66|      setImporting(false);
67|    }
68|  }
69|
70|  async function handleBatchDelete() {
71|    if (selectedArticles.size === 0) return;
72|    
73|    if (!confirm(`Delete ${selectedArticles.size} article(s)? This cannot be undone.`)) {
74|      return;
75|    }
76|
77|    setDeleting(true);
78|    try {
79|      await Promise.all(
80|        Array.from(selectedArticles).map(id => deleteArticle(id))
81|      );
82|      
83|      setSelectedArticles(new Set());
84|      setEditMode(false);
85|      await loadArticles();
86|    } catch (err) {
87|      console.error('Delete failed:', err);
88|      alert('Failed to delete articles');
89|    } finally {
90|      setDeleting(false);
91|    }
92|  }
93|
94|  function toggleArticleSelection(articleId: string) {
95|    const newSelected = new Set(selectedArticles);
96|    if (newSelected.has(articleId)) {
97|      newSelected.delete(articleId);
98|    } else {
99|      newSelected.add(articleId);
100|    }
101|    setSelectedArticles(newSelected);
102|  }
103|
104|  function toggleSelectAll() {
105|    if (selectedArticles.size === articles.length) {
106|      setSelectedArticles(new Set());
107|    } else {
108|      setSelectedArticles(new Set(articles.map(a => a.id)));
109|    }
110|  }
111|
112|  function formatDate(dateString: string) {
113|    const date = new Date(dateString);
114|    const now = new Date();
115|    const diffMs = now.getTime() - date.getTime();
116|    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
117|    
118|    if (diffDays === 0) return 'Today';
119|    if (diffDays === 1) return 'Yesterday';
120|    if (diffDays < 7) return `${diffDays} days ago`;
121|    return date.toLocaleDateString();
122|  }
123|
124|  return (
125|    <>
126|      <header style={{ marginBottom: 'var(--space-4)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
127|        <div>
128|          <h1>Articles</h1>
129|          <p style={{ color: 'var(--vercel-gray-600)', marginTop: 'var(--space-1)' }}>
130|            {loading ? 'Loading...' : `${articles.length} articles imported`}
131|          </p>
132|        </div>
133|        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
134|          {!editMode ? (
135|            <>
136|              <button 
137|                className="btn btn-secondary"
138|                onClick={() => setEditMode(true)}
139|                disabled={articles.length === 0}
140|              >
141|                <Edit2 size={16} />
142|                Edit
143|              </button>
144|              <button 
145|                className="btn btn-primary"
146|                onClick={() => setShowImportForm(!showImportForm)}
147|              >
148|                <Upload size={16} />
149|                {showImportForm ? 'Cancel' : 'Import Article'}
150|              </button>
151|            </>
152|          ) : (
153|            <>
154|              <button 
155|                className="btn btn-secondary"
156|                onClick={() => {
157|                  setEditMode(false);
158|                  setSelectedArticles(new Set());
159|                }}
160|              >
161|                <X size={16} />
162|                Cancel
163|              </button>
164|              <button 
165|                className="btn"
166|                onClick={handleBatchDelete}
167|                disabled={selectedArticles.size === 0 || deleting}
168|                style={{
169|                  background: selectedArticles.size > 0 ? '#dc2626' : undefined,
170|                  color: selectedArticles.size > 0 ? 'white' : undefined,
171|                }}
172|              >
173|                <Trash2 size={16} />
174|                {deleting ? 'Deleting...' : `Delete (${selectedArticles.size})`}
175|              </button>
176|            </>
177|          )}
178|        </div>
179|      </header>
180|
181|      {success && (
182|        <div
183|          style={{
184|            padding: 'var(--space-3)',
185|            marginBottom: 'var(--space-3)',
186|            borderRadius: 'var(--radius-md)',
187|            background: '#f0fdf4',
188|            border: '1px solid #86efac',
189|            display: 'flex',
190|            alignItems: 'center',
191|            gap: 'var(--space-2)',
192|            193|          }}
194|        >
195|          <CheckCircle size={20} color="#16a34a" />
196|          <span style={{ color: '#16a34a', fontSize: '14px' }}>
197|            Article imported successfully!
198|          </span>
199|        </div>
200|      )}
201|
202|      {showImportForm && (
203|        <div className="card" style={{ padding: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
204|          {error && (
205|            <div
206|              style={{
207|                padding: 'var(--space-3)',
208|                marginBottom: 'var(--space-3)',
209|                borderRadius: 'var(--radius-md)',
210|                background: '#fef2f2',
211|                border: '1px solid #fca5a5',
212|                display: 'flex',
213|                alignItems: 'center',
214|                gap: 'var(--space-2)',
215|              }}
216|            >
217|              <AlertCircle size={20} color="#dc2626" />
218|              <span style={{ color: '#dc2626', fontSize: '14px' }}>{error}</span>
219|            </div>
220|          )}
221|
222|          <div style={{ marginBottom: 'var(--space-3)' }}>
223|            <label
224|              style={{
225|                display: 'block',
226|                fontSize: '14px',
227|                fontWeight: '500',
228|                marginBottom: 'var(--space-1)',
229|              }}
230|            >
231|              Article Title
232|            </label>
233|            <input
234|              type="text"
235|              placeholder="Enter article title..."
236|              value={title}
237|              onChange={(e) => setTitle(e.target.value)}
238|              disabled={importing}
239|              style={{ width: '100%' }}
240|            />
241|          </div>
242|
243|          <div style={{ marginBottom: 'var(--space-3)' }}>
244|            <label
245|              style={{
246|                display: 'block',
247|                fontSize: '14px',
248|                fontWeight: '500',
249|                marginBottom: 'var(--space-1)',
250|              }}
251|            >
252|              Article Text
253|            </label>
254|            <textarea
255|              placeholder="Paste article text here..."
256|              value={text}
257|              onChange={(e) => setText(e.target.value)}
258|              disabled={importing}
259|              rows={12}
260|              style={{
261|                width: '100%',
262|                fontFamily: 'inherit',
263|                resize: 'vertical',
264|              }}
265|            />
266|          </div>
267|
268|          <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
269|            <button
270|              className="btn btn-primary"
271|              onClick={handleImport}
272|              disabled={!title.trim() || !text.trim() || importing}
273|            >
274|              <Upload size={16} />
275|              Import Article
276|            </button>
277|
278|            <button className="btn btn-secondary" disabled>
279|              <FileText size={16} />
280|              Upload File
281|            </button>
282|          </div>
283|
284|          <p
285|            style={{
286|              fontSize: '14px',
287|              color: 'var(--vercel-gray-500)',
288|              marginTop: 'var(--space-3)',
289|            }}
290|          >
291|            The article will be automatically segmented and AI will generate expression candidates.
292|          </p>
293|        </div>
294|      )}
295|
296|      {/* Edit Mode Header */}
297|      {editMode && articles.length > 0 && (
298|        <div style={{ marginBottom: 'var(--space-3)' }}>
299|          <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', cursor: 'pointer' }}>
300|            <input
301|              type="checkbox"
302|              checked={selectedArticles.size === articles.length}
303|              onChange={toggleSelectAll}
304|              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
305|            />
306|            <span style={{ fontSize: '14px', color: 'var(--vercel-gray-600)' }}>
307|              Select all ({articles.length})
308|            </span>
309|          </label>
310|        </div>
311|      )}
312|
313|      {/* Importing Loading Dialog */}
314|      {importing && (
315|        <>
316|          {/* Backdrop */}
317|          <div
318|            style={{
319|              position: 'fixed',
320|              top: 0,
321|              left: 0,
322|              right: 0,
323|              bottom: 0,
324|              background: 'rgba(0, 0, 0, 0.3)',
325|              zIndex: 999,
326|            }}
327|          />
328|          {/* Loading Dialog */}
329|          <div
330|            style={{
331|              position: 'fixed',
332|              top: '50%',
333|              left: '50%',
334|              transform: 'translate(-50%, -50%)',
335|              background: 'white',
336|              padding: 'var(--space-5)',
337|              borderRadius: 'var(--radius-lg)',
338|              boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
339|              zIndex: 1000,
340|              textAlign: 'center',
341|              minWidth: '280px',
342|            }}
343|          >
344|            <div style={{ fontSize: '32px', marginBottom: 'var(--space-3)' }}>📚</div>
345|            <div style={{ fontSize: '16px', color: 'var(--gray-700)', fontWeight: 500 }}>Importing article...</div>
346|            <div style={{ fontSize: '13px', color: 'var(--gray-500)', marginTop: 'var(--space-2)' }}>
347|              Segmenting text and generating expressions
348|            </div>
349|          </div>
350|        </>
351|      )}
352|
353|      {/* Articles List */}
354|      {loading ? (
355|        <div className="card" style={{ padding: 'var(--space-4)', textAlign: 'center' }}>
356|          <p style={{ color: 'var(--vercel-gray-600)' }}>Loading articles...</p>
357|        </div>
358|      ) : articles.length === 0 ? (
359|        <div className="card" style={{ padding: 'var(--space-4)', textAlign: 'center' }}>
360|          <BookOpen size={48} color="var(--vercel-gray-400)" style={{ marginBottom: 'var(--space-3)' }} />
361|          <h3 style={{ marginBottom: 'var(--space-2)' }}>No articles yet</h3>
362|          <p style={{ color: 'var(--vercel-gray-600)', marginBottom: 'var(--space-3)' }}>
363|            Import your first article to start learning
364|          </p>
365|          <button className="btn btn-primary" onClick={() => setShowImportForm(true)}>
366|            <Upload size={16} />
367|            Import Article
368|          </button>
369|        </div>
370|      ) : (
371|        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
372|          {articles.map((article) => (
373|            <div
374|              key={article.id}
375|              className="card"
376|              style={{
377|                padding: 'var(--space-3)',
378|                display: 'flex',
379|                gap: 'var(--space-3)',
380|                alignItems: 'flex-start',
381|                transition: 'box-shadow 0.2s',
382|              }}
383|            >
384|              {editMode && (
385|                <input
386|                  type="checkbox"
387|                  checked={selectedArticles.has(article.id)}
388|                  onChange={() => toggleArticleSelection(article.id)}
389|                  style={{ 
390|                    width: '18px', 
391|                    height: '18px', 
392|                    marginTop: '2px',
393|                    cursor: 'pointer',
394|                    flexShrink: 0,
395|                  }}
396|                />
397|              )}
398|              <a
399|                href={editMode ? undefined : `/shiju/reading/${article.id}`}
400|                style={{
401|                  textDecoration: 'none',
402|                  color: 'inherit',
403|                  display: 'block',
404|                  flex: 1,
405|                  cursor: editMode ? 'default' : 'pointer',
406|                }}
407|                onClick={(e) => {
408|                  if (editMode) {
409|                    e.preventDefault();
410|                  }
411|                }}
412|              >
413|                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
414|                  <div style={{ flex: 1 }}>
415|                    <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: 'var(--space-1)' }}>
416|                      {article.title}
417|                    </h3>
418|                    <p style={{ 
419|                      fontSize: '14px', 
420|                      color: 'var(--vercel-gray-600)', 
421|                      marginBottom: 'var(--space-2)',
422|                      overflow: 'hidden',
423|                      textOverflow: 'ellipsis',
424|                      whiteSpace: 'nowrap',
425|                    }}>
426|                      {article.rawText.substring(0, 120)}...
427|                    </p>
428|                    <div style={{ display: 'flex', gap: 'var(--space-3)', fontSize: '13px', color: 'var(--vercel-gray-500)' }}>
429|                      <span>
430|                        {article.segmentCount || 0} segments
431|                      </span>
432|                      <span>
433|                        {article.generatedCount || 0} generated
434|                      </span>
435|                      <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
436|                        <Clock size={12} />
437|                        {formatDate(article.createdAt)}
438|                      </span>
439|                    </div>
440|                  </div>
441|                </div>
442|              </a>
443|            </div>
444|          ))}
445|        </div>
446|      )}
447|    </>
448|  );
449|}
450|