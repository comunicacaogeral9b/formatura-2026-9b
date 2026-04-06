import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { Product } from '../types';
import { ShoppingBag, Plus, Trash2, Package, Tag, X, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';

export function Store() {
  const { profile, isAdmin } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: '',
    price: 0,
    type: 'venda'
  });

  useEffect(() => {
    if (!profile?.className) return;
    const storePath = `classes/${profile.className}/store`;
    const q = query(collection(db, storePath));
    const unsub = onSnapshot(q, (snapshot) => {
      setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, storePath);
    });
    return () => unsub();
  }, [profile?.className]);

  const handleAdd = async () => {
    if (!newProduct.name || !profile?.className) return;
    try {
      await addDoc(collection(db, `classes/${profile.className}/store`), newProduct);
      setIsAdding(false);
      setNewProduct({ name: '', price: 0, type: 'venda' });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!profile?.className) return;
    try {
      await deleteDoc(doc(db, `classes/${profile.className}/store`, id));
    } catch (err) {
      console.error(err);
    }
  };

  const totalSales = products
    .filter(p => p.type === 'venda')
    .reduce((acc, p) => acc + p.price, 0);
  
  const totalExpenses = products
    .filter(p => p.type === 'despesa')
    .reduce((acc, p) => acc + p.price, 0);

  return (
    <div className="space-y-6 pb-10">
      <header className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-[#004d4d]">Loja & Estoque</h1>
        {isAdmin && (
          <button 
            onClick={() => setIsAdding(!isAdding)}
            className="p-2 bg-[#004d4d] text-white rounded-full shadow-lg hover:bg-[#003d3d] transition-all"
          >
            {isAdding ? <X size={20} /> : <Plus size={20} />}
          </button>
        )}
      </header>

      {/* Store Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-blue-100 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 bg-green-50 text-green-600 rounded-lg">
              <ShoppingBag size={14} />
            </div>
            <span className="text-[10px] font-bold text-blue-400 uppercase">Total Vendas</span>
          </div>
          <p className="text-lg font-bold text-blue-900">R$ {totalSales.toLocaleString('pt-BR')}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-blue-100 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 bg-red-50 text-red-600 rounded-lg">
              <Package size={14} />
            </div>
            <span className="text-[10px] font-bold text-blue-400 uppercase">Total Despesas</span>
          </div>
          <p className="text-lg font-bold text-blue-900">R$ {totalExpenses.toLocaleString('pt-BR')}</p>
        </div>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white p-6 rounded-3xl shadow-sm border border-blue-100 space-y-4"
          >
            <h2 className="font-bold text-blue-900">Novo Produto</h2>
            <div className="space-y-3">
              <input 
                placeholder="Nome do Produto" 
                className="w-full p-3 rounded-xl bg-blue-50 border-none outline-none text-sm"
                value={newProduct.name}
                onChange={e => setNewProduct({...newProduct, name: e.target.value})}
              />
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-blue-400 ml-1 uppercase">Valor</label>
                <input 
                  type="number" 
                  className="w-full p-3 rounded-xl bg-blue-50 border-none outline-none text-sm"
                  value={newProduct.price}
                  onChange={e => setNewProduct({...newProduct, price: Number(e.target.value)})}
                />
              </div>
              <select 
                className="w-full p-3 rounded-xl bg-blue-50 border-none outline-none text-sm"
                value={newProduct.type}
                onChange={e => setNewProduct({...newProduct, type: e.target.value as any})}
              >
                <option value="venda">Venda (Entrada)</option>
                <option value="despesa">Despesa (Saída)</option>
              </select>
              <button 
                onClick={handleAdd}
                className="w-full bg-[#004d4d] text-white font-bold py-3 rounded-xl shadow-md"
              >
                Adicionar ao Estoque
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 gap-4">
        {products.length > 0 ? products.map((product) => (
          <motion.div 
            key={product.id}
            layout
            className="bg-white p-5 rounded-2xl shadow-sm border border-blue-100 flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${product.type === 'venda' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                <Package size={24} />
              </div>
              <div>
                <h3 className="font-bold text-blue-900">{product.name}</h3>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-[10px] font-bold text-blue-400 uppercase">
                    Valor: R$ {product.price.toLocaleString('pt-BR')}
                  </span>
                </div>
              </div>
            </div>
            {isAdmin && (
              <button 
                onClick={() => handleDelete(product.id)}
                className="p-2 text-red-200 hover:text-red-500 transition-colors"
              >
                <Trash2 size={18} />
              </button>
            )}
          </motion.div>
        )) : (
          <div className="text-center py-10 text-blue-300">
            Estoque vazio
          </div>
        )}
      </div>
    </div>
  );
}
