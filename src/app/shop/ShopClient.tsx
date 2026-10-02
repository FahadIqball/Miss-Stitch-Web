'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { PRODUCTS } from '@/data/products';
import { Product } from '@/types';
import { ProductCard } from '@/components/product/ProductCard';
import { useCurrencyStore } from '@/store/useCurrencyStore';
import { getStorefrontStockMapAction } from '@/app/actions/adminActions';
import {
  Filter,
  SlidersHorizontal,
  X,
  ChevronDown,
  Sparkles,
  Grid3X3,
  LayoutGrid,
  Check,
  RotateCcw,
} from 'lucide-react';

const FABRICS = ['All', 'Lawn', 'Chiffon', 'Raw Silk', 'Organza', 'Velvet', 'Jacquard'];
const OCCASIONS = ['All', 'Wedding / Festive', 'Semi-Formal', 'Daily Wear', 'Eid Edit'];
const PIECE_COUNTS = ['All', '3-Piece', '2-Piece', '1-Piece'];
const COLOR_SWATCHES = [
  { name: 'Rani Pink', hex: '#E61A6B' },
  { name: 'Emerald Green', hex: '#0A5C36' },
  { name: 'Ochre Mustard', hex: '#F3A712' },
  { name: 'Midnight Black', hex: '#1F1F24' },
  { name: 'Raw Silk Ivory', hex: '#FAF8F5' },
  { name: 'Royal Crimson', hex: '#9E182B' },
  { name: 'Royal Sapphire', hex: '#1A365D' },
  { name: 'Pastel Peach', hex: '#F3C5B5' },
];

interface ShopClientProps {
  initialProducts?: Product[];
}

