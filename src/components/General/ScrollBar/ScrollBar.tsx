import React, { useEffect, useRef, useState } from "react";
import styles from "./Scrollbar.module.scss";

interface ScrollbarProps {
  children: React.ReactNode;
}

const Scrollbar: React.FC<ScrollbarProps> = ({ children }) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const [thumbHeight, setThumbHeight] = useState(50);
  const [visible, setVisible] = useState(true);

  // Met à jour la taille et la position du thumb
  const updateThumb = () => {
    const content = contentRef.current;
    const thumb = thumbRef.current;
    if (!content || !thumb) return;

    const contentHeight = content.scrollHeight;
    const visibleHeight = window.innerHeight;
    const scrollTop = window.scrollY || window.pageYOffset;

    const newThumbHeight = Math.max(
      (visibleHeight / contentHeight) * visibleHeight,
      50
    );
    setThumbHeight(newThumbHeight);

    const maxThumbTop = visibleHeight - newThumbHeight;
    const thumbTop = Math.min(
      (scrollTop / (contentHeight - visibleHeight)) * maxThumbTop,
      maxThumbTop
    );
    thumb.style.top = `${thumbTop}px`;
  };

  // Vérifie overflow du body
  const checkOverflow = () => {
    const overflow = window.getComputedStyle(document.body).overflow;
    setVisible(overflow !== "hidden");
  };

  useEffect(() => {
    const handleResize = () => {
      updateThumb();
      checkOverflow();
    };

    window.addEventListener("scroll", updateThumb);
    window.addEventListener("resize", handleResize);

    const observer = new MutationObserver(checkOverflow);
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["style"],
    });

    updateThumb();
    checkOverflow();

    return () => {
      window.removeEventListener("scroll", updateThumb);
      window.removeEventListener("resize", handleResize);
      observer.disconnect();
    };
  }, []);

  // Drag pour scroller via le thumb
  useEffect(() => {
    const thumb = thumbRef.current;
    if (!thumb) return;

    let isDragging = false;
    let startY = 0;
    let startScroll = 0;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      startY = e.clientY;
      startScroll = window.scrollY || window.pageYOffset;
      document.body.style.userSelect = "none"; // bloque la sélection de texte
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging || !contentRef.current) return;
      const contentHeight = contentRef.current.scrollHeight;
      const visibleHeight = window.innerHeight;
      const maxThumbTop = visibleHeight - thumbHeight;
      const deltaY = e.clientY - startY;
      const scrollDelta =
        (deltaY / maxThumbTop) * (contentHeight - visibleHeight);
      window.scrollTo({ top: startScroll + scrollDelta });
    };

    const onMouseUp = () => {
      isDragging = false;
      document.body.style.userSelect = "auto";
    };

    thumb.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    return () => {
      thumb.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [thumbHeight]);

  return (
    <>
      <div className={`${styles.scrollbar} ${!visible ? styles.hidden : ""}`}>
        <div
          className={styles.thumb}
          ref={thumbRef}
          style={{ height: `${thumbHeight}px` }}
        />
      </div>
      <div ref={contentRef} className={styles.content}>
        {children}
      </div>
    </>
  );
};

export default Scrollbar;
