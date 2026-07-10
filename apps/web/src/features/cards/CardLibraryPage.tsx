import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, BookOpen, Target, Edit2, Trash2, X, Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { listExpressions, deleteExpression, acceptContextCard, type ExpressionSense } from '../../api/articles';
import { ContextCardGenerator } from './ContextCardGenerator';
import type { CandidateExpression } from '@art/domain';

export function CardLibraryPage() {
  const navigate = useNavigate();
  const [expressions, setExpressions] = useState<ExpressionSense[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  
  // Edit mode state
  const [editMode, setEditMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);
  const [showContextGenerator, setShowContextGenerator] = useState(false);

  useEffect(() => {
    loadExpressions();
  }, [statusFilter]);

  async function loadExpressions() {
    setLoading(true);
    try {
      const result = await listExpressions({
        status: statusFilter || undefined,
        search: searchTerm || undefined,
      });
      setExpressions(result.expressions);
    } catch (err) {
      console.error('Failed to load expressions:', err);
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    loadExpressions();
  }
  
  function toggleEditMode() {
    setEditMode(!editMode);
    setSelectedIds(new Set());
  }
  
  function toggleSelection(id: string) {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  }
  
  function selectAll() {
    setSelectedIds(new Set(expressions.map(e => e.id)));
  }
  
  function deselectAll() {
    setSelectedIds(new Set());
  }
  
  async function handleAcceptContextCard(draft: CandidateExpression) {
    try {
      const result = await acceptContextCard(draft);
      
      if (result.existed) {
        alert(`Card "${draft.expression}" already exists! Added as new occurrence.`);
      } else {
        alert(`Card "${draft.expression}" saved successfully!`);
      }
      
      setShowContextGenerator(false);
      await loadExpressions();
    } catch (err) {
      console.error('Failed to save card:', err);
      alert(err instanceof Error ? err.message : 'Failed to save card');
    }
  }

  async function handleBatchDelete() {
    if (selectedIds.size === 0) return;
    
    const confirmed = window.confirm(
      `Delete ${selectedIds.size} expression${selectedIds.size > 1 ? 's' : ''}? This cannot be undone.`
    );
    
    if (!confirmed) return;
    
    setDeleting(true);
    
    try {
      await Promise.all(
        Array.from(selectedIds).map(id => deleteExpression(id))
      );
      
      // Reload list
      await loadExpressions();
      
      // Exit edit mode
      setEditMode(false);
      setSelectedIds(new Set());
    } catch (err) {
      console.error('Failed to delete expressions:', err);
      alert('Failed to delete some expressions. Please try again.');
    } finally {
      setDeleting(false);
    }
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'new': return '#3b82f6';
      case 'learning': return '#f59e0b';
      case 'reviewing': return '#8b5cf6';
      case 'mastered': return '#10b981';
      default: return 'var(--gray-500)';
    }
  }

  function getStatusLabel(status: string) {
    switch (status) {
      case 'new': return 'New';
      case 'learning': return 'Learning';
      case 'reviewing': return 'Reviewing';
      case 'mastered': return 'Mastered';
      default: return status;
    }
  }

  return (
    <>
      <header style={{ marginBottom: 'var(--space-4)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1>Cards</h1>
            <p style={{ color: 'var(--gray-600)', marginTop: 'var(--space-1)' }}>
              {loading ? 'Loading...' : `${expressions.length} expression card${expressions.length !== 1 ? 's' : ''}`}
            </p>
          </div>
          
          {!editMode ? (
            <button
              className="btn btn-secondary"
              onClick={toggleEditMode}
              disabled={expressions.length === 0}
            >
              <Edit2 size={16} />
              Edit
            </button>
          ) : (
            <button className="btn btn-secondary" onClick={toggleEditMode}>
              <X size={16} />
              Cancel
            </button>
          )}
        </div>
      </header>

      {/* Context card generator */}
      <div style={{ marginBottom: 'var(--space-4)' }}>
        <button
          onClick={() => setShowContextGenerator(!showContextGenerator)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            padding: '10px 16px',
            fontSize: '14px',
            fontWeight: 500,
            color: 'var(--vercel-white)',
            background: 'var(--vercel-black)',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            cursor: 'pointer',
            transition: 'background 0.15s ease',
            marginBottom: showContextGenerator ? 'var(--space-3)' : 0,
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'var(--vercel-gray-900)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'var(--vercel-black)'}
        >
          {showContextGenerator ? <ChevronUp size={16} /> : <Plus size={16} />}
          {showContextGenerator ? 'Hide' : 'Add Card from Context'}
        </button>
        
        {showContextGenerator && (
          <div style={{ marginTop: 'var(--space-3)' }}>
            <ContextCardGenerator onAccept={handleAcceptContextCard} />
          </div>
        )}
      </div>


      {/* Edit Mode Toolbar */}
      {editMode && (
        <div
          style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-3)',
            marginBottom: 'var(--space-3)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            
          }}
        >
          <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
            <span style={{ fontSize: '14px', color: 'var(--gray-700)' }}>
              {selectedIds.size} selected
            </span>
            <button
              className="btn btn-secondary"
              onClick={selectAll}
              style={{ fontSize: '13px', padding: '4px 12px' }}
            >
              Select All
            </button>
            <button
              className="btn btn-secondary"
              onClick={deselectAll}
              style={{ fontSize: '13px', padding: '4px 12px' }}
              disabled={selectedIds.size === 0}
            >
              Deselect All
            </button>
          </div>
          
          <button
            className="btn btn-danger"
            onClick={handleBatchDelete}
            disabled={selectedIds.size === 0 || deleting}
          >
            <Trash2 size={16} />
            {deleting ? 'Deleting...' : `Delete (${selectedIds.size})`}
          </button>
        </div>
      )}

      {/* Filters */}
      <div style={{ marginBottom: 'var(--space-3)' }}>
        <form onSubmit={handleSearch} style={{ marginBottom: 'var(--space-2)' }}>
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <input
              type="search"
              placeholder="Search expressions or meanings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ flex: 1 }}
            />
            <button type="submit" className="btn btn-primary">
              <Search size={16} />
              Search
            </button>
          </div>
        </form>

        <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
          <button
            className={statusFilter === '' ? 'btn btn-primary' : 'btn btn-secondary'}
            onClick={() => setStatusFilter('')}
            style={{ fontSize: '14px', padding: '6px 12px' }}
          >
            All
          </button>
          <button
            className={statusFilter === 'new' ? 'btn btn-primary' : 'btn btn-secondary'}
            onClick={() => setStatusFilter('new')}
            style={{ fontSize: '14px', padding: '6px 12px' }}
          >
            New
          </button>
          <button
            className={statusFilter === 'learning' ? 'btn btn-primary' : 'btn btn-secondary'}
            onClick={() => setStatusFilter('learning')}
            style={{ fontSize: '14px', padding: '6px 12px' }}
          >
            Learning
          </button>
          <button
            className={statusFilter === 'reviewing' ? 'btn btn-primary' : 'btn btn-secondary'}
            onClick={() => setStatusFilter('reviewing')}
            style={{ fontSize: '14px', padding: '6px 12px' }}
          >
            Reviewing
          </button>
          <button
            className={statusFilter === 'mastered' ? 'btn btn-primary' : 'btn btn-secondary'}
            onClick={() => setStatusFilter('mastered')}
            style={{ fontSize: '14px', padding: '6px 12px' }}
          >
            Mastered
          </button>
        </div>
      </div>

      {/* Cards List */}
      {loading ? (
        <div className="card" style={{ padding: 'var(--space-4)', textAlign: 'center' }}>
          <p style={{ color: 'var(--gray-600)' }}>Loading cards...</p>
        </div>
      ) : expressions.length === 0 ? (
        <div className="card" style={{ padding: 'var(--space-4)', textAlign: 'center' }}>
          <BookOpen size={48} color="var(--gray-400)" style={{ marginBottom: 'var(--space-3)' }} />
          <h3 style={{ marginBottom: 'var(--space-2)' }}>No cards yet</h3>
          <p style={{ color: 'var(--gray-600)' }}>
            {statusFilter ? `No cards in "${getStatusLabel(statusFilter)}" status` : 'Import an article to get started'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-3)' }}>
          {expressions.map((expr) => {
            const isSelected = selectedIds.has(expr.id);
            
            return (
              <div
                key={expr.id}
                className="card"
                style={{
                  padding: 'var(--space-3)',
                  cursor: 'pointer',
                  transition: 'box-shadow 0.2s, border-color 0.2s',
                  border: isSelected ? '2px solid #3b82f6' : '1px solid rgba(0,0,0,0.08)',
                  background: isSelected ? '#eff6ff' : 'white',
                }}
                onClick={() => editMode ? toggleSelection(expr.id) : navigate(`/expressions/${expr.id}`)}
                onMouseEnter={(e) => {
                  if (!editMode) {
                    e.currentTarget.style.boxShadow = '0px 0px 0px 1px rgba(0,0,0,0.12)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!editMode) {
                    e.currentTarget.style.boxShadow = '0px 0px 0px 1px rgba(0,0,0,0.08)';
                  }
                }}
              >
                <div style={{ marginBottom: 'var(--space-2)' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: 'var(--space-1)' }}>
                    {expr.expression}
                  </h3>
                  <p style={{ fontSize: '14px', color: 'var(--gray-600)' }}>
                    {expr.meaningZh}
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap', fontSize: '12px' }}>
                  <span
                    style={{
                      padding: '2px 8px',
                      borderRadius: '4px',
                      background: getStatusColor(expr.masteryStatus),
                      color: 'white',
                      fontWeight: '500',
                    }}
                  >
                    {getStatusLabel(expr.masteryStatus)}
                  </span>
                  
                  <span style={{ color: 'var(--gray-500)' }}>
                    {expr.type}
                  </span>
                  
                  <span style={{ color: 'var(--gray-500)' }}>
                    {expr.difficulty}
                  </span>
                  
                  <span style={{ color: 'var(--gray-500)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Target size={12} />
                    {expr.reviewCount} reviews
                  </span>
                  
                  <span style={{ color: 'var(--gray-500)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <BookOpen size={12} />
                    {expr.occurrenceCount} contexts
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
