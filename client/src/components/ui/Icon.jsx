import React from 'react';
import { 
    LogIn, LogOut, Link, Award, History, RefreshCw, Sparkles, Copy, Trash2, 
    ArrowUpCircle, ArrowDownCircle, BarChart2, Loader 
} from 'lucide-react';

const icons = {
    login: LogIn, logout: LogOut, link: Link, award: Award, history: History,
    refresh: RefreshCw, sparkles: Sparkles, copy: Copy, trash: Trash2,
    arrowUp: ArrowUpCircle, arrowDown: ArrowDownCircle, barChart: BarChart2, loader: Loader,
};

export const Icon = ({ name, className = '', ...props }) => {
    const LucideIcon = icons[name];
    if (!LucideIcon) return null;
    return <LucideIcon className={className} {...props} />;
};