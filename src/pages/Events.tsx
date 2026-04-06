import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { Event } from '../types';
import { Calendar, MapPin, Clock, Plus, Trash2, Edit2, X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';

export function Events() {
  const { profile, isAdmin } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newEvent, setNewEvent] = useState<Partial<Event>>({
    name: '',
    date: '',
    time: '',
    location: '',
    status: 'em breve'
  });

  useEffect(() => {
    if (!profile?.className) return;
    const eventsPath = `classes/${profile.className}/events`;
    const q = query(collection(db, eventsPath), orderBy('date', 'asc'));
    const unsub = onSnapshot(q, (snapshot) => {
      setEvents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Event)));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, eventsPath);
    });
    return () => unsub();
  }, [profile?.className]);

  const handleAdd = async () => {
    if (!newEvent.name || !newEvent.date || !profile?.className) return;
    try {
      await addDoc(collection(db, `classes/${profile.className}/events`), newEvent);
      setIsAdding(false);
      setNewEvent({ name: '', date: '', time: '', location: '', status: 'em breve' });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!profile?.className) return;
    try {
      await deleteDoc(doc(db, `classes/${profile.className}/events`, id));
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmado': return 'bg-green-100 text-green-700';
      case 'cancelado': return 'bg-red-100 text-red-700';
      default: return 'bg-blue-100 text-blue-700';
    }
  };

  return (
    <div className="space-y-6 pb-10">
      <header className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-[#004d4d]">Eventos</h1>
        {isAdmin && (
          <button 
            onClick={() => setIsAdding(!isAdding)}
            className="p-2 bg-[#004d4d] text-white rounded-full shadow-lg hover:bg-[#003d3d] transition-all"
          >
            {isAdding ? <X size={20} /> : <Plus size={20} />}
          </button>
        )}
      </header>

      <AnimatePresence>
        {isAdding && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white p-6 rounded-3xl shadow-sm border border-blue-100 space-y-4 overflow-hidden"
          >
            <h2 className="font-bold text-blue-900">Novo Evento</h2>
            <div className="space-y-3">
              <input 
                placeholder="Nome do Evento" 
                className="w-full p-3 rounded-xl bg-blue-50 border-none outline-none text-sm"
                value={newEvent.name}
                onChange={e => setNewEvent({...newEvent, name: e.target.value})}
              />
              <div className="grid grid-cols-2 gap-2">
                <input 
                  type="date" 
                  className="w-full p-3 rounded-xl bg-blue-50 border-none outline-none text-sm"
                  value={newEvent.date}
                  onChange={e => setNewEvent({...newEvent, date: e.target.value})}
                />
                <input 
                  type="time" 
                  className="w-full p-3 rounded-xl bg-blue-50 border-none outline-none text-sm"
                  value={newEvent.time}
                  onChange={e => setNewEvent({...newEvent, time: e.target.value})}
                />
              </div>
              <input 
                placeholder="Local" 
                className="w-full p-3 rounded-xl bg-blue-50 border-none outline-none text-sm"
                value={newEvent.location}
                onChange={e => setNewEvent({...newEvent, location: e.target.value})}
              />
              <select 
                className="w-full p-3 rounded-xl bg-blue-50 border-none outline-none text-sm"
                value={newEvent.status}
                onChange={e => setNewEvent({...newEvent, status: e.target.value as any})}
              >
                <option value="em breve">Em Breve</option>
                <option value="confirmado">Confirmado</option>
                <option value="cancelado">Cancelado</option>
              </select>
              <button 
                onClick={handleAdd}
                className="w-full bg-[#004d4d] text-white font-bold py-3 rounded-xl shadow-md"
              >
                Criar Evento
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-4">
        {events.length > 0 ? events.map((event) => (
          <motion.div 
            key={event.id}
            layout
            className="bg-white p-5 rounded-2xl shadow-sm border border-blue-100 space-y-4"
          >
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${getStatusColor(event.status)}`}>
                  {event.status}
                </span>
                <h3 className="text-lg font-bold text-blue-900">{event.name}</h3>
              </div>
              {isAdmin && (
                <button 
                  onClick={() => handleDelete(event.id)}
                  className="p-2 text-red-300 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-blue-50">
              <div className="flex items-center gap-2 text-blue-400">
                <Calendar size={16} />
                <span className="text-xs font-medium">{event.date}</span>
              </div>
              <div className="flex items-center gap-2 text-blue-400">
                <Clock size={16} />
                <span className="text-xs font-medium">{event.time}</span>
              </div>
              <div className="flex items-center gap-2 text-blue-400 col-span-2">
                <MapPin size={16} />
                <span className="text-xs font-medium">{event.location}</span>
              </div>
            </div>
          </motion.div>
        )) : (
          <div className="text-center py-10 text-blue-300">
            Nenhum evento encontrado
          </div>
        )}
      </div>
    </div>
  );
}
