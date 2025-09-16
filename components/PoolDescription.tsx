import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';

interface PoolDescriptionProps {
  description?: string;
  maxLength?: number;
  className?: string;
}

export default function PoolDescription({ 
  description, 
  maxLength = 150, 
  className = '' 
}: PoolDescriptionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!description || description.trim() === '') {
    return null;
  }

  const shouldTruncate = description.length > maxLength;
  const displayText = isExpanded || !shouldTruncate 
    ? description 
    : description.substring(0, maxLength) + '...';

  return (
    <div className={`${className}`}>
      <div className="bg-gray-800/30 rounded-lg p-3 border border-gray-700/50">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-300 leading-relaxed">
              {displayText}
            </p>
          </div>
          
          {shouldTruncate && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-300 transition-colors"
              aria-label={isExpanded ? 'Show less' : 'Show more'}
            >
              {isExpanded ? (
                <ChevronUpIcon className="w-4 h-4" />
              ) : (
                <ChevronDownIcon className="w-4 h-4" />
              )}
            </motion.button>
          )}
        </div>
        
        {shouldTruncate && (
          <div className="mt-2">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              {isExpanded ? 'Show less' : 'Show more'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
