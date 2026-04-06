import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy, limit, doc, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { FinanceSummary, Event, Notice, Product } from '../types';
import { Bell, Plus, TrendingUp, Calendar, MessageSquare, ArrowRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';

export function Dashboard() {
  const { user, profile, isAdmin } = useAuth();
  const [finance, setFinance] = useState<FinanceSummary>({
    totalSales: 0,
    totalExpenses: 0,
    studentContribution: 0
  });
  const [nextEvent, setNextEvent] = useState<Event | null>(null);
  const [notices, setNotices] = useState<Notice[]>([]);

  useEffect(() => {
    if (!profile?.className) return;

    const classPath = `classes/${profile.className}`;

    // Dynamic Finance Totals from Store
    const storePath = `${classPath}/store`;
    const unsubStore = onSnapshot(collection(db, storePath), (snapshot) => {
      const products = snapshot.docs.map(doc => doc.data() as Product);
      const sales = products
        .filter(p => p.type === 'venda')
        .reduce((acc, p) => acc + p.price, 0);
      const expenses = products
        .filter(p => p.type === 'despesa')
        .reduce((acc, p) => acc + p.price, 0);
      
      setFinance(prev => ({
        ...prev,
        totalSales: sales,
        totalExpenses: expenses
      }));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, storePath);
    });

    // Student Contribution from Summary
    const summaryPath = `${classPath}/finance/summary`;
    const unsubSummary = onSnapshot(doc(db, `${classPath}/finance`, 'summary'), (docSnap) => {
      if (docSnap.exists()) {
        setFinance(prev => ({
          ...prev,
          studentContribution: docSnap.data().studentContribution || 0
        }));
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, summaryPath);
    });

    // Next Event
    const eventsPath = `${classPath}/events`;
    const eventsQuery = query(collection(db, eventsPath), orderBy('date', 'asc'), limit(1));
    const unsubEvents = onSnapshot(eventsQuery, (snapshot) => {
      if (!snapshot.empty) {
        setNextEvent({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Event);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, eventsPath);
    });

    // Recent Notices
    const noticesPath = `${classPath}/notices`;
    const noticesQuery = query(collection(db, noticesPath), orderBy('date', 'desc'), limit(3));
    const unsubNotices = onSnapshot(noticesQuery, (snapshot) => {
      setNotices(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notice)));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, noticesPath);
    });

    return () => {
      unsubStore();
      unsubSummary();
      unsubEvents();
      unsubNotices();
    };
  }, [profile?.className]);

  const [isAddingNotice, setIsAddingNotice] = useState(false);
  const [newNoticeContent, setNewNoticeContent] = useState('');

  const handleAddNotice = async () => {
    if (!newNoticeContent || !profile?.className) return;
    try {
      await addDoc(collection(db, `classes/${profile.className}/notices`), {
        content: newNoticeContent,
        date: new Date().toLocaleDateString('pt-BR'),
      });
      setNewNoticeContent('');
      setIsAddingNotice(false);
    } catch (err) {
      console.error(err);
    }
  };

  const totalBalance = finance.totalSales - finance.totalExpenses + finance.studentContribution;

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#004d4d]">Olá, {user?.displayName?.split(' ')[0] || 'Usuário'}</h1>
          <p className="text-blue-400 text-sm">Bem-vindo de volta!</p>
        </div>
        <button className="p-2 bg-white rounded-full shadow-sm text-blue-900 hover:bg-blue-50 transition-all">
          <Bell size={24} />
        </button>
      </header>

      {/* Finance Card */}
      <motion.div 
        whileHover={{ scale: 1.02 }}
        className="bg-[#004d4d] p-6 rounded-3xl shadow-xl text-white space-y-4 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <TrendingUp size={120} />
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium opacity-80">Saldo Total Arrecadado</span>
          <TrendingUp size={20} />
        </div>
        <div className="text-3xl font-bold">
          R$ {totalBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </div>
        <Link to="/finance" className="flex items-center gap-2 text-xs font-semibold bg-white/20 w-fit px-3 py-1.5 rounded-full hover:bg-white/30 transition-all">
          Ver detalhes <ArrowRight size={14} />
        </Link>
      </motion.div>

      {/* Next Event Card */}
      <div className="space-y-3">
        <div className="flex justify-between items-center px-1">
          <h2 className="text-lg font-bold text-blue-900">Próximo Evento</h2>
          <Link to="/events" className="text-xs font-bold text-[#004d4d]">Ver todos</Link>
        </div>
        {nextEvent ? (
          <motion.div 
            whileHover={{ scale: 1.01 }}
            className="bg-white p-4 rounded-2xl shadow-sm border border-blue-100 flex items-center gap-4"
          >
            <div className="bg-blue-50 p-3 rounded-xl text-[#004d4d]">
              <Calendar size={24} />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-blue-900">{nextEvent.name}</h3>
              <p className="text-xs text-blue-400">{nextEvent.date} • {nextEvent.time}</p>
            </div>
            <div className="text-xs font-bold text-blue-500 bg-blue-50 px-2 py-1 rounded-lg capitalize">
              {nextEvent.status}
            </div>
          </motion.div>
        ) : (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-blue-100 text-center text-blue-300 text-sm italic">
            Nenhum evento agendado
          </div>
        )}
      </div>

      {/* Notices Section */}
      <div className="space-y-3">
        <div className="flex justify-between items-center px-1">
          <h2 className="text-lg font-bold text-blue-900">Avisos Recentes</h2>
          {isAdmin && (
            <button 
              onClick={() => setIsAddingNotice(!isAddingNotice)}
              className="p-1.5 bg-[#004d4d] text-white rounded-lg shadow-md hover:bg-[#003d3d] transition-all"
            >
              {isAddingNotice ? <X size={18} /> : <Plus size={18} />}
            </button>
          )}
        </div>
        
        <AnimatePresence>
          {isAddingNotice && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white p-4 rounded-2xl shadow-sm border border-blue-100 space-y-3 overflow-hidden"
            >
              <textarea 
                placeholder="Escreva o aviso aqui..." 
                className="w-full p-3 rounded-xl bg-blue-50 border-none outline-none text-sm resize-none h-24"
                value={newNoticeContent}
                onChange={e => setNewNoticeContent(e.target.value)}
              />
              <button 
                onClick={handleAddNotice}
                className="w-full bg-[#004d4d] text-white font-bold py-2 rounded-xl shadow-md"
              >
                Publicar Aviso
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-3">
          {notices.length > 0 ? notices.map((notice) => (
            <motion.div 
              key={notice.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white p-4 rounded-2xl shadow-sm border border-blue-100 flex gap-4"
            >
              <div className="bg-blue-50 p-3 rounded-xl text-blue-400 h-fit">
                <MessageSquare size={20} />
              </div>
              <div className="space-y-1">
                <p className="text-sm text-blue-900 leading-relaxed">{notice.content}</p>
                <p className="text-[10px] font-bold text-blue-300 uppercase">{notice.date}</p>
              </div>
            </motion.div>
          )) : (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-blue-100 text-center text-blue-300 text-sm italic">
              Nenhum aviso no momento
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
