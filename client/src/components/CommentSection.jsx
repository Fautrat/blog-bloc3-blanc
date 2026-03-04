import { useState, useEffect, useCallback } from 'react';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Trash2, Edit, Send } from 'lucide-react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

const CommentSection = ({ articleId }) => {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editContent, setEditContent] = useState('');
    const { user } = useAuth();

    const fetchComments = useCallback(async () => {
        try {
            const { data } = await API.get(`/articles/${articleId}/comments`);
            setComments(data);
        } catch (err) {
            console.error(err);
        }
    }, [articleId]);

    useEffect(() => {
        fetchComments();
    }, [articleId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        try {
            await API.post(`/articles/${articleId}/comments`, { content: newComment });
            setNewComment('');
            fetchComments();
        } catch (err) {
            console.error(err);
        }
    };

    const handleUpdate = async (id) => {
        try {
            await API.put(`/comments/${id}`, { content: editContent });
            setEditingId(null);
            fetchComments();
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Supprimer ce commentaire ?')) {
            try {
                await API.delete(`/comments/${id}`);
                fetchComments();
            } catch (err) {
                console.error(err);
            }
        }
    };

    // Fonction de rendu sécurisé
    const createMarkup = (text) => {
        const rawMarkup = marked.parse(text); // Transforme le MD en HTML
        const cleanMarkup = DOMPurify.sanitize(rawMarkup); // NETTOIE le HTML (Anti-XSS)
        return { __html: cleanMarkup };
    };

    return (
        <div style={{ marginTop: '40px', borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
            <h3 style={{ marginBottom: '20px' }}>Commentaires ({comments.length})</h3>

            {user ? (
                <form onSubmit={handleSubmit} className="glass" style={{ padding: '20px', marginBottom: '30px' }}>
                    <textarea
                        rows="3"
                        placeholder="Laissez un commentaire..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        style={{ marginBottom: '10px' }}
                    />
                    <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Send size={16} /> Publier
                    </button>
                </form>
            ) : (
                <p style={{ color: 'var(--text-muted)', marginBottom: '30px' }}>Connectez-vous pour laisser un commentaire.</p>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {comments.map(comment => (
                    <div key={comment.id} className="glass" style={{ padding: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                {comment.avatar && <img src={`http://localhost:5000${comment.avatar}`} alt="avatar" style={{ width: '30px', height: '30px', borderRadius: '50%' }} />}
                                <span style={{ fontWeight: 'bold' }}>{comment.username}</span>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(comment.created_at).toLocaleString()}</span>
                            </div>
                            
                            {user && user.id === comment.user_id && (
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button onClick={() => { setEditingId(comment.id); setEditContent(comment.content); }} style={{ background: 'none', color: 'var(--text)' }}><Edit size={16} /></button>
                                    <button onClick={() => handleDelete(comment.id)} style={{ background: 'none', color: '#ef4444' }}><Trash2 size={16} /></button>
                                </div>
                            )}
                        </div>

                        {editingId === comment.id ? (
                            <div>
                                <textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} rows="3" />
                                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                    <button onClick={() => handleUpdate(comment.id)} className="btn btn-primary">Sauvegarder</button>
                                    <button onClick={() => setEditingId(null)} className="btn glass">Annuler</button>
                                </div>
                            </div>
                        ) : (
                            // Rendu sécurisé des commentaires
                            <div dangerouslySetInnerHTML={createMarkup(comment.content)} style={{ lineHeight: '1.6' }} />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CommentSection;