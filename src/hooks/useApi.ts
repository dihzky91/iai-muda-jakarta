import { useState, useEffect } from 'react';
import { Generation, Member, Event } from '../types';

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
