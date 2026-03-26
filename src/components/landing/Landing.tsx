'use client';

import { useEffect, useRef } from 'react';
import styles from './Landing.module.css';

const TOP_BOOKS = [
  '0374533555',  // Thinking, Fast and Slow
  '0062316095',  // Sapiens
  '0735211299',  // Atomic Habits
  '9780743273565', // The Great Gatsby
  '0061120081',  // To Kill a Mockingbird
  '9780451524935', // 1984
  '0060850523',  // Brave New World
  '0062315005',  // The Alchemist
  '0140449337',  // Meditations
  '080701429X',  // Man's Search for Meaning
  '1455586692',  // Deep Work
  '0804139296',  // Zero to One
  '0307887898',  // The Lean Startup
  '0399590501',  // Educated
  '1524763136',  // Becoming
  '0441172717',  // Dune
  '0316769487',  // The Catcher in the Rye
  '0486415872',  // Crime and Punishment
  '0553208845',  // Siddhartha
  '1577314808',  // The Power of Now
  '1603580557',  // Thinking in Systems
  '0066620996',  // Good to Great
  '0735214484',  // Range
  '0316017930',  // Outliers
  '0465050654',  // The Design of Everyday Things
  '0812975219',  // Fooled by Randomness
  '081297381X',  // The Black Swan
  '0525559477',  // The Midnight Library
  '0593135202',  // Project Hail Mary
  '1501135910',  // Shoe Dog
];

interface LandingProps {
  onSignIn: () => void;
  error?: string | null;
  onClearError?: () => void;
}

export function Landing({ onSignIn, error, onClearError }: LandingProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const scrollState = useRef({
    current: 0,
    target: 0,
    velocity: 0,
    isDragging: false,
    lastX: 0,
  });
  const rafRef = useRef<number>(0);

  // Carousel animation
  useEffect(() => {
    const CARD_WIDTH = 220;
    const AUTO_SPEED = 0.5;
    const state = scrollState.current;

    function animate() {
      if (!state.isDragging) {
        state.target += state.velocity;
        state.velocity *= 0.95;
        state.target += AUTO_SPEED;
      }

      state.current += (state.target - state.current) * 0.1;

      const count = TOP_BOOKS.length;
      const totalSetWidth = count * CARD_WIDTH;

      cardRefs.current.forEach((card, index) => {
        if (!card) return;

        let vPos = index * CARD_WIDTH - state.current;
        while (vPos < -totalSetWidth / 2) vPos += totalSetWidth;
        while (vPos > totalSetWidth / 2) vPos -= totalSetWidth;

        if (Math.abs(vPos) < window.innerWidth) {
          card.style.display = 'block';
          const progress = vPos / (window.innerWidth / 1.5);
          const z = -Math.pow(Math.abs(progress), 2) * 500;
          const rotateY = progress * 45;
          card.style.transform = `translateX(${vPos}px) translateZ(${z}px) rotateY(${rotateY}deg)`;
          card.style.opacity = String(Math.max(0, 1 - Math.pow(Math.abs(progress), 3)));
        } else {
          card.style.display = 'none';
        }
      });

      rafRef.current = requestAnimationFrame(animate);
    }

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  // Drag handlers
  useEffect(() => {
    const vp = viewportRef.current;
    if (!vp) return;
    const state = scrollState.current;

    const onDown = (x: number) => {
      state.isDragging = true;
      state.lastX = x;
      state.velocity = 0;
      vp.style.cursor = 'grabbing';
    };
    const onUp = () => {
      state.isDragging = false;
      vp.style.cursor = 'grab';
    };
    const onMove = (x: number) => {
      if (!state.isDragging) return;
      const delta = x - state.lastX;
      state.lastX = x;
      state.target -= delta * 1.5;
      state.velocity = -delta * 0.5;
    };

    const md = (e: MouseEvent) => onDown(e.clientX);
    const mu = () => onUp();
    const mm = (e: MouseEvent) => onMove(e.clientX);
    const ts = (e: TouchEvent) => onDown(e.touches[0].clientX);
    const te = () => onUp();
    const tm = (e: TouchEvent) => onMove(e.touches[0].clientX);

    vp.addEventListener('mousedown', md);
    window.addEventListener('mouseup', mu);
    window.addEventListener('mousemove', mm);
    vp.addEventListener('touchstart', ts);
    window.addEventListener('touchend', te);
    window.addEventListener('touchmove', tm);

    return () => {
      vp.removeEventListener('mousedown', md);
      window.removeEventListener('mouseup', mu);
      window.removeEventListener('mousemove', mm);
      vp.removeEventListener('touchstart', ts);
      window.removeEventListener('touchend', te);
      window.removeEventListener('touchmove', tm);
    };
  }, []);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.brand}>LASTING PAGES</div>
        <div className={styles.meta}>
          REMEMBER WHAT<br />
          YOU READ
        </div>
      </header>

      <div className={styles.viewport} ref={viewportRef}>
        <div className={styles.strip}>
          {TOP_BOOKS.map((isbn, i) => (
            <div
              key={isbn}
              ref={el => { cardRefs.current[i] = el; }}
              className={styles.card}
            >
              <img
                src={`https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`}
                alt=""
                className={styles.cardImg}
              />
            </div>
          ))}
        </div>
      </div>

      <div className={styles.bottomCta}>
        <span className={styles.tagline}>search everything you've ever read</span>
        <button className={styles.ctaButton} onClick={onSignIn}>
          GET STARTED
        </button>
        {error && (
          <div className={styles.error}>
            <span>{error}</span>
            <button className={styles.errorDismiss} onClick={onClearError}>dismiss</button>
          </div>
        )}
      </div>

      <div className={styles.overlay} id="overlay">
        <div className={styles.loaderText}>LOADING LIBRARY...</div>
      </div>
    </div>
  );
}
