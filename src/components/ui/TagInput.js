import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Tag, ChevronDown } from 'lucide-react';

const TagInput = ({ 
  tags = [], 
  onChange, 
  suggestions = [], 
  placeholder = "Add tags...",
  maxTags = 10 
}) => {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef(null);

  const normalizeTag = (tag) => {
    return tag.toLowerCase().trim().replace(/\s+/g, '-');
  };

  const filteredSuggestions = suggestions.filter(suggestion => 
    suggestion.toLowerCase().includes(inputValue.toLowerCase()) &&
    !tags.includes(normalizeTag(suggestion))
  ).slice(0, 8);

  const addTag = (tag) => {
    const normalizedTag = normalizeTag(tag);
    if (normalizedTag && !tags.includes(normalizedTag) && tags.length < maxTags) {
      onChange([...tags, normalizedTag]);
    }
    setInputValue('');
    setShowSuggestions(false);
    setSelectedIndex(-1);
  };

  const removeTag = (tagToRemove) => {
    onChange(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (selectedIndex >= 0 && filteredSuggestions[selectedIndex]) {
        addTag(filteredSuggestions[selectedIndex]);
      } else if (inputValue.trim()) {
        addTag(inputValue);
      }
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => 
        prev < filteredSuggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    setShowSuggestions(value.length > 0);
    setSelectedIndex(-1);
  };

  const handleSuggestionClick = (suggestion) => {
    addTag(suggestion);
  };

  useEffect(() => {
    if (selectedIndex >= 0 && filteredSuggestions[selectedIndex]) {
      setInputValue(filteredSuggestions[selectedIndex]);
    }
  }, [selectedIndex, filteredSuggestions]);

  return (
    <div className="relative">
      <div className="min-h-[42px] p-2 border border-border-light dark:border-border-dark rounded-xl bg-background-light dark:bg-background-dark focus-within:ring-2 focus-within:ring-primary-light dark:focus-within:ring-primary-dark focus-within:border-transparent">
        <div className="flex flex-wrap gap-2 items-center">
          {/* Existing Tags */}
          <AnimatePresence>
            {tags.map((tag) => (
              <motion.span
                key={tag}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="inline-flex items-center px-2 py-1 text-xs rounded-lg bg-primary-light/10 text-primary-light dark:bg-primary-dark/10 dark:text-primary-dark border border-primary-light/20 dark:border-primary-dark/20"
              >
                <Tag className="h-3 w-3 mr-1" />
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="ml-1 hover:text-danger-light dark:hover:text-danger-dark transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </motion.span>
            ))}
          </AnimatePresence>

          {/* Input */}
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowSuggestions(inputValue.length > 0)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            placeholder={tags.length === 0 ? placeholder : ''}
            disabled={tags.length >= maxTags}
            className="flex-1 min-w-[120px] bg-transparent text-text-primary-light dark:text-text-primary-dark placeholder-text-secondary-light dark:placeholder-text-secondary-dark focus:outline-none disabled:opacity-50"
          />
        </div>
      </div>

      {/* Tag Counter */}
      {tags.length > 0 && (
        <div className="flex items-center justify-between mt-1 text-xs text-text-secondary-light dark:text-text-secondary-dark">
          <span>{tags.length} / {maxTags} tags</span>
          <span>Press Enter or comma to add</span>
        </div>
      )}

      {/* Suggestions Dropdown */}
      <AnimatePresence>
        {showSuggestions && filteredSuggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 w-full mt-1 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-xl shadow-lg max-h-48 overflow-y-auto"
          >
            <div className="p-2">
              <div className="text-xs text-text-secondary-light dark:text-text-secondary-dark mb-2 px-2">
                Suggested tags
              </div>
              {filteredSuggestions.map((suggestion, index) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => handleSuggestionClick(suggestion)}
                  className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                    index === selectedIndex
                      ? 'bg-primary-light/10 text-primary-light dark:bg-primary-dark/10 dark:text-primary-dark'
                      : 'text-text-primary-light dark:text-text-primary-dark hover:bg-background-light dark:hover:bg-background-dark'
                  }`}
                >
                  <div className="flex items-center">
                    <Tag className="h-3 w-3 mr-2 text-text-secondary-light dark:text-text-secondary-dark" />
                    {suggestion}
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TagInput;