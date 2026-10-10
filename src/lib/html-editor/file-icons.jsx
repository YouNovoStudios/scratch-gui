import React from 'react';

// HTML (.html / .htm) - Orange
const HtmlIcon = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect width="16" height="16" rx="2" fill="#E8590C" />
        <text x="8" y="12" textAnchor="middle" fontSize="7" fontWeight="bold" fill="#fff" fontFamily="monospace">{'</>'}</text>
    </svg>
);

// CSS (.css) - Blue
const CssIcon = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect width="16" height="16" rx="2" fill="#1971C2" />
        <text x="8" y="12" textAnchor="middle" fontSize="6.5" fontWeight="bold" fill="#fff" fontFamily="monospace">CSS</text>
    </svg>
);

// JS (.js) - Yellow
const JsIcon = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect width="16" height="16" rx="2" fill="#E0A800" />
        <text x="8" y="12" textAnchor="middle" fontSize="7" fontWeight="bold" fill="#000" fontFamily="monospace">JS</text>
    </svg>
);

// Image (.png/.jpg/.jpeg/.gif/.webp/.svg) - Neutral gray
const ImageIcon = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect width="16" height="16" rx="2" fill="#868E96" />
        <rect x="2" y="4" width="12" height="8" rx="1" fill="none" stroke="#fff" strokeWidth="1.2" />
        <circle cx="5.5" cy="7" r="1.2" fill="#fff" />
        <polyline points="2,11 5.5,7.5 8.5,10 11,8 14,11" fill="none" stroke="#fff" strokeWidth="1.2" strokeLinejoin="round" />
    </svg>
);

// Unknown / no extension - Gray generic file
const GenericIcon = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect width="16" height="16" rx="2" fill="#ADB5BD" />
        <rect x="4" y="4" width="8" height="1.5" rx="0.75" fill="#fff" />
        <rect x="4" y="7" width="8" height="1.5" rx="0.75" fill="#fff" />
        <rect x="4" y="10" width="5" height="1.5" rx="0.75" fill="#fff" />
    </svg>
);

const IMAGE_EXTS = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'];

/**
 * Returns the appropriate icon component for a given filename.
 * Uses the file extension (case-insensitive) to determine the type.
 * @param {string} name - The filename (e.g. "index.html", "style.css")
 * @returns {React.ReactElement}
 */
const FileIcon = ({name}) => {
    if (!name || typeof name !== 'string') return <GenericIcon />;
    const dotIdx = name.lastIndexOf('.');
    if (dotIdx === -1) return <GenericIcon />;
    const ext = name.slice(dotIdx + 1).toLowerCase();
    if (ext === 'html' || ext === 'htm') return <HtmlIcon />;
    if (ext === 'css') return <CssIcon />;
    if (ext === 'js') return <JsIcon />;
    if (IMAGE_EXTS.includes(ext)) return <ImageIcon />;
    return <GenericIcon />;
};

export {FileIcon, HtmlIcon, CssIcon, JsIcon, ImageIcon, GenericIcon};
