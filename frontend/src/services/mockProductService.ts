import { AxiosResponse } from 'axios';
import logger from '../utils/logger';

// Define interfaces
export interface Product {
    _id: string;
    title: string;
    description: string;
    price: number;
    category: string;
    coverImage: string;
    previewUrl: string | null;
    featured: boolean;
    publishedDate: string;
    isActive: boolean;
    stripeProductId: string;
    stripePriceId: string;
    createdAt: string;
    updatedAt: string;
}

export interface Purchase {
    _id: string;
    user: {
        _id: string;
        username: string;
    };
    product: {
        _id: string;
        title: string;
        price: number;
    };
    stripeSessionId: string;
    stripePaymentIntentId: string;
    amount: number;
    currency: string;
    status: string;
    accessExpires: string;
    downloadCount: number;
    lastDownloaded: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface DownloadLink {
    downloadUrl: string;
}

// Helper function to simulate API delay
const mockDelay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock products data
const mockProducts: Product[] = [
    {
        _id: 'prod1',
        title: '11+ Mathematics Practice Workbook',
        description: 'A comprehensive workbook with 200+ practice questions covering all key mathematics topics for the 11+ exam. Includes detailed solutions and explanations.',
        price: 12.99,
        category: '11+ Maths',
        coverImage: 'https://images.unsplash.com/photo-1635372722656-389f87a941db?q=80&w=500&auto=format&fit=crop',
        previewUrl: null,
        featured: true,
        publishedDate: new Date(2023, 5, 15).toISOString(),
        isActive: true,
        stripeProductId: 'mock_stripe_prod_1',
        stripePriceId: 'mock_stripe_price_1',
        createdAt: new Date(2023, 5, 10).toISOString(),
        updatedAt: new Date(2023, 5, 10).toISOString()
    },
    {
        _id: 'prod2',
        title: '11+ English Comprehension Guide',
        description: 'Master comprehension skills with this comprehensive guide featuring 150+ practice passages and questions with detailed explanations and marking schemes.',
        price: 14.99,
        category: '11+ English',
        coverImage: 'https://images.unsplash.com/photo-1550399105-c4db5fb85c18?q=80&w=500&auto=format&fit=crop',
        previewUrl: null,
        featured: true,
        publishedDate: new Date(2023, 6, 20).toISOString(),
        isActive: true,
        stripeProductId: 'mock_stripe_prod_2',
        stripePriceId: 'mock_stripe_price_2',
        createdAt: new Date(2023, 6, 15).toISOString(),
        updatedAt: new Date(2023, 6, 15).toISOString()
    },
    {
        _id: 'prod3',
        title: '11+ Verbal Reasoning Techniques',
        description: 'Learn essential techniques and strategies for solving all types of verbal reasoning questions. Includes 300+ practice questions with step-by-step solutions.',
        price: 15.99,
        category: '11+ Verbal Reasoning',
        coverImage: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=500&auto=format&fit=crop',
        previewUrl: null,
        featured: false,
        publishedDate: new Date(2023, 7, 5).toISOString(),
        isActive: true,
        stripeProductId: 'mock_stripe_prod_3',
        stripePriceId: 'mock_stripe_price_3',
        createdAt: new Date(2023, 7, 1).toISOString(),
        updatedAt: new Date(2023, 7, 1).toISOString()
    },
    {
        _id: 'prod4',
        title: '11+ Non-verbal Reasoning Mastery',
        description: 'A complete guide to mastering non-verbal reasoning with detailed explanations of all question types and 250+ practice questions with solutions.',
        price: 13.99,
        category: '11+ Non-verbal Reasoning',
        coverImage: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=500&auto=format&fit=crop',
        previewUrl: null,
        featured: false,
        publishedDate: new Date(2023, 8, 10).toISOString(),
        isActive: true,
        stripeProductId: 'mock_stripe_prod_4',
        stripePriceId: 'mock_stripe_price_4',
        createdAt: new Date(2023, 8, 5).toISOString(),
        updatedAt: new Date(2023, 8, 5).toISOString()
    },
    {
        _id: 'prod5',
        title: 'Complete 11+ Study Planner',
        description: 'An essential planning tool for 11+ exam preparation. Includes weekly study schedules, progress trackers, and tips for effective revision.',
        price: 9.99,
        category: 'General',
        coverImage: 'https://images.unsplash.com/photo-1606761568499-6d2451b23c66?q=80&w=500&auto=format&fit=crop',
        previewUrl: null,
        featured: true,
        publishedDate: new Date(2023, 9, 1).toISOString(),
        isActive: true,
        stripeProductId: 'mock_stripe_prod_5',
        stripePriceId: 'mock_stripe_price_5',
        createdAt: new Date(2023, 8, 25).toISOString(),
        updatedAt: new Date(2023, 8, 25).toISOString()
    },
    {
        _id: 'prod6',
        title: '11+ Mock Exam Pack',
        description: 'A set of 5 complete mock exams covering all subjects with realistic exam conditions and detailed marking schemes.',
        price: 19.99,
        category: 'General',
        coverImage: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=500&auto=format&fit=crop',
        previewUrl: null,
        featured: false,
        publishedDate: new Date(2023, 10, 15).toISOString(),
        isActive: true,
        stripeProductId: 'mock_stripe_prod_6',
        stripePriceId: 'mock_stripe_price_6',
        createdAt: new Date(2023, 10, 10).toISOString(),
        updatedAt: new Date(2023, 10, 10).toISOString()
    }
];

// Mock purchases data
const mockPurchases: Purchase[] = [
    {
        _id: 'purchase_1',
        user: {
            _id: 'user123',
            username: 'testuser'
        },
        product: {
            _id: 'prod1',
            title: '11+ Mathematics Practice Workbook',
            price: 12.99
        },
        stripeSessionId: 'mock_session_1',
        stripePaymentIntentId: 'mock_pi_1',
        amount: 12.99,
        currency: 'gbp',
        status: 'completed',
        accessExpires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        downloadCount: 2,
        lastDownloaded: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
        _id: 'purchase_2',
        user: {
            _id: 'user123',
            username: 'testuser'
        },
        product: {
            _id: 'prod2',
            title: '11+ English Comprehension Guide',
            price: 14.99
        },
        stripeSessionId: 'mock_session_2',
        stripePaymentIntentId: 'mock_pi_2',
        amount: 14.99,
        currency: 'gbp',
        status: 'completed',
        accessExpires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        downloadCount: 1,
        lastDownloaded: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
    }
];

// Create a mock response with proper Axios response structure
const createMockResponse = <T>(data: T): AxiosResponse<T> => {
    return {
        data,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any
    };
};

// Mock product service
export const mockProductService = {
    getProducts: async (params?: any): Promise<AxiosResponse<Product[]>> => {
        logger.info('Using mock product data with params:', params);
        
        // Filter products based on params
        let filteredProducts = [...mockProducts];
        
        if (params?.category && params.category !== 'all') {
            filteredProducts = filteredProducts.filter(p => p.category === params.category);
        }
        
        if (params?.featured) {
            filteredProducts = filteredProducts.filter(p => p.featured);
        }
        
        // Simulate API delay
        await mockDelay(800);
        
        return createMockResponse(filteredProducts);
    },
    
    getProduct: async (id: string): Promise<AxiosResponse<Product>> => {
        logger.info('Using mock product data for ID:', id);
        
        // Find the product by ID
        const product = mockProducts.find(p => p._id === id);
        
        if (!product) {
            throw new Error('Product not found');
        }
        
        // Simulate API delay
        await mockDelay(500);
        
        return createMockResponse(product);
    },
    
    createCheckout: async (productId: string): Promise<AxiosResponse<{ url: string }>> => {
        logger.info('Using mock checkout for product ID:', productId);
        
        // Simulate API delay
        await mockDelay(500);
        
        // Return mock checkout URL
        return createMockResponse({
            url: `https://mock-checkout.stripe.com/pay/${productId}?session=mock_session_${Date.now()}`
        });
    },
    
    verifyCheckout: async (sessionId: string): Promise<AxiosResponse<Purchase>> => {
        logger.info('Using mock verify checkout for session ID:', sessionId);
        
        // Simulate API delay
        await mockDelay(800);
        
        // Return mock purchase data
        return createMockResponse({
            _id: 'purchase_' + Date.now(),
            user: {
                _id: 'user123',
                username: 'testuser'
            },
            product: {
                _id: 'prod1',
                title: '11+ Mathematics Practice Workbook',
                price: 12.99
            },
            stripeSessionId: sessionId,
            stripePaymentIntentId: 'mock_pi_' + Date.now(),
            amount: 12.99,
            currency: 'gbp',
            status: 'completed',
            accessExpires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
            downloadCount: 0,
            lastDownloaded: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });
    },
    
    getUserPurchases: async (): Promise<AxiosResponse<Purchase[]>> => {
        logger.info('Using mock user purchases data');
        
        // Simulate API delay
        await mockDelay(800);
        
        // Return mock purchases data
        return createMockResponse(mockPurchases);
    },
    
    getDownloadLink: async (purchaseId: string): Promise<AxiosResponse<DownloadLink>> => {
        logger.info('Using mock download link for purchase ID:', purchaseId);
        
        // Simulate API delay
        await mockDelay(500);
        
        // Return mock download link
        return createMockResponse({
            downloadUrl: `https://mock-download.harmoni.com/files/${purchaseId}?token=mock_token_${Date.now()}`
        });
    }
}; 