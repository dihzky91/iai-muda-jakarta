import { useState, useEffect } from 'react';
import { Generation, Member, Event, Article, GalleryItem, Settings, Pillar } from '../types';

interface ApiResponse<T> {
  success: boolean;
  data: T | T[];
  message?: string;
}

export function useGenerations() {
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGenerations = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/generations');
        const result: ApiResponse<Generation> = await response.json();
        
        if (result.success) {
          setGenerations(Array.isArray(result.data) ? result.data : [result.data]);
          setError(null);
        } else {
          setError(result.message || 'Failed to fetch generations');
          setGenerations([]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        setGenerations([]);
      } finally {
        setLoading(false);
      }
    };

    fetchGenerations();
  }, []);

  return { generations, loading, error };
}

export function useEvents(status?: string) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const url = status ? `/api/events?status=${status}` : '/api/events';
        const response = await fetch(url);
        const result: ApiResponse<Event> = await response.json();
        
        if (result.success) {
          let data = Array.isArray(result.data) ? result.data : [result.data];
          
          // Filter by status if provided
          if (status) {
            data = data.filter((event: Event) => event.status === status);
          }
          
          setEvents(data);
          setError(null);
        } else {
          setError(result.message || 'Failed to fetch events');
          setEvents([]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [status]);

  return { events, loading, error };
}

export function useMembers(generationId?: number) {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setLoading(true);
        const url = generationId 
          ? `/api/members?generationId=${generationId}` 
          : '/api/members';
        const response = await fetch(url);
        const result: ApiResponse<Member> = await response.json();
        
        if (result.success) {
          setMembers(Array.isArray(result.data) ? result.data : [result.data]);
          setError(null);
        } else {
          setError(result.message || 'Failed to fetch members');
          setMembers([]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        setMembers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, [generationId]);

  return { members, loading, error };
}

export function useEventById(id: number) {
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const fetchEvent = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/events/${id}`);
        const result: ApiResponse<Event> = await response.json();
        
        if (result.success) {
          setEvent(Array.isArray(result.data) ? result.data[0] : result.data);
          setError(null);
        } else {
          setError(result.message || 'Failed to fetch event');
          setEvent(null);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        setEvent(null);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  return { event, loading, error };
}

export function useMemberById(id: number) {
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const fetchMember = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/members/${id}`);
        const result: ApiResponse<Member> = await response.json();
        
        if (result.success) {
          setMember(Array.isArray(result.data) ? result.data[0] : result.data);
          setError(null);
        } else {
          setError(result.message || 'Failed to fetch member');
          setMember(null);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        setMember(null);
      } finally {
        setLoading(false);
      }
    };

    fetchMember();
  }, [id]);

  return { member, loading, error };
}

// ========== MUTATION HOOKS ==========

export function useCreateEvent() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = async (eventData: Partial<Event>) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData),
      });
      const result = await response.json();
      if (!result.success) {
        setError(result.message || 'Failed to create event');
      }
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  return { create, loading, error };
}

export function useUpdateEvent() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = async (id: number, eventData: Partial<Event>) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/events/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData),
      });
      const result = await response.json();
      if (!result.success) {
        setError(result.message || 'Failed to update event');
      }
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  return { update, loading, error };
}

export function useDeleteEvent() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteEvent = async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/events/${id}`, {
        method: 'DELETE',
      });
      const result = await response.json();
      if (!result.success) {
        setError(result.message || 'Failed to delete event');
      }
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  return { deleteEvent, loading, error };
}

export function useCreateMember() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = async (memberData: Partial<Member>) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(memberData),
      });
      const result = await response.json();
      if (!result.success) {
        setError(result.message || 'Failed to create member');
      }
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  return { create, loading, error };
}

export function useUpdateMember() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = async (id: number, memberData: Partial<Member>) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/members/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(memberData),
      });
      const result = await response.json();
      if (!result.success) {
        setError(result.message || 'Failed to update member');
      }
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  return { update, loading, error };
}

export function useDeleteMember() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteMember = async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/members/${id}`, {
        method: 'DELETE',
      });
      const result = await response.json();
      if (!result.success) {
        setError(result.message || 'Failed to delete member');
      }
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  return { deleteMember, loading, error };
}

export function useSettings() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/settings');
      const result: ApiResponse<Settings> = await response.json();
      
      if (result.success) {
        setSettings(Array.isArray(result.data) ? result.data[0] : result.data);
        setError(null);
      } else {
        setError(result.message || 'Failed to fetch settings');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return { settings, loading, error, refetch: fetchSettings };
}

