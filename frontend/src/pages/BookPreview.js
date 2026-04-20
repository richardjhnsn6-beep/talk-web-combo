import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  getBilingualForChapter,
  chapterMetadata,
} from '../data/amosBilingualData';

/**
 * BookPreview - internal print-ready mockup of the complete Book of Amos
 * so the author can see exactly what the physical book will look like
 * before it ever goes on sale. Admin-only (wrapped in AdminLogin).
 */
const BookPreview = () => {
  const chaptersData = useMemo(
    () =>
      chapterMetadata.map((meta) => ({
        ...meta,
        verses: getBilingualForChapter(meta.num),
      })),
    []
  );

  const totalVerses = chaptersData.reduce(
    (sum, ch) => sum + ch.verses.length,
    0
  );

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-stone-100" data-testid="book-preview-page">
      {/* Toolbar - hidden on print */}
      <div
        className="sticky top-0 z-50 bg-slate-900 text-white shadow-lg print:hidden"
        data-testid="book-preview-toolbar"
      >
        <div className="max-w-5xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              to="/book-of-amos"
              className="text-sm text-slate-300 hover:text-white underline underline-offset-4"
              data-testid="book-preview-back-link"
            >
              &larr; Back to editor
            </Link>
            <span className="hidden sm:inline text-slate-500">|</span>
            <span className="text-sm text-amber-300 font-semibold">
              INTERNAL BOOK PREVIEW &mdash; NOT FOR DISTRIBUTION
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden md:inline text-xs text-slate-400">
              {chaptersData.length} chapters &middot; {totalVerses} verses
            </span>
            <button
              onClick={handlePrint}
              className="bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold px-4 py-2 rounded-md text-sm transition-colors"
              data-testid="book-preview-print-btn"
            >
              🖨 Print book
            </button>
          </div>
        </div>
      </div>

      {/* Book pages container */}
      <div className="max-w-4xl mx-auto py-10 px-4 print:p-0 print:max-w-none">
        {/* ==================== COVER ==================== */}
        <section
          className="book-page relative bg-gradient-to-br from-teal-800 via-teal-900 to-slate-900 text-white shadow-2xl rounded-sm overflow-hidden mb-8 print:mb-0 print:rounded-none print:shadow-none"
          style={{ aspectRatio: '6 / 9', minHeight: '780px' }}
          data-testid="book-preview-cover"
        >
          {/* Background: King Tutmoses image */}
          <img
            src={`${process.env.REACT_APP_BACKEND_URL}/api/images/tutmoses_book_cover.png`}
            alt="King Tutmoses"
            className="absolute inset-0 w-full h-full object-cover opacity-90"
            data-testid="book-preview-cover-image"
          />
          {/* Dark overlay gradients for text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/70 via-transparent to-slate-900/80" />

          {/* Decorative ornamental frame */}
          <div className="absolute inset-6 border-2 border-amber-300/60 rounded-sm" />
          <div className="absolute inset-10 border border-amber-300/30 rounded-sm" />

          <div className="absolute top-0 left-0 right-0 flex flex-col items-center text-center px-10 pt-20">
            <p className="uppercase tracking-[0.35em] text-amber-200 text-xs mb-6 drop-shadow-lg">
              Copyrighted &middot; Notarized
            </p>
            <h1
              className="font-serif text-5xl md:text-6xl font-bold leading-tight mb-4 drop-shadow-2xl"
              style={{ fontFamily: 'Georgia, "Times New Roman", serif', textShadow: '2px 2px 8px rgba(0,0,0,0.9)' }}
              data-testid="book-preview-cover-title"
            >
              The Book of Amos
            </h1>
            <div className="w-24 h-px bg-amber-300 mb-4" />
            <p className="text-amber-100 text-base italic font-serif drop-shadow-lg" style={{ textShadow: '1px 1px 4px rgba(0,0,0,0.9)' }}>
              Translated from the Original
              <br />
              20-Letter Ancient Hebrew System
            </p>
          </div>

          <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center text-center px-10 pb-16">
            <div className="w-24 h-px bg-amber-300 mb-6" />
            <p
              className="text-white text-lg font-serif drop-shadow-lg"
              style={{ textShadow: '1px 1px 4px rgba(0,0,0,0.9)' }}
              data-testid="book-preview-cover-author"
            >
              By Richard Johnson
            </p>
            <p className="text-amber-200 text-sm mt-1 tracking-widest drop-shadow-lg" style={{ textShadow: '1px 1px 4px rgba(0,0,0,0.9)' }}>
              RJHNSN12
            </p>
          </div>
        </section>

        {/* ==================== COPYRIGHT PAGE ==================== */}
        <section
          className="book-page bg-white shadow-lg rounded-sm p-12 mb-8 print:mb-0 print:shadow-none print:rounded-none break-before-page"
          style={{ minHeight: '780px' }}
          data-testid="book-preview-copyright"
        >
          <div className="font-serif text-slate-700 text-sm leading-relaxed max-w-xl mx-auto h-full flex flex-col justify-center">
            <p className="text-center font-semibold mb-6 text-base">
              The Book of Amos
            </p>
            <p className="text-center mb-10 italic">
              Original 20-Letter Ancient Hebrew Translation
            </p>

            <p className="mb-4">
              Copyright &copy; 2026 Richard Johnson (RJHNSN12).
              <br />
              All rights reserved.
            </p>
            <p className="mb-4">
              No part of this book may be reproduced, stored in a retrieval
              system, or transmitted in any form or by any means &mdash;
              electronic, mechanical, photocopy, recording, or otherwise &mdash;
              without the prior written permission of the author.
            </p>
            <p className="mb-4">
              This translation preserves the authentic 20-letter ancient Hebrew
              system and is notarized as an original work of biblical
              scholarship.
            </p>
            <p className="mt-10 text-xs text-slate-500 text-center">
              Published by rjhnsn12 &middot; Biblical Truth &amp; History
              <br />
              First Edition &middot; 2026
            </p>
          </div>
        </section>

        {/* ==================== TABLE OF CONTENTS ==================== */}
        <section
          className="book-page bg-white shadow-lg rounded-sm p-12 mb-8 print:mb-0 print:shadow-none print:rounded-none break-before-page"
          style={{ minHeight: '780px' }}
          data-testid="book-preview-toc"
        >
          <h2 className="font-serif text-4xl text-center text-slate-800 mb-2">
            Contents
          </h2>
          <div className="w-16 h-px bg-amber-600 mx-auto mb-10" />

          <ul className="font-serif text-slate-800 max-w-xl mx-auto space-y-3 text-lg">
            {chaptersData.map((ch) => (
              <li
                key={ch.num}
                className="flex items-baseline gap-3 border-b border-dotted border-slate-300 pb-1"
                data-testid={`book-preview-toc-ch${ch.num}`}
              >
                <span className="font-semibold w-24">Chapter {ch.num}</span>
                <span className="flex-1 truncate italic text-slate-600">
                  {ch.title}
                </span>
                {ch.bilingualStatus === 'draft' && (
                  <span className="text-xs uppercase tracking-wider text-amber-700 font-semibold print:hidden">
                    Draft
                  </span>
                )}
              </li>
            ))}
            <li className="flex items-baseline gap-3 border-b border-dotted border-slate-300 pb-1 mt-6">
              <span className="font-semibold w-24">Appendix</span>
              <span className="flex-1 italic text-slate-600">
                Master Hebrew Concordance (Chapters 1&ndash;9)
              </span>
            </li>
          </ul>
        </section>

        {/* ==================== CHAPTERS ==================== */}
        {chaptersData.map((ch) => (
          <section
            key={ch.num}
            className="book-page bg-white shadow-lg rounded-sm p-12 mb-8 print:mb-0 print:shadow-none print:rounded-none break-before-page"
            data-testid={`book-preview-ch${ch.num}`}
          >
            {/* Chapter heading */}
            <div className="text-center mb-10">
              <p className="uppercase tracking-[0.3em] text-xs text-amber-700 mb-2">
                Chapter {ch.num}
              </p>
              <h2 className="font-serif text-3xl text-slate-800 mb-3">
                {ch.title}
              </h2>
              <div className="w-16 h-px bg-amber-600 mx-auto" />
              {ch.bilingualStatus === 'draft' && (
                <p className="mt-4 text-xs uppercase tracking-wider text-amber-700 font-semibold bg-amber-50 border border-amber-300 inline-block px-3 py-1 rounded print:hidden">
                  Draft &mdash; Under review by Richard Johnson
                </p>
              )}
            </div>

            {/* Verses - bilingual two-column */}
            <div className="space-y-4">
              {ch.verses.length === 0 && (
                <p className="text-center text-slate-500 italic">
                  (Content coming soon)
                </p>
              )}
              {ch.verses.map((v, idx) => (
                <div
                  key={`ch${ch.num}-${v.verse}-${idx}`}
                  className="grid grid-cols-2 gap-6 pb-3 border-b border-slate-100 last:border-b-0 avoid-break-inside"
                  data-testid={`book-preview-verse-${ch.num}-${v.verse}`}
                >
                  <p className="font-serif text-slate-800 leading-relaxed text-[15px]">
                    {v.verse && (
                      <span className="font-bold text-amber-700 mr-2">
                        {v.verse}
                      </span>
                    )}
                    {v.hebrew}
                  </p>
                  <p className="font-serif text-slate-800 leading-relaxed text-[15px]">
                    {v.verse && (
                      <span className="font-bold text-amber-700 mr-2">
                        {v.verse}
                      </span>
                    )}
                    {v.english}
                  </p>
                </div>
              ))}
            </div>

            {/* Page footer */}
            <div className="mt-10 pt-4 border-t border-slate-200 flex justify-between text-xs text-slate-500 font-serif">
              <span>The Book of Amos</span>
              <span>Chapter {ch.num}</span>
            </div>
          </section>
        ))}

        {/* ==================== BACK COVER / CLOSING ==================== */}
        <section
          className="book-page bg-gradient-to-br from-slate-900 via-teal-900 to-teal-800 text-white shadow-2xl rounded-sm p-12 mb-8 print:mb-0 print:shadow-none print:rounded-none break-before-page flex items-center justify-center"
          style={{ minHeight: '780px', aspectRatio: '6 / 9' }}
          data-testid="book-preview-back-cover"
        >
          <div className="absolute-free text-center max-w-xl">
            <div className="text-amber-300/60 text-4xl mb-6">✦</div>
            <p className="font-serif italic text-xl leading-relaxed mb-8 text-amber-50">
              "Experience the original 20-letter ancient Hebrew system &mdash;
              the authentic foundation the Book of Amos was written upon,
              preserved here for serious students of scripture."
            </p>
            <div className="w-24 h-px bg-amber-300 mx-auto mb-6" />
            <p className="font-serif text-sm text-amber-200">
              &mdash; Richard Johnson (RJHNSN12)
            </p>
            <p className="mt-12 text-xs uppercase tracking-widest text-amber-300/70">
              rjhnsn12 &middot; Biblical Truth &amp; History
            </p>
          </div>
        </section>
      </div>

      {/* Print-specific styles */}
      <style>{`
        @media print {
          @page {
            size: 6in 9in;
            margin: 0.75in;
          }
          body {
            background: white !important;
          }
          .book-page {
            page-break-after: always;
            background: white !important;
            box-shadow: none !important;
            border-radius: 0 !important;
            min-height: auto !important;
          }
          .avoid-break-inside {
            page-break-inside: avoid;
          }
          .break-before-page {
            page-break-before: always;
          }
        }
      `}</style>
    </div>
  );
};

export default BookPreview;
