import React from 'react';
import { Layout, X, Check, Star } from 'lucide-react';
import { designs } from '../lib/designs';

interface DesignsPageProps {
    currentDesign: string;
    recommendedDesignIds?: string[];
    onSelect: (designId: string) => void;
    onClose: () => void;
    isInline?: boolean;
}

export default function DesignsPage({ currentDesign, recommendedDesignIds, onSelect, onClose, isInline = false }: DesignsPageProps) {
    const recommendedDesigns = recommendedDesignIds
        ? designs.filter(d => recommendedDesignIds.includes(d.id))
        : [];

    const otherDesigns = recommendedDesignIds
        ? designs.filter(d => !recommendedDesignIds.includes(d.id))
        : designs;

    const DesignCard = ({ design }: { design: typeof designs[0] }) => (
        <button
            onClick={() => onSelect(design.id)}
            className={`group relative rounded-xl overflow-hidden border-2 transition-all text-left shadow-sm hover:shadow-md hover:scale-[1.01] transform bg-white flex flex-col h-full ${currentDesign === design.id
                ? 'border-brand-600 ring-2 ring-brand-100'
                : 'border-gray-200 hover:border-brand-400'
                }`}
        >
            <div className="aspect-[3/4] w-full bg-gray-100 relative overflow-hidden">
                {design.thumbnail ? (
                    <img
                        src={design.thumbnail}
                        alt={design.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <Layout size={isInline ? 32 : 48} />
                    </div>
                )}

                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                    <p className="text-white font-bold text-sm">{design.name}</p>
                    {!isInline && <p className="text-white/90 text-xs mt-1 leading-relaxed line-clamp-2">{design.description}</p>}
                </div>

                {/* Active Indicator */}
                {currentDesign === design.id && (
                    <div className="absolute top-2 right-2 bg-brand-600 text-white p-1.5 rounded-full shadow-lg z-10">
                        <Check size={14} />
                    </div>
                )}
            </div>

            <div className="p-3">
                <h4 className="font-bold text-gray-900 text-sm mb-2">{design.name}</h4>
                <div className="flex flex-wrap gap-1">
                    {design.features.slice(0, 2).map((feature, i) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full font-medium">
                            {feature}
                        </span>
                    ))}
                    {design.features.length > 2 && (
                        <span className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full font-medium">
                            +{design.features.length - 2}
                        </span>
                    )}
                </div>
            </div>
        </button>
    );

    const Content = (
        <div className={`space-y-8 ${isInline ? 'p-2' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'}`}>
            {recommendedDesigns.length > 0 && (
                <section>
                    <div className="flex items-center gap-2 mb-4">
                        <Star className="text-yellow-500 fill-yellow-500" size={18} />
                        <h2 className={`${isInline ? 'text-lg' : 'text-2xl'} font-bold text-gray-900`}>Recommended</h2>
                    </div>
                    <div className={`grid gap-4 ${isInline ? 'grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'}`}>
                        {recommendedDesigns.map((design) => (
                            <DesignCard key={design.id} design={design} />
                        ))}
                    </div>
                </section>
            )}

            <section>
                {recommendedDesigns.length > 0 && (
                    <h2 className={`${isInline ? 'text-lg' : 'text-2xl'} font-bold text-gray-900 mb-4`}>All Designs</h2>
                )}
                <div className={`grid gap-4 ${isInline ? 'grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'}`}>
                    {otherDesigns.map((design) => (
                        <DesignCard key={design.id} design={design} />
                    ))}
                </div>
            </section>
        </div>
    );

    if (isInline) {
        return Content;
    }

    return (
        <div className="fixed inset-0 z-[100] overflow-y-auto bg-gray-50 flex flex-col animate-fade-in-up">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-3">
                            <div className="bg-gradient-to-br from-indigo-500 to-violet-500 text-white rounded-xl p-2 shadow-lg">
                                <Layout size={20} />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">Choose Your Design</h1>
                                <p className="text-xs text-gray-500">Select a layout structure for your resume</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
                        >
                            <X size={24} />
                        </button>
                    </div>
                </div>
            </header>

            <main className="flex-1 w-full">
                {Content}
            </main>
        </div>
    );
}
