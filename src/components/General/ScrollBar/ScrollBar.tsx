import React, { useEffect, useRef, useState } from "react";
import styles from "./scrollbar.module.scss";

interface ScrollbarProps {
  children: React.ReactNode;
}

const Scrollbar: React.FC<ScrollbarProps> = ({ children }) => {
  const contentRef = useRef(document.documentElement);
  const thumbRef = useRef<HTMLDivElement>(null);
  const [thumbHeight, setThumbHeight] = useState(50);
  const [visible, setVisible] = useState(true);

  const updateThumb = () => {
    const content = contentRef.current;
    const thumb = thumbRef.current;
    if (!content || !thumb) return;

    const contentHeight = content.scrollHeight;
    const visibleHeight = window.innerHeight;
    const scrollTop = window.scrollY;

    if (contentHeight <= visibleHeight) {
      setVisible(false);
      return;
    } else {
      setVisible(true);
    }

    const newThumbHeight = Math.max(
      (visibleHeight / contentHeight) * visibleHeight,
      50
    );
    setThumbHeight(newThumbHeight);

    const maxThumbTop = visibleHeight - newThumbHeight;
    const thumbTop =
      (scrollTop / (contentHeight - visibleHeight)) * maxThumbTop;
    thumb.style.top = `${Math.min(Math.max(thumbTop, 0), maxThumbTop)}px`;
  };

  useEffect(() => {
    const handleResize = () => {
      updateThumb();
    };

    window.addEventListener("scroll", updateThumb);
    window.addEventListener("resize", handleResize);
    updateThumb();

    return () => {
      window.removeEventListener("scroll", updateThumb);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    const thumb = thumbRef.current;
    if (!thumb) return;

    let isDragging = false;
    let startY = 0;
    let startScroll = 0;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      startY = e.clientY;
      startScroll = window.scrollY;
      document.body.style.userSelect = "none";
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const visibleHeight = window.innerHeight;
      const contentHeight = contentRef.current.scrollHeight;
      const maxThumbTop = visibleHeight - thumbHeight;
      const deltaY = e.clientY - startY;
      const scrollDelta =
        (deltaY / maxThumbTop) * (contentHeight - visibleHeight);
      window.scrollTo({ top: startScroll + scrollDelta, behavior: "auto" });
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
      {children}
    </>
  );
};

export default Scrollbar;
