import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar } from './components/layout/Sidebar';
import { HomePage } from './features/home/HomePage';
import { ReadingPage } from './features/reading/ReadingPage';
import { ReviewPage } from './features/review/ReviewPage';
import { CardLibraryPage } from './features/cards/CardLibraryPage';
import { ArticleListPage } from './features/articles/ArticleListPage';
import { ArticleDetailPage } from './features/articles/ArticleDetailPage';
import './styles.css';

export function App() {
  return (
    <BrowserRouter basename="/shiju">
      <div className="app-container">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/import" element={<ArticleListPage />} />
            <Route path="/library" element={<CardLibraryPage />} />
            <Route path="/review" element={<ReviewPage />} />
            <Route path="/reading" element={<ReadingPage />} />
            <Route path="/articles/:id" element={<ArticleDetailPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
