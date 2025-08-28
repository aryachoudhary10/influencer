import React from 'react';
import { Card, Icon } from '../ui';
import { BACKEND_URL } from '../../config';

// --- Corrected ProductCard Component ---
// This version matches the layout of your HTML showcase template and
// now uses external imports for UI components and configuration.

export const ProductCard = ({ product, onDelete }) => (
    <Card className="group p-0 overflow-hidden">
        {/* Delete button remains positioned relative to the card */}
        <button 
            onClick={() => onDelete(product.id)} 
            className="absolute top-4 right-4 bg-red-600/80 hover:bg-red-600 p-2 rounded-full z-10 transition-opacity opacity-0 group-hover:opacity-100"
            aria-label="Delete product"
        >
            <Icon name="Trash2" className="h-4 w-4 text-white" size={16} />
        </button>

        {/* 1. Image Container */}
        <div className="h-64 overflow-hidden">
            <img 
                src={product.imageUrl} 
                alt={product.name} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
            />
        </div>

        {/* 2. Content Container (Separate from Image) */}
        <div className="p-5 flex flex-col flex-grow">
            <h3 className="text-lg font-bold text-white flex-grow mb-4">
                {product.name}
            </h3>
            
            {/* The "Shop Now" button is aligned to the bottom */}
            <a 
                href={product.affiliateUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="mt-auto bg-amber-400 text-gray-900 hover:bg-amber-300 font-semibold rounded-lg transition-all duration-300 text-center text-sm p-3 flex items-center justify-center"
            >
                <Icon name="ShoppingBag" className="h-5 w-5 mr-2" size={20} />
                Shop Now
            </a>
        </div>
    </Card>
);

export default ProductCard;