export function useUpdateSettings() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = async (settingsData: Partial<Settings>) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settingsData),
      });
      const result = await response.json();
      if (!result.success) {
        setError(result.message || 'Failed to update settings');
      }
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  return { update, loading, error };
}

export function useArticles() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/articles');
        const result: ApiResponse<Article> = await response.json();

        if (result.success) {
          setArticles(Array.isArray(result.data) ? result.data : [result.data]);
          setError(null);
        } else {
          setError(result.message || 'Failed to fetch articles');
          setArticles([]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        setArticles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  return { articles, loading, error };
}

export function useGalleries() {
  const [galleries, setGalleries] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGalleries = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/galleries');
        const result: ApiResponse<GalleryItem> = await response.json();

        if (result.success) {
          setGalleries(Array.isArray(result.data) ? result.data : [result.data]);
          setError(null);
        } else {
          setError(result.message || 'Failed to fetch galleries');
          setGalleries([]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        setGalleries([]);
      } finally {
        setLoading(false);
      }
    };

    fetchGalleries();
  }, []);

  return { galleries, loading, error };
}

export function useCreateArticle() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = async (articleData: Partial<Article>) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(articleData),
      });
      const result = await response.json();
      if (!result.success) {
        setError(result.message || 'Failed to create article');
      }
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  return { create, loading, error };
}

export function useUpdateArticle() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = async (id: number, articleData: Partial<Article>) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/articles/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(articleData),
      });
      const result = await response.json();
      if (!result.success) {
        setError(result.message || 'Failed to update article');
      }
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  return { update, loading, error };
}

export function useDeleteArticle() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteArticle = async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/articles/${id}`, {
        method: 'DELETE',
      });
      const result = await response.json();
      if (!result.success) {
        setError(result.message || 'Failed to delete article');
      }
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  return { deleteArticle, loading, error };
}

export function useCreateGallery() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = async (galleryData: Partial<GalleryItem>) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/galleries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(galleryData),
      });
      const result = await response.json();
      if (!result.success) {
        setError(result.message || 'Failed to create gallery');
      }
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  return { create, loading, error };
}

export function useUpdateGallery() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = async (id: number, galleryData: Partial<GalleryItem>) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/galleries/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(galleryData),
      });
      const result = await response.json();
      if (!result.success) {
        setError(result.message || 'Failed to update gallery');
      }
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  return { update, loading, error };
}

export function useDeleteGallery() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteGallery = async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/galleries/${id}`, {
        method: 'DELETE',
      });
      const result = await response.json();
      if (!result.success) {
        setError(result.message || 'Failed to delete gallery');
      }
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  return { deleteGallery, loading, error };
}

// ========== PILLARS HOOKS ==========

export function usePillars() {
  const [pillars, setPillars] = useState<Pillar[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPillars = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/pillars');
      const result: ApiResponse<Pillar> = await response.json();
      if (result.success) {
        setPillars(Array.isArray(result.data) ? result.data : [result.data]);
        setError(null);
      } else {
        setError(result.message || 'Failed to fetch pillars');
        setPillars([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setPillars([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPillars(); }, []);

  return { pillars, loading, error, refetch: fetchPillars };
}

export function useCreatePillar() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const create = async (data: Partial<Pillar>) => {
    try {
      setLoading(true); setError(null);
      const res = await fetch('/api/pillars', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      const result = await res.json();
      if (!result.success) setError(result.message || 'Failed to create pillar');
      return result;
    } catch (err) {
      const m = err instanceof Error ? err.message : 'Error';
      setError(m); return { success: false, message: m };
    } finally { setLoading(false); }
  };
  return { create, loading, error };
}

export function useUpdatePillar() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const update = async (id: number, data: Partial<Pillar>) => {
    try {
      setLoading(true); setError(null);
      const res = await fetch(`/api/pillars/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      const result = await res.json();
      if (!result.success) setError(result.message || 'Failed to update pillar');
      return result;
    } catch (err) {
      const m = err instanceof Error ? err.message : 'Error';
      setError(m); return { success: false, message: m };
    } finally { setLoading(false); }
  };
  return { update, loading, error };
}

export function useDeletePillar() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const deletePillar = async (id: number) => {
    try {
      setLoading(true); setError(null);
      const res = await fetch(`/api/pillars/${id}`, { method: 'DELETE' });
      const result = await res.json();
      if (!result.success) setError(result.message || 'Failed to delete pillar');
      return result;
    } catch (err) {
      const m = err instanceof Error ? err.message : 'Error';
      setError(m); return { success: false, message: m };
    } finally { setLoading(false); }
  };
  return { deletePillar, loading, error };
}
