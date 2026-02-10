import { useState, useEffect } from 'react';
import styles from './messages.module.scss';
import { FaTrash, FaEnvelope, FaUser, FaCalendar, FaChevronDown, FaChevronUp } from 'react-icons/fa6';

interface Message {
  _id: string;
  email: string;
  message: string;
  createdAt: string;
}

const Messages: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const getApiUrl = () => {
    return import.meta.env.VITE_API_URL || 'http://localhost:3000';
  };

  const fetchMessages = async () => {
    try {
      setLoading(true);
      setError(null);
      const apiUrl = getApiUrl().replace(/\/$/, '');
      const response = await fetch(`${apiUrl}/messages`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des messages');
      }
      const data = await response.json();
      setMessages(data.data || []);
    } catch (err) {
      console.error('Erreur:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors de la récupération');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce message ?')) return;

    try {
      setDeletingId(id);
      const apiUrl = getApiUrl().replace(/\/$/, '');
      const response = await fetch(`${apiUrl}/messages/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Erreur lors de la suppression');

      setMessages(messages.filter(msg => msg._id !== id));
      if (expandedId === id) setExpandedId(null);
    } catch (err) {
      console.error('Erreur:', err);
      alert(err instanceof Error ? err.message : 'Erreur lors de la suppression');
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  if (loading) {
    return (
      <div className={styles.messagesContainer}>
        <div className={styles.loading}>Chargement des messages...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.messagesContainer}>
        <div className={styles.error}>
          <p>{error}</p>
          <button onClick={fetchMessages} className={styles.retryButton}>
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.messagesContainer}>
      <div className={styles.header}>
        <h2 className={styles.title}>Messages</h2>
        <button onClick={fetchMessages} className={styles.refreshButton}>
          Actualiser
        </button>
      </div>
      {messages.length === 0 ? (
        <div className={styles.emptyState}>
          <FaEnvelope className={styles.emptyIcon} />
          <p>Aucun message pour le moment</p>
        </div>
      ) : (
        <div className={styles.messagesList}>
          {messages.map((message) => {
            const isExpanded = expandedId === message._id;
            return (
              <div
                key={message._id}
                className={`${styles.messageCard} ${isExpanded ? styles.expanded : ''}`}
              >
                <div
                  className={styles.messageHeader}
                  onClick={() => toggleExpand(message._id)}
                  role="button"
                  tabIndex={0}
                  aria-expanded={isExpanded}
                >
                  <div className={styles.messageInfo}>
                    <div className={styles.emailRow}>
                      <FaUser className={styles.icon} />
                      <span className={styles.email}>{message.email}</span>
                    </div>
                    <div className={styles.dateRow}>
                      <FaCalendar className={styles.icon} />
                      <span className={styles.date}>{formatDate(message.createdAt)}</span>
                    </div>
                  </div>
                  <div className={styles.headerActions}>
                    <button
                      onClick={(e) => handleDelete(message._id, e)}
                      className={styles.deleteButton}
                      disabled={deletingId === message._id}
                      title="Supprimer le message"
                    >
                      {deletingId === message._id ? (
                        <span className={styles.deleting}>Suppression...</span>
                      ) : (
                        <FaTrash />
                      )}
                    </button>

                    <span className={styles.toggleIcon}>
                      {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
                    </span>
                  </div>
                </div>
                <div className={`${styles.messageContent} ${isExpanded ? styles.visible : ''}`}>
                  <p>{message.message}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Messages;
