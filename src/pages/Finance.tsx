import { useEffect, useState } from 'react';
import { doc, onSnapshot, setDoc, updateDoc, collection } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { FinanceSummary, Product } from '../types';
import { DollarSign, ArrowUpCircle, ArrowDownCircle, Users, Edit3, Save, X } from 'lucide-react';
import { motion } from 'motion/react';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';

export function Finance() {
  const { profile, isAdmin } = useAuth();
  const [finance, setFinance] = useState<FinanceSummary>({
    totalSales: 0,
    totalExpenses: 0,
    studentContribution: 0
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editContribution, setEditContribution] = useState(0);

  useEffect(() => {
    if (!profile?.className) return;

    const classPath = `classes/${profile.className}`;

    // Listen to store for dynamic totals
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

    // Listen to summary for student contribution
    const summaryPath = `${classPath}/finance/summary`;
    const unsubSummary = onSnapshot(doc(db, summaryPath), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setFinance(prev => ({
          ...prev,
          studentContribution: data.studentContribution || 0
        }));
        setEditContribution(data.studentContribution || 0);
      } else if (isAdmin) {
        setDoc(doc(db, summaryPath), { studentContribution: 0 }).catch(console.error);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, summaryPath);
    });

    return () => {
      unsubStore();
      unsubSummary();
    };
  }, [profile?.className]);

  const handleSave = async () => {
    if (!profile?.className) return;
    try {
      await updateDoc(doc(db, `classes/${profile.className}/finance`, 'summary'), { 
        studentContribution: editContribution 
      });
      setIsEditing(false);
    } catch (err) {
      console.error(err);
    }
  };

  const totalBalance = finance.totalSales - finance.totalExpenses + finance.studentContribution;

  return (
    <div className="space-y-6 pb-10">
      <header className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-[#004d4d]">Financeiro</h1>
        {isAdmin && (
          <button 
            onClick={() => setIsEditing(!isEditing)}
            className="p-2 bg-white rounded-full shadow-sm text-[#004d4d] hover:bg-blue-50 transition-all"
          >
            {isEditing ? <X size={20} /> : <Edit3 size={20} />}
          </button>
        )}
      </header>

      {/* Main Balance Card */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-blue-100 text-center space-y-2">
        <p className="text-xs font-bold text-blue-400 uppercase tracking-wider">Saldo em Caixa</p>
        <h2 className="text-4xl font-black text-[#004d4d]">
          R$ {totalBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </h2>
      </div>

      {/* Summary Grid */}
      <div className="grid grid-cols-1 gap-4">
        {/* Sales */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-blue-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-green-50 p-3 rounded-xl text-green-600">
              <ArrowUpCircle size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-blue-400 uppercase">Vendas</p>
              <p className="text-lg font-bold text-blue-900">R$ {finance.totalSales.toLocaleString('pt-BR')}</p>
            </div>
          </div>
        </div>

        {/* Expenses */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-blue-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-red-50 p-3 rounded-xl text-red-600">
              <ArrowDownCircle size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-blue-400 uppercase">Despesas</p>
              <p className="text-lg font-bold text-blue-900">R$ {finance.totalExpenses.toLocaleString('pt-BR')}</p>
            </div>
          </div>
        </div>

        {/* Student Contribution - Visible to all, editable by ADMIN */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-900 p-5 rounded-2xl shadow-lg text-white flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-3 rounded-xl">
              <Users size={24} />
            </div>
            <div>
              <p className="text-xs font-bold opacity-70 uppercase">Contribuição Alunos</p>
              {isEditing && isAdmin ? (
                <input 
                  type="number" 
                  value={editContribution}
                  onChange={(e) => setEditContribution(Number(e.target.value))}
                  className="text-lg font-bold bg-transparent border-b border-white/30 outline-none w-full"
                />
              ) : (
                <p className="text-lg font-bold">R$ {finance.studentContribution.toLocaleString('pt-BR')}</p>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {isEditing && (
        <button 
          onClick={handleSave}
          className="w-full bg-[#004d4d] text-white font-bold py-4 rounded-2xl shadow-lg flex items-center justify-center gap-2"
        >
          <Save size={20} /> Salvar Alterações
        </button>
      )}

      <div className="bg-blue-100/50 p-4 rounded-2xl border border-dashed border-blue-200">
        <p className="text-[10px] text-blue-500 text-center uppercase font-bold tracking-widest">
          Atualizado em tempo real • Transparência {profile?.className || 'Turma'}
        </p>
      </div>
    </div>
  );
}