export const ShopClient: React.FC<ShopClientProps> = ({ initialProducts }) => {
  const baseCatalog = (initialProducts && initialProducts.length > 0) ? initialProducts : PRODUCTS;
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category');
  const filterParam = searchParams.get('filter');

  const { formatPrice } = useCurrencyStore();

  // Dynamic Live Database Inventory State
  const [stockMap, setStockMap] = useState<Record<string, boolean>>({});

  // Filters State
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryParam || 'all');
  const [selectedFabric, setSelectedFabric] = useState<string>('All');
  const [selectedOccasion, setSelectedOccasion] = useState<string>('All');
  const [selectedPieceCount, setSelectedPieceCount] = useState<string>('All');
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [maxPrice, setMaxPrice] = useState<number>(30000);
  const [sortBy, setSortBy] = useState<string>('popular');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [gridCols, setGridCols] = useState<3 | 4>(4);

  // Sync category param if URL changes
  React.useEffect(() => {
    if (categoryParam) setSelectedCategory(categoryParam);
  }, [categoryParam]);

  // Fetch live inventory stock map
  React.useEffect(() => {
    getStorefrontStockMapAction().then((map) => {
      if (map && Object.keys(map).length > 0) {
        setStockMap(map);
      }
    });
  }, []);

  // Filtering Logic
  const filteredProducts = useMemo(() => {
    let result = baseCatalog.map((p) => ({
      ...p,
      inStock: stockMap[p.slug] ?? stockMap[p.id] ?? p.inStock,
    }));

    if (selectedCategory !== 'all') {
      result = result.filter((p) => p.category === selectedCategory);
    }

    if (filterParam === 'new') {
      result = result.filter((p) => p.isNew);
    } else if (filterParam === 'sale') {
      result = result.filter((p) => p.isBestSeller);
    }

    if (selectedFabric !== 'All') {
      result = result.filter((p) => p.fabric === selectedFabric);
    }

    if (selectedOccasion !== 'All') {
      result = result.filter((p) => p.occasion === selectedOccasion);
    }

    if (selectedPieceCount !== 'All') {
      result = result.filter((p) => p.pieceCount === selectedPieceCount);
    }

    if (selectedColor) {
      result = result.filter((p) =>
        p.colorName.toLowerCase().includes(selectedColor.toLowerCase())
      );
    }

    result = result.filter((p) => p.basePricePKR <= maxPrice);

    // Sorting
    if (sortBy === 'price-low') {
      result.sort((a, b) => a.basePricePKR - b.basePricePKR);
    } else if (sortBy === 'price-high') {
      result.sort((a, b) => b.basePricePKR - a.basePricePKR);
    } else if (sortBy === 'newest') {
      result.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
    } else {
      result.sort((a, b) => b.rating - a.rating);
    }

    return result;
  }, [
    selectedCategory,
    filterParam,
    selectedFabric,
    selectedOccasion,
    selectedPieceCount,
    selectedColor,
    maxPrice,
    sortBy,
    baseCatalog,
    stockMap,
  ]);

  const resetFilters = () => {
    setSelectedCategory('all');
    setSelectedFabric('All');
    setSelectedOccasion('All');
    setSelectedPieceCount('All');
    setSelectedColor(null);
    setMaxPrice(30000);
    setSortBy('popular');
  };

  const getCollectionTitle = () => {
    if (selectedCategory === 'unstitched') return 'Luxury Unstitched 3-Piece & 2-Piece Suits';
    if (selectedCategory === 'ready-to-wear') return 'Ready to Wear Pret Collection';
    if (selectedCategory === 'velvet') return 'Micro 9000 Velvet Formals';
    if (selectedCategory === 'festive') return 'Festive Luxury Zardozi & Organza';
    if (filterParam === 'new') return 'New Arrivals — Season Drop 2026';
    if (filterParam === 'sale') return 'Exclusive Festive Sale & Limited Editions';
    return 'All Luxury Pret & Unstitched Collections';
  };

  return (
    <div className="bg-[#FAF8F5] min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-[#66666E] mb-4">
          <Link href="/" className="hover:text-[#E61A6B]">Home</Link>
          <span>/</span>
          <span className="text-[#1F1F24] font-semibold">Catalog</span>
          <span>/</span>
          <span className="text-[#E61A6B] font-bold capitalize">
            {selectedCategory === 'all' ? 'All Suits' : selectedCategory.replace('-', ' ')}
          </span>
        </nav>

        {/* Category Header Banner */}
        <div className="bg-white border border-[#E5E2DC] rounded-xl p-6 sm:p-8 mb-8 shadow-xs relative overflow-hidden">
          <div className="max-w-2xl relative z-10">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-[#FAF5E6] border border-[#D4AF37]/50 text-[#1F1F24] text-[11px] font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5 text-[#E61A6B]" />
              <span>Pakistani Haute Couture</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-4xl font-bold text-[#1F1F24]">
              {getCollectionTitle()}
            </h1>
            <p className="text-xs sm:text-sm text-[#66666E] mt-2 leading-relaxed">
              Every suit in this collection is crafted from 100% authentic pure lawn, raw silk, and crinkle chiffon. Choose unstitched delivery or tap &ldquo;Custom Silai&rdquo; to have our master karigars stitch to your exact inch measurements.
            </p>
          </div>
          <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-[#D4AF37]/10 rounded-full blur-2xl pointer-events-none" />
        </div>

        {/* Sticky Control Bar */}
        <div className="bg-white border border-[#E5E2DC] rounded-lg p-3 sm:p-4 mb-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
          {/* Left: Mobile Filter Trigger & Item Count */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setIsMobileFilterOpen(true)}
              className="lg:hidden btn-rani px-4 py-2 rounded text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Filters</span>
            </button>
            <span className="text-xs text-[#66666E] font-medium">
              Showing <strong className="text-[#1F1F24]">{filteredProducts.length}</strong> Designer Suits
            </span>
          </div>

          {/* Right: Sort By & Grid View Switcher */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-[#66666E] hidden sm:inline font-semibold">Sort By:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-[#FAF8F5] border border-[#E5E2DC] rounded px-3 py-1.5 text-xs font-semibold text-[#1F1F24] focus:outline-none focus:border-[#D4AF37]"
              >
                <option value="popular">Most Popular</option>
                <option value="newest">Newest Drops First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>

            {/* Desktop Grid Switcher */}
            <div className="hidden lg:flex items-center bg-[#FAF8F5] border border-[#E5E2DC] rounded p-0.5">
              <button
                type="button"
                onClick={() => setGridCols(3)}
                className={`p-1.5 rounded ${gridCols === 3 ? 'bg-white shadow-xs text-[#1F1F24]' : 'text-[#66666E]'}`}
                aria-label="3 Column Grid"
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setGridCols(4)}
                className={`p-1.5 rounded ${gridCols === 4 ? 'bg-white shadow-xs text-[#1F1F24]' : 'text-[#66666E]'}`}
                aria-label="4 Column Grid"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Layout (Sidebar + Product Grid) */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block space-y-6">
            <div className="bg-white border border-[#E5E2DC] rounded-xl p-5 shadow-xs space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-[#E5E2DC]">
                <div className="flex items-center gap-2 font-bold text-sm text-[#1F1F24]">
                  <SlidersHorizontal className="w-4 h-4 text-[#D4AF37]" />
                  <span>Smart Filters</span>
                </div>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="text-[11px] text-[#E61A6B] font-semibold hover:underline flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset All</span>
                </button>
              </div>

              {/* Stitching Type Filter */}
              <div>
                <h4 className="text-xs font-bold text-[#1F1F24] uppercase tracking-wider mb-2.5">
                  Category & Type
                </h4>
                <div className="space-y-1.5 text-xs">
                  {[
                    { id: 'all', label: 'All Collections' },
                    { id: 'unstitched', label: 'Unstitched Fabric' },
                    { id: 'ready-to-wear', label: 'Ready to Wear Pret' },
                    { id: 'festive', label: 'Festive Luxury' },
                    { id: 'velvet', label: 'Velvet Formals' },
                  ].map((cat) => (
                    <label
                      key={cat.id}
                      className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors ${
                        selectedCategory === cat.id
                          ? 'bg-[#FAF5E6] font-bold text-[#1F1F24] border border-[#D4AF37]/50'
                          : 'text-[#66666E] hover:bg-[#FAF8F5]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="category"
                          checked={selectedCategory === cat.id}
                          onChange={() => setSelectedCategory(cat.id)}
                          className="accent-[#E61A6B]"
                        />
                        <span>{cat.label}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Fabric Filter */}
              <div className="pt-4 border-t border-[#E5E2DC]">
                <h4 className="text-xs font-bold text-[#1F1F24] uppercase tracking-wider mb-2.5">
                  Fabric Type
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {FABRICS.map((fab) => (
                    <button
                      key={fab}
                      type="button"
                      onClick={() => setSelectedFabric(fab)}
                      className={`px-2.5 py-1 rounded text-xs font-medium border transition-all ${
                        selectedFabric === fab
                          ? 'bg-[#1F1F24] text-white border-[#1F1F24] font-bold'
                          : 'bg-[#FAF8F5] text-[#66666E] border-[#E5E2DC] hover:border-[#D4AF37]'
                      }`}
                    >
                      {fab}
                    </button>
                  ))}
                </div>
              </div>

              {/* Occasion Filter */}
              <div className="pt-4 border-t border-[#E5E2DC]">
                <h4 className="text-xs font-bold text-[#1F1F24] uppercase tracking-wider mb-2.5">
                  Occasion
                </h4>
                <div className="space-y-1 text-xs">
                  {OCCASIONS.map((occ) => (
                    <button
                      key={occ}
                      type="button"
                      onClick={() => setSelectedOccasion(occ)}
                      className={`w-full text-left px-2 py-1 rounded transition-colors ${
                        selectedOccasion === occ
                          ? 'bg-[#FAF5E6] text-[#E61A6B] font-bold'
                          : 'text-[#66666E] hover:bg-[#FAF8F5]'
                      }`}
                    >
                      {occ}
                    </button>
                  ))}
                </div>
              </div>

              {/* Visual Color Swatches */}
              <div className="pt-4 border-t border-[#E5E2DC]">
                <div className="flex items-center justify-between mb-2.5">
                  <h4 className="text-xs font-bold text-[#1F1F24] uppercase tracking-wider">
                    Color Palette
                  </h4>
                  {selectedColor && (
                    <button
                      type="button"
                      onClick={() => setSelectedColor(null)}
                      className="text-[10px] text-[#E61A6B] underline"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {COLOR_SWATCHES.map((swatch) => {
                    const isSelected = selectedColor === swatch.name;
                    return (
                      <button
                        key={swatch.name}
                        type="button"
                        onClick={() =>
                          setSelectedColor(isSelected ? null : swatch.name)
                        }
                        title={swatch.name}
                        className={`group relative flex flex-col items-center gap-1 p-1 rounded border transition-all ${
                          isSelected
                            ? 'border-[#E61A6B] bg-[#FAF5E6]'
                            : 'border-transparent hover:border-[#E5E2DC]'
                        }`}
                      >
                        <span
                          className="w-6 h-6 rounded-full border border-black/10 shadow-xs flex items-center justify-center"
                          style={{ backgroundColor: swatch.hex }}
                        >
                          {isSelected && (
                            <Check
                              className={`w-3.5 h-3.5 ${
                                swatch.hex === '#FAF8F5' || swatch.hex === '#F3C5B5'
                                  ? 'text-black'
                                  : 'text-white'
                              }`}
                            />
                          )}
                        </span>
                        <span className="text-[9px] text-[#66666E] truncate max-w-[50px]">
                          {swatch.name.split(' ')[0]}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Price Range Slider */}
              <div className="pt-4 border-t border-[#E5E2DC]">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-[#1F1F24] uppercase tracking-wider">
                    Max Price (PKR)
                  </h4>
                  <span className="font-mono text-xs font-bold text-[#E61A6B]">
                    {formatPrice(maxPrice)}
                  </span>
                </div>
                <input
                  type="range"
                  min={8000}
                  max={30000}
                  step={1000}
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-[#E61A6B] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-[#66666E] mt-1 font-mono">
                  <span>Rs. 8,000</span>
                  <span>Rs. 30,000</span>
                </div>
              </div>
            </div>
          </aside>

          {/* Product Grid Area (3 or 4 columns) */}
          <div className="lg:col-span-3">
            {filteredProducts.length === 0 ? (
              <div className="bg-white border border-[#E5E2DC] rounded-xl p-12 text-center">
                <div className="w-16 h-16 bg-[#FAF5E6] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-[#D4AF37]" />
                </div>
                <h3 className="font-serif text-xl font-bold text-[#1F1F24] mb-2">
                  No Suits Match These Exact Filters
                </h3>
                <p className="text-xs text-[#66666E] max-w-sm mx-auto mb-6">
                  Try clearing your color, occasion, or price limits to view our complete luxury festive drops.
                </p>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="btn-rani px-6 py-2.5 rounded text-xs font-bold uppercase tracking-wider"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div
                className={`grid grid-cols-1 sm:grid-cols-2 gap-6 ${
                  gridCols === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-3 xl:grid-cols-3'
                }`}
              >
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/60 transition-opacity"
            onClick={() => setIsMobileFilterOpen(false)}
          />
          <div className="fixed inset-y-0 right-0 max-w-xs w-full bg-[#FAF8F5] shadow-xl flex flex-col z-50">
            <div className="p-4 bg-white border-b border-[#E5E2DC] flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-sm text-[#1F1F24]">
                <Filter className="w-4 h-4 text-[#D4AF37]" />
                <span>Filters & Refinements</span>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(false)}
                className="p-1 text-[#66666E]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {/* Category */}
              <div>
                <h4 className="text-xs font-bold text-[#1F1F24] uppercase mb-2">Category</h4>
                <div className="space-y-1 text-xs">
                  {['all', 'unstitched', 'ready-to-wear', 'festive', 'velvet'].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={`w-full text-left p-2 rounded capitalize ${
                        selectedCategory === cat
                          ? 'bg-[#FAF5E6] font-bold text-[#E61A6B]'
                          : 'text-[#66666E]'
                      }`}
                    >
                      {cat.replace('-', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Fabric */}
              <div className="pt-4 border-t border-[#E5E2DC]">
                <h4 className="text-xs font-bold text-[#1F1F24] uppercase mb-2">Fabric</h4>
                <div className="flex flex-wrap gap-1.5">
                  {FABRICS.map((fab) => (
                    <button
                      key={fab}
                      type="button"
                      onClick={() => setSelectedFabric(fab)}
                      className={`px-2.5 py-1 rounded text-xs ${
                        selectedFabric === fab
                          ? 'bg-[#1F1F24] text-white font-bold'
                          : 'bg-white border border-[#E5E2DC] text-[#66666E]'
                      }`}
                    >
                      {fab}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price */}
              <div className="pt-4 border-t border-[#E5E2DC]">
                <div className="flex justify-between text-xs font-bold text-[#1F1F24] mb-1">
                  <span>Max Price</span>
                  <span className="text-[#E61A6B]">{formatPrice(maxPrice)}</span>
                </div>
                <input
                  type="range"
                  min={8000}
                  max={30000}
                  step={1000}
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-[#E61A6B]"
                />
              </div>
            </div>

            <div className="p-4 bg-white border-t border-[#E5E2DC] flex gap-2">
              <button
                type="button"
                onClick={resetFilters}
                className="flex-1 py-2.5 bg-[#FAF8F5] border border-[#E5E2DC] rounded text-xs font-bold text-[#1F1F24]"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(false)}
                className="btn-rani flex-1 py-2.5 rounded text-xs font-bold uppercase"
              >
                Show Results
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
