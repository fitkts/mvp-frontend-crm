import { useState } from 'react';
import { Search, Plus, Package, CalendarDays, MoreVertical, Activity, Tag, Box } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ProductRegistrationModal from '../components/products/ProductRegistrationModal';
import ProductEditModal from '../components/products/ProductEditModal';

import { useAppStore } from '../store';
import { useProductList, useCreateProduct, useUpdateProduct, useDeleteProduct, Product } from '../api/queries/useProducts';
import { Loader2 } from 'lucide-react';

export default function ProductsPage() {
  const { data: productsData, isLoading } = useProductList();
  const products = productsData?.data || [];
  const updateProductMutation = useUpdateProduct();
  const deleteProductMutation = useDeleteProduct();
  const createProductMutation = useCreateProduct();

  const [searchTerm, setSearchTerm] = useState('');
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const filteredProducts = products.filter(p => p.name.includes(searchTerm));

  const handleEditClick = (product: Product) => {
    setSelectedProduct(product);
    setIsEditModalOpen(true);
  };

  const handleUpdateProduct = (updatedProduct: Product) => {
    updateProductMutation.mutate({ id: updatedProduct.id, data: updatedProduct });
  };

  const handleDeleteProduct = (id: number) => {
    deleteProductMutation.mutate(id);
  };

  const handleAddProduct = (newProduct: Product) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, ...productPayload } = newProduct;
    createProductMutation.mutate(productPayload);
  };


  return (
    <div className="space-y-8 pb-12">
      {/* 상단 헤더 섹션 */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-900 flex items-center gap-3">
            <Package className="text-emerald-600" size={32} />
            상품 관리
          </h1>
          <p className="text-slate-500 mt-1 font-medium">센터에서 판매 중인 수강권 및 회원권을 관리합니다.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative w-full md:w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="상품명 검색..."
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={() => setIsRegisterModalOpen(true)}
            className="neo-button flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 shrink-0"
          >
            <Plus size={20} />
            상품 등록
          </button>
        </div>
      </div>

      {/* 통계 요약 (상품용) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: '전체 상품', value: products.length, icon: Package, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: '판매 중', value: products.filter(p => p.isActive).length, icon: Activity, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'PT 상품', value: products.filter(p => p.category === 'PT').length, icon: Tag, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: '사물함/기타', value: products.filter(p => ['LOCKER', 'ETC'].includes(p.category)).length, icon: Box, color: 'text-orange-600', bg: 'bg-orange-50' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-5 flex items-center gap-4"
          >
            <div className={`w-12 h-12 rounded-2xl ${stat.bg} flex items-center justify-center ${stat.color}`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
              <p className="text-2xl font-display font-bold text-slate-900">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* 상품 목록 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        <AnimatePresence mode="popLayout">
          {filteredProducts.map((product, i) => (
            <motion.div
              layout
              key={product.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2, delay: i * 0.03 }}
              className={`glass-card group relative overflow-hidden flex flex-col h-full border-slate-100/50 hover:border-emerald-200 hover:shadow-md transition-all ${!product.isActive ? 'opacity-70 grayscale-[0.5]' : ''}`}
            >
              <div className="p-4 flex flex-col h-full">
                <div className="flex justify-between items-start mb-3">
                  <div className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-tighter border ${
                    product.category === 'PT' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                    product.category === 'MEMBERSHIP' ? 'bg-blue-50 text-blue-600 border-blue-100' : 
                    product.category === 'LOCKER' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                    'bg-purple-50 text-purple-600 border-purple-100'
                  }`}>
                    {product.category}
                  </div>
                  <button 
                    onClick={() => handleEditClick(product)}
                    className="p-1.5 text-slate-300 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-all"
                  >
                    <MoreVertical size={14} />
                  </button>
                </div>
                
                <h3 className="text-sm font-bold text-slate-900 mb-1 truncate group-hover:text-emerald-600 transition-colors">
                  {product.name}
                </h3>
                
                <div className="mt-3 flex flex-col gap-1.5">
                  <div className="flex items-baseline gap-0.5">
                    <span className="text-lg font-display font-black text-slate-900">{product.price.toLocaleString()}</span>
                    <span className="text-[10px] text-slate-400 font-bold">원</span>
                  </div>

                  <div className="flex items-center gap-3 pt-2 mt-2 border-t border-slate-50">
                    <div className="flex items-center gap-1">
                      <Activity size={10} className="text-emerald-500" />
                      <span className="text-[10px] font-bold text-slate-500">
                        {product.sessionCnt === -1 ? '무제한' : `${product.sessionCnt}회`}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <CalendarDays size={10} className="text-blue-500" />
                      <span className="text-[10px] font-bold text-slate-500">{product.validDays}일</span>
                    </div>
                  </div>
                </div>

                {!product.isActive && (
                  <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center pointer-events-none">
                    <div className="bg-slate-900 text-white px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-tighter">
                      Inactive
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* 상품 등록 모달 */}
      <ProductRegistrationModal 
        isOpen={isRegisterModalOpen} 
        onClose={() => setIsRegisterModalOpen(false)}
        onAdd={handleAddProduct}
      />

      {/* 상품 수정 모달 */}
      <ProductEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        product={selectedProduct}
        onUpdate={handleUpdateProduct}
        onDelete={handleDeleteProduct}
      />
    </div>
  );
}
