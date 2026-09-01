import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import ModalCV from "./ModalCV";

interface ModalCVContextType {
  isModalOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
}

const ModalCVContext = createContext<ModalCVContextType | undefined>(undefined);

export const ModalCVProvider = ({ children }: { children: ReactNode }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <ModalCVContext.Provider value={{ isModalOpen, openModal, closeModal }}>
      {children}
      {/* Render the modal only once here to avoid the flash on resize */}
      <ModalCV isOpen={isModalOpen} onClose={closeModal} />
    </ModalCVContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useModalCV = () => {
  const context = useContext(ModalCVContext);
  if (context === undefined) {
    throw new Error("useModalCV must be used within a ModalCVProvider");
  }
  return context;
};

