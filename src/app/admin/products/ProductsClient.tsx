'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/types';
import { toggleProductStockAction } from '@/app/actions/adminActions';
import { deleteProductAction } from '@/app/actions/catalogActions';
import { Search, Layers, CheckCircle2, XCircle, ExternalLink, Scissors, Plus, Trash2 } from 'lucide-react';

interface Props {
  initialProducts: Product[];
}

export const ProductsClient: React.FC<Props> = ({ initialProducts }) => {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const formatPKR = (amount: number) => `PKR ${amount.toLocaleString('en-PK')}`;

  const handleToggleStock = async (product: Product) => {
    const newStock = !product.inStock;
    setUpdatingId(product.id);

    const res = await toggleProductStockAction(product.id, newStock);
    setUpdatingId(null);

    if (res.success) {
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, inStock: newStock } : p))
      );
    }
  };

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDeleteProduct = async (product: Product) => {
    if (
      !window.confirm(
        `Are you sure you want to delete "${product.title}" from the catalog? This will remove it from the customer storefront.`
      )
    ) {
      return;
    }
    setDeletingId(product.id);
    const res = await deleteProductAction(product.id);
    setDeletingId(null);
    if (res.success) {
      setProducts((prev) => prev.filter((p) => p.id !== product.id));
    } else {
      alert(res.error || 'Failed to delete product.');
    }
  };

  const filtered = products.filter((p) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.title.toLowerCase().includes(q) ||
      p.fabric.toLowerCase().includes(q) ||
      p.collection.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-[#1F1F24]">
            Fabric & Inventory Atelier
          </h1>
          <p className="text-xs text-[#66666E] mt-0.5">
            Manage fabric stock availability, add new collections, and configure tailored pricing.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/products/new"
            className="btn-rani px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Luxury Suit</span>
          </Link>
          <span className="font-mono text-xs font-bold text-[#1F1F24] bg-white px-3 py-2.5 rounded-lg border border-[#E5E2DC]">
            {products.length} Suits
          </span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#E5E2DC] shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 text-[#8E8E98] absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by suit name, fabric (Lawn, Chiffon, Velvet), collection or SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#FAF8F5] border border-[#E5E2DC] rounded-lg pl-10 pr-4 py-2 text-xs text-[#1F1F24] focus:outline-none focus:border-[#D4AF37]"
          />
        </div>
      </div>

      {/* Product Table */}
      <div className="bg-white rounded-xl border border-[#E5E2DC] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF8F5] text-[#66666E] uppercase font-bold text-[10px] tracking-wider border-b border-[#E5E2DC]">
              <tr>
                <th className="py-3 px-4">Suit Design</th>
                <th className="py-3 px-4">Collection & SKU</th>
                <th className="py-3 px-4">Fabric Details</th>
                <th className="py-3 px-4">Base Price</th>
                <th className="py-3 px-4">Silai Fees</th>
                <th className="py-3 px-4">Stock Status</th>
                <th className="py-3 px-4 text-right">Storefront</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E2DC]">
              {filtered.map((product) => (
                <tr key={product.id} className="hover:bg-[#FAF8F5]/80 transition-colors">
                  {/* Title & Image */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-14 relative rounded bg-neutral-100 overflow-hidden shrink-0 border border-[#E5E2DC]">
                        <Image
                          src={product.images.primary}
                          alt={product.title}
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      </div>
                      <div>
                        <span className="font-bold text-[#1F1F24] block leading-snug">
                          {product.title}
                        </span>
                        <span className="text-[10px] text-[#8E8E98] capitalize block mt-0.5">
                          {product.pieceCount} • {product.colorName}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Collection */}
                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-[#1F1F24] block">{product.collection}</span>
                    <span className="font-mono text-[10px] text-[#8E8E98] block">{product.sku}</span>
                  </td>

                  {/* Fabric */}
                  <td className="py-3.5 px-4">
                    <span className="inline-block px-2 py-0.5 rounded bg-[#FAF5E6] text-[#8F741C] border border-[#D4AF37]/40 font-bold text-[10px]">
                      {product.fabric}
                    </span>
                    <span className="text-[10px] text-[#66666E] block mt-1 line-clamp-1 max-w-xs">
                      {product.fabricDescription}
                    </span>
                  </td>

                  {/* Base Price */}
                  <td className="py-3.5 px-4 font-mono font-bold text-sm text-[#1F1F24]">
                    {formatPKR(product.basePricePKR)}
                  </td>

                  {/* Silai Fees */}
                  <td className="py-3.5 px-4 text-[11px]">
                    <div className="text-[#0A5C36]">
                      Std: <strong>+{formatPKR(product.standardStitchingFeePKR)}</strong>
                    </div>
                    <div className="text-[#E61A6B]">
                      Custom: <strong>+{formatPKR(product.customStitchingFeePKR)}</strong>
                    </div>
                  </td>

                  {/* Stock Toggle */}
                  <td className="py-3.5 px-4">
                    <button
                      type="button"
                      disabled={updatingId === product.id}
                      onClick={() => handleToggleStock(product)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-colors cursor-pointer ${
                        product.inStock
                          ? 'bg-[#0A5C36]/10 text-[#0A5C36] hover:bg-[#0A5C36]/20'
                          : 'bg-red-100 text-red-700 hover:bg-red-200'
                      }`}
                    >
                      {product.inStock ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>In Stock</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Out of Stock</span>
                        </>
                      )}
                    </button>
                  </td>

                  {/* Actions & Storefront Link */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="inline-flex items-center gap-3">
                      <Link
                        href={`/product/${product.slug}`}
                        target="_blank"
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-[#E61A6B] hover:underline"
                        title="View on customer storefront"
                      >
                        <span>View</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>

                      <button
                        type="button"
                        onClick={() => handleDeleteProduct(product)}
                        disabled={deletingId === product.id}
                        className="p-1 text-[#8E8E98] hover:text-red-600 transition-colors"
                        title="Delete suit design"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
