'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faTimes } from '@fortawesome/free-solid-svg-icons';
import { faGithub } from '@fortawesome/free-brands-svg-icons';

type HamburgerMenuProps = {
  isLoggedIn: boolean;
};

export default function HamburgerMenu({ isLoggedIn }: HamburgerMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  // ========== FOCUS TRAPPING START ==========
  // Trap Tab navigation within the menu when it's open
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle Tab key
      if (e.key !== 'Tab') return;

      // Find all focusable elements in the menu
      const focusableElements = menuRef.current?.querySelectorAll(
        'a[href], button:not([disabled])'
      );
      if (!focusableElements || focusableElements.length === 0) return;

      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[
        focusableElements.length - 1
      ] as HTMLElement;

      // If Shift+Tab on first element, loop to last element
      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      }
      // If Tab on last element, loop back to first element
      else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);
  // ========== FOCUS TRAPPING END ==========

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  return (
    <div className="relative md:hidden" ref={menuRef}>
      <button
        ref={buttonRef}
        onClick={toggleMenu}
        className="relative z-20 text-white"
        aria-label="Toggle mobile menu"
        aria-expanded={!!isOpen}
      >
        <FontAwesomeIcon icon={isOpen ? faTimes : faBars} className="h-6 w-6" />
      </button>
      {isOpen && (
        <nav
          aria-label="mobile navigation"
          className="absolute left-0 right-0 top-full z-50 mt-2 w-screen bg-gray-800 p-6"
        >
          <ul className="space-y-6">
            <li className="relative z-50">
              <Link
                href="/"
                className="block w-full text-white transition-all hover:text-teal-600"
                onClick={toggleMenu}
              >
                Home
              </Link>
            </li>
            {isLoggedIn && (
              <li className="relative z-50">
                <Link
                  href="/userposts"
                  className="block w-full text-white transition-all hover:text-teal-600"
                  onClick={toggleMenu}
                >
                  User's Posts
                </Link>
              </li>
            )}

            <li className="relative z-50">
              <Link
                href="/halftone-waves"
                className="block w-full text-white transition-all hover:text-teal-600"
                onClick={toggleMenu}
              >
                Waves
              </Link>
            </li>
            <li className="relative z-50">
              <Link
                href="/deep-galaxy"
                className="block w-full text-white transition-all hover:text-teal-600"
                onClick={toggleMenu}
              >
                Galaxy
              </Link>
            </li>
            <li className="relative z-50">
              <Link
                href="/edit-suggestions"
                className="block w-full text-white transition-all hover:text-teal-600"
                onClick={toggleMenu}
              >
                Edit Suggestions
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </div>
  );
}
