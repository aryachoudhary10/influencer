// --- Place in src/components/dashboard/AddProductForm.jsx ---
import React, { useState } from 'react';
import { Card, Button, Input, Icon } from '../ui';
import { BACKEND_URL } from '../../config';

export const AddProductForm = ({ userId, onProductAdded, showToast }) => {
    // Component-specific state
    const [productUrl, setProductUrl] = useState('');
    const [productName, setProductName] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [generatedLink, setGeneratedLink] = useState(null);

    const handleGenerate = async () => {
        if (!productUrl || !productName || !imageUrl) {
            showToast('Please fill all fields.', 'error');
            return;
        }
        setIsLoading(true);
        try {
            const response = await fetch(`${BACKEND_URL}/add_product`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, productUrl, productName, imageUrl })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error);

            showToast(data.isAffiliated ? data.message : 'Product added, but commission is not available.', data.isAffiliated ? 'success' : 'info');
            setGeneratedLink(data.product.affiliateUrl);
            onProductAdded(data.product);
            
            setProductUrl('');
            setProductName('');
            setImageUrl('');
        } catch (error) {
            showToast(error.message, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(generatedLink).then(() => showToast('Link copied!'));
    };

    return (
        <Card>
            <h2 className="text-2xl font-bold text-gold mb-2 flex items-center"><Icon name="link" className="mr-3 lucide-gold" />Add a New Product</h2>
            <p className="text-gray-400 mb-6">Enter product details to generate a showcase item.</p>
            <div className="space-y-4">
                <Input placeholder="Product URL" value={productUrl} onChange={e => setProductUrl(e.target.value)} />
                <Input placeholder="Product Name" value={productName} onChange={e => setProductName(e.target.value)} />
                <Input placeholder="Product Image URL" value={imageUrl} onChange={e => setImageUrl(e.target.value)} />
                <Button onClick={handleGenerate} disabled={isLoading} className="w-full flex items-center justify-center h-[48px]">
                    {isLoading ? <Icon name="loader" className="animate-spin" /> : <><Icon name="sparkles" className="mr-2 h-5 w-5" /> Generate & Add</>}
                </Button>
            </div>
            {generatedLink && (
                <div className="mt-6 p-4 bg-gray-800 rounded-lg">
                    <p className="font-semibold text-gray-300">Your Affiliate Link:</p>
                    <div className="flex items-center justify-between mt-2">
                        <code className="text-yellow-400 bg-gray-700 p-2 rounded-md text-sm truncate">{generatedLink}</code>
                        <button onClick={handleCopy} className="ml-4 p-2 rounded-full hover:bg-gray-600"><Icon name="copy" className="h-5 w-5 text-gray-300" /></button>
                    </div>
                </div>
            )}
        </Card>
    );
};

